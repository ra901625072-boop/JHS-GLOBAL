import { Op, Sequelize } from 'sequelize';
import { sequelize } from '../../config/db.js';
import createSlug from '../../utils/slugify.js';
import Inquiry from '../inquiry/inquiry.model.js';
import SampleRequest from '../sample/sample.model.js';
import Product from '../product/product.model.js';
import User from '../user/user.model.js';
import Quotation from '../quotation/quotation.model.js';
import Order from '../order/order.model.js';
import Task from '../task/task.model.js';
import Customer from '../customer/customer.model.js';
import Category from '../category/category.model.js';
import Certificate from '../certificate/certificate.model.js';
import BlogPost from '../blog/blog.model.js';
import Faq from '../faq/faq.model.js';
import emailService from '../../services/email.service.js';
import cacheService from '../../services/cache.service.js';
import logger from '../../utils/logger.js';
import { recordAuditLog } from '../audit/audit.service.js';
import { formatPaginationMeta } from '../../utils/pagination.js';

export const computeSla = (inquiry) => {
  const plain = inquiry.toJSON ? inquiry.toJSON() : { ...inquiry };
  const createdDate = plain.createdAt ? new Date(plain.createdAt) : new Date();
  const slaDeadlineDate = plain.slaDeadline
    ? new Date(plain.slaDeadline)
    : new Date(createdDate.getTime() + 48 * 3600 * 1000);

  const deadlineMs = slaDeadlineDate.getTime();
  const nowMs = Date.now();
  const diffMs = deadlineMs - nowMs;
  const slaRemainingHours = Math.round((diffMs / (3600 * 1000)) * 10) / 10;

  const resolvedStatuses = ['quoted', 'sample_sent', 'negotiation', 'won', 'lost', 'spam'];
  let slaStatus = 'ok';

  if (resolvedStatuses.includes(plain.status) || plain.isSpam || plain.emailSent?.buyer) {
    slaStatus = 'resolved';
  } else if (diffMs <= 0) {
    slaStatus = 'breached';
  } else if (slaRemainingHours <= 12) {
    slaStatus = 'critical';
  } else if (slaRemainingHours <= 24) {
    slaStatus = 'warning';
  } else {
    slaStatus = 'ok';
  }

  return {
    ...plain,
    slaDeadline: slaDeadlineDate.toISOString(),
    slaRemainingHours,
    slaRemainingMs: diffMs,
    slaStatus,
  };
};

export const getDashboardMetrics = async () => {
  const DASHBOARD_CACHE_KEY = 'admin:dashboard_metrics';
  const cachedMetrics = await cacheService.get(DASHBOARD_CACHE_KEY);
  if (cachedMetrics) {
    return cachedMetrics;
  }

  const [
    totalInquiries,
    newInquiries,
    inquiriesByStatusRows,
    recentInquiriesRows,
    activeUnrepliedInquiries,
    totalProducts,
    activeProducts,
    totalSamples,
    totalQuotes,
    quotesSent,
    totalOrders,
    ordersInProcess,
    revenueSum,
    pendingTasks,
    totalCustomers,
    topCountriesRows,
  ] = await Promise.all([
    Inquiry.count(),
    Inquiry.count({ where: { status: 'new', isSpam: false } }),
    Inquiry.findAll({
      attributes: ['status', [sequelize.fn('count', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Inquiry.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'referenceNo', 'buyer', 'status', 'priority', 'items', 'createdAt', 'slaDeadline', 'isSpam', 'emailSent'],
    }),
    Inquiry.findAll({
      where: {
        status: { [Op.in]: ['new', 'in_review'] },
        isSpam: false,
      },
      attributes: ['id', 'status', 'createdAt', 'slaDeadline', 'isSpam', 'emailSent'],
    }),
    Product.count(),
    Product.count({ where: { isActive: true } }),
    SampleRequest.count(),
    Quotation.count(),
    Quotation.count({ where: { status: 'sent' } }),
    Order.count(),
    Order.count({
      where: {
        orderStatus: {
          [Op.in]: ['confirmed', 'processing', 'ready_for_shipment', 'shipped', 'in_transit'],
        },
      },
    }),
    Order.sum('totalAmount'),
    Task.count({ where: { status: 'pending' } }),
    Customer.count(),
    Inquiry.findAll({
      attributes: [
        [sequelize.literal(`COALESCE("buyer"->>'country', 'Unknown')`), 'country'],
        [sequelize.fn('count', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.literal(`COALESCE("buyer"->>'country', 'Unknown')`)],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
      raw: true,
    }),
  ]);

  const statusMap = {
    new: 0,
    in_review: 0,
    quoted: 0,
    sample_sent: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
    spam: 0,
  };

  inquiriesByStatusRows.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = parseInt(item.count, 10);
    }
  });

  const now = Date.now();
  let urgentSlaLeads = 0;
  activeUnrepliedInquiries.forEach((inq) => {
    const deadline = inq.slaDeadline
      ? new Date(inq.slaDeadline).getTime()
      : new Date(inq.createdAt || now).getTime() + 48 * 3600 * 1000;
    const remainingHours = (deadline - now) / (3600 * 1000);
    if (remainingHours <= 12) {
      urgentSlaLeads += 1;
    }
  });

  const totalRevenue = revenueSum || 0;
  const conversionRate = totalInquiries > 0 ? Number(((totalOrders / totalInquiries) * 100).toFixed(1)) : 0;

  const metrics = {
    inquiries: {
      total: totalInquiries,
      new: newInquiries,
      byStatus: statusMap,
      recent: recentInquiriesRows.map((r) => computeSla(r)),
    },
    operations: {
      newInquiries,
      urgentSlaLeads,
      pendingFollowups: pendingTasks,
      quotesSent: totalQuotes,
      awaitingReply: quotesSent,
      ordersConfirmed: totalOrders,
      ordersInProcess,
      totalRevenue,
      conversionRate,
      totalCustomers,
      topCountries: topCountriesRows.map((c) => ({
        country: c.country,
        count: parseInt(c.count, 10),
      })),
    },
    products: {
      total: totalProducts,
      active: activeProducts,
    },
    samples: {
      total: totalSamples,
    },
  };

  cacheService.set(DASHBOARD_CACHE_KEY, metrics, 30).catch(() => {});
  return metrics;
};

export const getAdminInquiries = async ({
  status,
  priority,
  q,
  country,
  page = 1,
  limit = 20,
}) => {
  const where = {};

  if (status === 'spam') {
    where[Op.or] = [{ status: 'spam' }, { isSpam: true }];
  } else if (status && status !== 'all') {
    where.status = status;
    where.isSpam = false;
  } else {
    where.status = { [Op.ne]: 'spam' };
    where.isSpam = false;
  }

  if (priority && priority !== 'all') {
    where.priority = priority;
  }

  if (country) {
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push(
      Sequelize.where(
        Sequelize.literal(`"buyer"->>'country'`),
        { [Op.iLike]: `%${country.trim()}%` }
      )
    );
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { referenceNo: { [Op.iLike]: `%${searchTerm}%` } },
      Sequelize.where(Sequelize.literal(`"buyer"->>'company'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"buyer"->>'name'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"buyer"->>'email'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"buyer"->>'country'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.cast(Sequelize.col('items'), 'text'), { [Op.iLike]: `%${searchTerm}%` }),
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Inquiry.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit: limitNum,
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    distinct: true,
  });

  return {
    inquiries: rows.map((r) => {
      const withSla = computeSla(r);
      if (withSla.assignee) {
        withSla.assignedTo = withSla.assignee;
      }
      return withSla;
    }),
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum),
    },
  };
};

export const getAdminInquiryById = async (id) => {
  const inquiry = await Inquiry.findByPk(id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
  });

  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const withSla = computeSla(inquiry);
  if (withSla.assignee) {
    withSla.assignedTo = withSla.assignee;
  }
  return withSla;
};

export const updateInquiryStatus = async (id, { status, priority, note, assignedTo }, user = null, req = null) => {
  const inquiry = await Inquiry.findByPk(id);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = inquiry.toJSON();

  if (status) inquiry.status = status;
  if (priority) inquiry.priority = priority;
  if (assignedTo !== undefined) {
    inquiry.assignedTo = assignedTo ? parseInt(assignedTo, 10) : null;
  }

  if (note && note.trim()) {
    const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
    existingNotes.push({
      by: user?.name || 'Admin',
      text: note.trim(),
      at: new Date().toISOString(),
    });
    inquiry.notes = existingNotes;
  }

  await inquiry.save();

  await recordAuditLog({
    req,
    user,
    action: 'inquiry.update_status',
    entityType: 'inquiry',
    entityId: inquiry.id,
    beforeSnapshot,
    afterSnapshot: inquiry.toJSON(),
    metadata: { status, priority, assignedTo },
  });

  cacheService.del('admin:dashboard_metrics').catch(() => {});
  logger.info(`Inquiry ${inquiry.referenceNo} updated by ${user?.name || 'Admin'} (${user?.role || 'staff'}) - Status: ${inquiry.status}`);

  return computeSla(inquiry);
};

export const sendInquiryReply = async (id, { subject, message, status = 'quoted' }, user = null, req = null) => {
  if (!id || isNaN(Number(id)) || Number(id) > 2147483647) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const inquiry = await Inquiry.findByPk(id);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  if (!inquiry.buyer?.email) {
    const error = new Error('Inquiry does not contain a valid buyer email address');
    error.statusCode = 422;
    throw error;
  }

  const beforeSnapshot = inquiry.toJSON();

  // 1. Dispatch approved email through email service
  const emailResult = await emailService.sendBuyerReply({
    to: inquiry.buyer.email,
    subject,
    message,
    referenceNo: inquiry.referenceNo,
    senderName: user?.name || 'International Trade Desk',
  });

  if (!emailResult.success) {
    logger.warn(`Failed to dispatch email to buyer ${inquiry.buyer.email}: ${emailResult.error}`);
  }

  // 2. Human approval tracking
  inquiry.status = status;
  const emailSent = inquiry.emailSent ? { ...inquiry.emailSent } : {};
  emailSent.buyer = true;
  inquiry.emailSent = emailSent;

  // 3. Record approval and audit note
  const ai = inquiry.ai ? { ...inquiry.ai } : {};
  ai.approvedBy = user?.id || null;
  ai.approvedAt = new Date().toISOString();
  ai.replySubject = subject;
  inquiry.ai = ai;

  const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
  existingNotes.push({
    by: user?.name || 'Sales Desk',
    text: `Commercial reply approved and sent to buyer (${inquiry.buyer.email}) with subject: "${subject}"`,
    at: new Date().toISOString(),
  });
  inquiry.notes = existingNotes;

  await inquiry.save();

  await recordAuditLog({
    req,
    user,
    action: 'inquiry.send_reply',
    entityType: 'inquiry',
    entityId: inquiry.id,
    beforeSnapshot,
    afterSnapshot: inquiry.toJSON(),
    metadata: { subject, recipient: inquiry.buyer?.email },
  });

  cacheService.del('admin:dashboard_metrics').catch(() => {});
  logger.info(
    `Inquiry ${inquiry.referenceNo} reply approved & sent by ${user?.name || 'Staff'} (${user?.role || 'sales'}) - Status: ${inquiry.status}`
  );

  return computeSla(inquiry);
};

export const flagInquiryAsSpam = async (id, { reason = '' } = {}, user = null, req = null) => {
  const inquiry = await Inquiry.findByPk(id);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = inquiry.toJSON();

  inquiry.status = 'spam';
  inquiry.isSpam = true;
  inquiry.spamFlaggedAt = new Date();
  inquiry.spamFlaggedBy = user?.id || null;

  const notes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
  notes.push({
    by: user?.name || 'Admin',
    text: `Marked as SPAM${reason ? `: ${reason}` : ''}`,
    at: new Date().toISOString(),
  });
  inquiry.notes = notes;

  const ai = inquiry.ai ? { ...inquiry.ai } : {};
  ai.isSpam = true;
  if (reason) ai.spamReason = reason;
  inquiry.ai = ai;

  await inquiry.save();

  await recordAuditLog({
    req,
    user,
    action: 'inquiry.spam',
    entityType: 'inquiry',
    entityId: inquiry.id,
    beforeSnapshot,
    afterSnapshot: inquiry.toJSON(),
    metadata: { reason },
  });

  cacheService.del('admin:dashboard_metrics').catch(() => {});
  logger.info(`Inquiry ${inquiry.referenceNo} marked as SPAM by ${user?.name || 'Admin'}`);

  return computeSla(inquiry);
};

export const unspamInquiry = async (id, user = null, req = null) => {
  const inquiry = await Inquiry.findByPk(id);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = inquiry.toJSON();

  inquiry.status = 'new';
  inquiry.isSpam = false;
  inquiry.spamFlaggedAt = null;
  inquiry.spamFlaggedBy = null;

  const notes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
  notes.push({
    by: user?.name || 'Admin',
    text: 'Restored from SPAM to NEW status',
    at: new Date().toISOString(),
  });
  inquiry.notes = notes;

  const ai = inquiry.ai ? { ...inquiry.ai } : {};
  ai.isSpam = false;
  inquiry.ai = ai;

  await inquiry.save();

  await recordAuditLog({
    req,
    user,
    action: 'inquiry.unspam',
    entityType: 'inquiry',
    entityId: inquiry.id,
    beforeSnapshot,
    afterSnapshot: inquiry.toJSON(),
  });

  cacheService.del('admin:dashboard_metrics').catch(() => {});
  logger.info(`Inquiry ${inquiry.referenceNo} un-spammed by ${user?.name || 'Admin'}`);

  return computeSla(inquiry);
};

export const getAdminProducts = async ({
  category,
  status,
  isFeatured,
  q,
  page = 1,
  limit = 20,
  sort = '-createdAt',
}) => {
  const where = {};

  if (status === 'active' || status === 'published') {
    where.isActive = true;
  } else if (status === 'draft' || status === 'inactive') {
    where.isActive = false;
  }

  if (isFeatured === 'true' || isFeatured === true) {
    where.isFeatured = true;
  }

  if (category && category !== 'all') {
    let catId = parseInt(category, 10);
    if (isNaN(catId)) {
      const foundCat = await Category.findOne({
        where: {
          [Op.or]: [{ slug: category }, { name: category }],
        },
      });
      if (foundCat) catId = foundCat.id;
    }
    if (catId) {
      where[Op.or] = [{ categoryId: catId }, { subCategoryId: catId }];
    }
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${searchTerm}%` } },
      { hsCode: { [Op.iLike]: `%${searchTerm}%` } },
      { slug: { [Op.iLike]: `%${searchTerm}%` } },
      { botanicalName: { [Op.iLike]: `%${searchTerm}%` } },
      Sequelize.where(
        Sequelize.cast(Sequelize.col('Product.tags'), 'text'),
        { [Op.iLike]: `%${searchTerm}%` }
      ),
    ];
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'name') order = [['name', 'ASC']];
  else if (sort === '-name') order = [['name', 'DESC']];
  else if (sort === 'hsCode') order = [['hsCode', 'ASC']];

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Product.findAndCountAll({
    where,
    order,
    offset,
    limit: limitNum,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'parentId'],
      },
      {
        model: Category,
        as: 'subCategory',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    distinct: true,
  });

  const products = rows.map((p) => {
    const plain = p.toJSON();
    return {
      ...plain,
      _id: plain.id,
    };
  });

  return {
    products,
    pagination: formatPaginationMeta(count, pageNum, limitNum),
  };
};

export const getAdminProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'parentId'],
      },
      {
        model: Category,
        as: 'subCategory',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  });

  if (!product) {
    const error = new Error('Product not found in catalogue');
    error.statusCode = 404;
    throw error;
  }

  const plain = product.toJSON();
  return {
    ...plain,
    _id: plain.id,
  };
};

export const createAdminProduct = async (productData, user = null, req = null) => {
  const slug = productData.slug || createSlug(productData.name);

  const existing = await Product.findOne({ where: { slug } });
  if (existing) {
    const error = new Error(`Product slug '${slug}' already exists. Please choose a unique name.`);
    error.statusCode = 409;
    throw error;
  }

  const categoryId = parseInt(productData.categoryId, 10);
  const subCategoryId = productData.subCategoryId ? parseInt(productData.subCategoryId, 10) : null;

  let shelfLife = productData.shelfLife;
  if (!shelfLife && productData.shelfLifeMonths) {
    shelfLife = `${productData.shelfLifeMonths} months`;
  }

  const product = await Product.create({
    ...productData,
    categoryId,
    subCategoryId,
    shelfLife: shelfLife || '24 months',
    slug,
  });

  await recordAuditLog({
    req,
    user,
    action: 'product.create',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot: null,
    afterSnapshot: product.toJSON(),
    metadata: { name: product.name, slug: product.slug, hsCode: product.hsCode },
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product created by ${user?.name || 'admin'}: ${product.name} [${product.slug}]`);

  const plain = product.toJSON();
  plain._id = product.id;
  return plain;
};

export const updateAdminProduct = async (id, productData, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();

  const updatePayload = { ...productData };
  if (productData.categoryId) {
    updatePayload.categoryId = parseInt(productData.categoryId, 10);
  }
  if (productData.subCategoryId !== undefined) {
    updatePayload.subCategoryId = productData.subCategoryId ? parseInt(productData.subCategoryId, 10) : null;
  }
  if (productData.shelfLifeMonths && !productData.shelfLife) {
    updatePayload.shelfLife = `${productData.shelfLifeMonths} months`;
  }

  await product.update(updatePayload);

  await recordAuditLog({
    req,
    user,
    action: 'product.update',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { name: product.name, slug: product.slug },
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product updated by ${user?.name || 'admin'}: ${product.name} [${product.slug}]`);

  const plain = product.toJSON();
  plain._id = product.id;
  return plain;
};

export const softDeleteAdminProduct = async (id, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  await product.update({ isActive: false });

  await recordAuditLog({
    req,
    user,
    action: 'product.delete',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { name: product.name },
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product soft-deleted by ${user?.name || 'admin'}: ${product.name}`);

  const plain = product.toJSON();
  plain._id = product.id;
  return plain;
};

export const toggleProductActive = async (id, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  const newActive = !product.isActive;
  await product.update({ isActive: newActive });

  await recordAuditLog({
    req,
    user,
    action: 'product.toggle_active',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { name: product.name, isActive: newActive },
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product ${product.name} isActive toggled to ${newActive}`);
  return { id: product.id, _id: product.id, isActive: product.isActive };
};

export const toggleProductFeatured = async (id, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  const newFeatured = !product.isFeatured;
  await product.update({ isFeatured: newFeatured });

  await recordAuditLog({
    req,
    user,
    action: 'product.toggle_featured',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { name: product.name, isFeatured: newFeatured },
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product ${product.name} isFeatured toggled to ${newFeatured}`);
  return { id: product.id, _id: product.id, isFeatured: product.isFeatured };
};

export const verifyProductSpec = async (id, { specIndex, specKey, verified = true }, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  const specs = Array.isArray(product.specs) ? [...product.specs] : [];

  if (specIndex !== undefined && specs[specIndex]) {
    specs[specIndex] = { ...specs[specIndex], verified };
  } else if (specKey) {
    const idx = specs.findIndex((s) => s.key === specKey || s.parameter === specKey);
    if (idx !== -1) {
      specs[idx] = { ...specs[idx], verified };
    }
  }

  const verifiedFields = product.verifiedFields ? { ...product.verifiedFields } : {};
  if (specKey) {
    verifiedFields[specKey] = verified;
  }

  const allVerified = specs.length > 0 && specs.every((s) => s.verified === true);

  await product.update({
    specs,
    verifiedFields,
    isVerified: allVerified,
  });

  await recordAuditLog({
    req,
    user,
    action: 'product.verify_spec',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { specIndex, specKey, verified },
  });

  cacheService.del('http:/api/v1/products*');
  logger.info(`Product spec verified for ${product.name} [spec: ${specKey || specIndex}]`);
  const plain = product.toJSON();
  plain._id = product.id;
  return plain;
};

export const attachProductDocument = async (id, docData, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  const documents = Array.isArray(product.documents) ? [...product.documents] : [];

  const newDoc = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: docData.title,
    type: docData.type,
    url: docData.url,
    fileSize: docData.fileSize || '',
    addedAt: new Date().toISOString(),
    addedBy: user?.name || 'Staff',
  };

  documents.push(newDoc);
  await product.update({ documents });

  await recordAuditLog({
    req,
    user,
    action: 'product.attach_document',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { docTitle: newDoc.title, docType: newDoc.type },
  });

  cacheService.del('http:/api/v1/products*');
  logger.info(`Document attached to product ${product.name}: [${newDoc.type.toUpperCase()}] ${newDoc.title}`);
  return { documents, product: { ...product.toJSON(), _id: product.id } };
};

export const removeProductDocument = async (id, docIdOrIndex, user = null, req = null) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = product.toJSON();
  let documents = Array.isArray(product.documents) ? [...product.documents] : [];

  const index = parseInt(docIdOrIndex, 10);
  if (!isNaN(index) && documents[index]) {
    documents.splice(index, 1);
  } else {
    documents = documents.filter((d) => d.id !== docIdOrIndex && d.url !== docIdOrIndex);
  }

  await product.update({ documents });

  await recordAuditLog({
    req,
    user,
    action: 'product.remove_document',
    entityType: 'product',
    entityId: product.id,
    beforeSnapshot,
    afterSnapshot: product.toJSON(),
    metadata: { removedDocId: docIdOrIndex },
  });

  cacheService.del('http:/api/v1/products*');
  logger.info(`Document removed from product ${product.name}`);
  return { documents, product: { ...product.toJSON(), _id: product.id } };
};

export const getAdminCategories = async ({ q, parentId, isActive } = {}) => {
  const where = {};

  if (isActive !== undefined && isActive !== 'all') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  if (parentId !== undefined && parentId !== 'all') {
    if (parentId === 'root' || parentId === 'null') {
      where.parentId = null;
    } else {
      where.parentId = parseInt(parentId, 10);
    }
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${searchTerm}%` } },
      { slug: { [Op.iLike]: `%${searchTerm}%` } },
      { hsChapter: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  const categories = await Category.findAll({
    where,
    order: [
      ['level', 'ASC'],
      ['order', 'ASC'],
      ['name', 'ASC'],
    ],
    include: [
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Category,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'order', 'isActive', 'level'],
      },
    ],
  });

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const plain = cat.toJSON();
      const productCount = await Product.count({
        where: {
          [Op.or]: [{ categoryId: cat.id }, { subCategoryId: cat.id }],
          isActive: true,
        },
      });
      return {
        ...plain,
        _id: plain.id,
        productCount,
      };
    })
  );

  return categoriesWithCounts;
};

export const getAdminCategoryById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [
      {
        model: Category,
        as: 'parent',
        attributes: ['id', 'name', 'slug', 'level'],
      },
      {
        model: Category,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'order', 'isActive', 'level', 'hsChapter'],
      },
    ],
  });

  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const plain = category.toJSON();
  const productCount = await Product.count({
    where: {
      [Op.or]: [{ categoryId: category.id }, { subCategoryId: category.id }],
      isActive: true,
    },
  });

  return {
    ...plain,
    _id: plain.id,
    productCount,
  };
};

export const createAdminCategory = async (data, user = null, req = null) => {
  const slug = data.slug || createSlug(data.name);

  const existing = await Category.findOne({ where: { slug } });
  if (existing) {
    const error = new Error(`Category with slug '${slug}' already exists.`);
    error.statusCode = 409;
    throw error;
  }

  let level = 1;
  let path = slug;

  if (data.parentId) {
    const parent = await Category.findByPk(data.parentId);
    if (parent) {
      level = Math.min(3, (parent.level || 1) + 1);
      path = `${parent.path || parent.slug}/${slug}`;
    }
  }

  const category = await Category.create({
    ...data,
    slug,
    level,
    path,
  });

  await recordAuditLog({
    req,
    user,
    action: 'category.create',
    entityType: 'category',
    entityId: category.id,
    beforeSnapshot: null,
    afterSnapshot: category.toJSON(),
    metadata: { name: category.name, slug: category.slug, level: category.level },
  });

  cacheService.del('http:/api/v1/categories*');
  logger.info(`Category created by ${user?.name || 'admin'}: ${category.name} [${category.slug}]`);

  const plain = category.toJSON();
  plain._id = category.id;
  return plain;
};

export const updateAdminCategory = async (id, data, user = null, req = null) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = category.toJSON();
  const updatePayload = { ...data };

  if (data.parentId !== undefined && data.parentId !== category.parentId) {
    if (data.parentId) {
      if (parseInt(data.parentId, 10) === category.id) {
        const error = new Error('A category cannot be its own parent.');
        error.statusCode = 400;
        throw error;
      }
      const parent = await Category.findByPk(data.parentId);
      if (parent) {
        updatePayload.level = Math.min(3, (parent.level || 1) + 1);
        updatePayload.path = `${parent.path || parent.slug}/${category.slug}`;
      }
    } else {
      updatePayload.parentId = null;
      updatePayload.level = 1;
      updatePayload.path = category.slug;
    }
  }

  await category.update(updatePayload);

  await recordAuditLog({
    req,
    user,
    action: 'category.update',
    entityType: 'category',
    entityId: category.id,
    beforeSnapshot,
    afterSnapshot: category.toJSON(),
    metadata: { name: category.name },
  });

  cacheService.del('http:/api/v1/categories*');
  logger.info(`Category updated by ${user?.name || 'admin'}: ${category.name}`);

  const plain = category.toJSON();
  plain._id = category.id;
  return plain;
};

export const toggleCategoryActive = async (id, user = null, req = null) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = category.toJSON();
  const newActive = !category.isActive;
  await category.update({ isActive: newActive });

  await recordAuditLog({
    req,
    user,
    action: 'category.toggle_active',
    entityType: 'category',
    entityId: category.id,
    beforeSnapshot,
    afterSnapshot: category.toJSON(),
    metadata: { name: category.name, isActive: newActive },
  });

  cacheService.del('http:/api/v1/categories*');
  logger.info(`Category ${category.name} isActive toggled to ${newActive}`);
  return { id: category.id, _id: category.id, isActive: category.isActive };
};

export const reorderCategories = async (items, user = null, req = null) => {
  const beforeSnapshot = await Category.findAll({
    where: { id: items.map((i) => i.id) },
    attributes: ['id', 'name', 'order'],
  });

  for (const item of items) {
    await Category.update({ order: item.order }, { where: { id: item.id } });
  }

  await recordAuditLog({
    req,
    user,
    action: 'category.reorder',
    entityType: 'category',
    entityId: items[0]?.id || 0,
    beforeSnapshot,
    afterSnapshot: items,
    metadata: { count: items.length },
  });

  cacheService.del('http:/api/v1/categories*');
  logger.info(`Reordered ${items.length} categories`);
  return { success: true, count: items.length };
};

export const deleteAdminCategory = async (id, user = null, req = null) => {
  const category = await Category.findByPk(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  // Safety check: Active products
  const activeProductCount = await Product.count({
    where: {
      [Op.or]: [{ categoryId: id }, { subCategoryId: id }],
      isActive: true,
    },
  });

  if (activeProductCount > 0) {
    const error = new Error(
      `Cannot delete category "${category.name}". ${activeProductCount} active product(s) are assigned to this category. Please reassign or deactivate the products first.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Safety check: Active child subcategories
  const childCount = await Category.count({
    where: { parentId: id, isActive: true },
  });

  if (childCount > 0) {
    const error = new Error(
      `Cannot delete category "${category.name}". It contains ${childCount} active subcategory(ies). Please reassign or delete the subcategories first.`
    );
    error.statusCode = 400;
    throw error;
  }

  const beforeSnapshot = category.toJSON();
  await category.update({ isActive: false });

  await recordAuditLog({
    req,
    user,
    action: 'category.delete',
    entityType: 'category',
    entityId: category.id,
    beforeSnapshot,
    afterSnapshot: category.toJSON(),
    metadata: { name: category.name },
  });

  cacheService.del('http:/api/v1/categories*');
  logger.info(`Category soft-deleted by ${user?.name || 'admin'}: ${category.name}`);
  return { id: category.id, _id: category.id, isActive: false };
};

export const computeCertificateValidity = (cert) => {
  const plain = cert.toJSON ? cert.toJSON() : { ...cert };
  plain._id = plain.id;

  if (!plain.expiryDate) {
    return {
      ...plain,
      validityStatus: 'permanent',
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
    };
  }

  const now = new Date();
  const expiry = new Date(plain.expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = daysRemaining < 0;
  const isExpiringSoon = !isExpired && daysRemaining <= 60;

  let validityStatus = 'valid';
  if (isExpired) {
    validityStatus = 'expired';
  } else if (isExpiringSoon) {
    validityStatus = 'expiring_soon';
  }

  return {
    ...plain,
    validityStatus,
    daysRemaining,
    isExpiringSoon,
    isExpired,
  };
};

export const getAdminCertificates = async ({ status, validity, isPublic, q } = {}) => {
  const where = {};

  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  if (isPublic === 'true' || isPublic === true) {
    where.isPublic = true;
  } else if (isPublic === 'false' || isPublic === false) {
    where.isPublic = false;
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${searchTerm}%` } },
      { fullName: { [Op.iLike]: `%${searchTerm}%` } },
      { issuedBy: { [Op.iLike]: `%${searchTerm}%` } },
      { number: { [Op.iLike]: `%${searchTerm}%` } },
      { scope: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  const certs = await Certificate.findAll({
    where,
    order: [
      ['order', 'ASC'],
      ['name', 'ASC'],
    ],
  });

  let mapped = certs.map(computeCertificateValidity);

  if (validity && validity !== 'all') {
    mapped = mapped.filter((c) => c.validityStatus === validity);
  }

  return mapped;
};

export const getAdminCertificateById = async (id) => {
  const cert = await Certificate.findByPk(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }
  return computeCertificateValidity(cert);
};

export const createAdminCertificate = async (data, user = null, req = null) => {
  const cert = await Certificate.create(data);

  await recordAuditLog({
    req,
    user,
    action: 'certificate.create',
    entityType: 'certificate',
    entityId: cert.id,
    beforeSnapshot: null,
    afterSnapshot: cert.toJSON(),
    metadata: { name: cert.name, number: cert.number },
  });

  cacheService.del('http:/api/v1/certificates*');
  logger.info(`Certificate created by ${user?.name || 'admin'}: ${cert.name} [${cert.number}]`);
  return computeCertificateValidity(cert);
};

export const updateAdminCertificate = async (id, data, user = null, req = null) => {
  const cert = await Certificate.findByPk(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = cert.toJSON();
  await cert.update(data);

  await recordAuditLog({
    req,
    user,
    action: 'certificate.update',
    entityType: 'certificate',
    entityId: cert.id,
    beforeSnapshot,
    afterSnapshot: cert.toJSON(),
    metadata: { name: cert.name, number: cert.number },
  });

  cacheService.del('http:/api/v1/certificates*');
  logger.info(`Certificate updated by ${user?.name || 'admin'}: ${cert.name}`);
  return computeCertificateValidity(cert);
};

export const deleteAdminCertificate = async (id, user = null, req = null) => {
  const cert = await Certificate.findByPk(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = cert.toJSON();
  await cert.update({ isActive: false });

  await recordAuditLog({
    req,
    user,
    action: 'certificate.delete',
    entityType: 'certificate',
    entityId: cert.id,
    beforeSnapshot,
    afterSnapshot: cert.toJSON(),
    metadata: { name: cert.name, number: cert.number },
  });

  cacheService.del('http:/api/v1/certificates*');
  logger.info(`Certificate soft-deleted by ${user?.name || 'admin'}: ${cert.name}`);
  return { id: cert.id, _id: cert.id, isActive: false };
};

export const toggleCertificatePublic = async (id, user = null, req = null) => {
  const cert = await Certificate.findByPk(id);
  if (!cert) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = cert.toJSON();
  const newPublic = !cert.isPublic;
  await cert.update({ isPublic: newPublic });

  await recordAuditLog({
    req,
    user,
    action: 'certificate.toggle_public',
    entityType: 'certificate',
    entityId: cert.id,
    beforeSnapshot,
    afterSnapshot: cert.toJSON(),
    metadata: { name: cert.name, isPublic: newPublic },
  });

  cacheService.del('http:/api/v1/certificates*');
  logger.info(`Certificate ${cert.name} isPublic toggled to ${newPublic}`);
  return { id: cert.id, _id: cert.id, isPublic: cert.isPublic };
};

export const reorderCertificates = async (items, user = null, req = null) => {
  const beforeSnapshot = await Certificate.findAll({
    where: { id: items.map((i) => i.id) },
    attributes: ['id', 'name', 'order'],
  });

  for (const item of items) {
    await Certificate.update({ order: item.order }, { where: { id: item.id } });
  }

  await recordAuditLog({
    req,
    user,
    action: 'certificate.reorder',
    entityType: 'certificate',
    entityId: items[0]?.id || 0,
    beforeSnapshot,
    afterSnapshot: items,
    metadata: { count: items.length },
  });

  cacheService.del('http:/api/v1/certificates*');
  logger.info(`Reordered ${items.length} certificates`);
  return { success: true, count: items.length };
};

export const getAdminBlogPosts = async ({
  status,
  category,
  q,
  page = 1,
  limit = 20,
  sort = '-publishedAt',
} = {}) => {
  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (category && category !== 'all') {
    where.category = { [Op.iLike]: `%${category}%` };
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { title: { [Op.iLike]: `%${searchTerm}%` } },
      { slug: { [Op.iLike]: `%${searchTerm}%` } },
      { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
      { content: { [Op.iLike]: `%${searchTerm}%` } },
      Sequelize.where(
        Sequelize.cast(Sequelize.col('BlogPost.tags'), 'text'),
        { [Op.iLike]: `%${searchTerm}%` }
      ),
      Sequelize.where(
        Sequelize.cast(Sequelize.col('BlogPost.author'), 'text'),
        { [Op.iLike]: `%${searchTerm}%` }
      ),
    ];
  }

  let order = [['publishedAt', 'DESC']];
  if (sort === 'title') order = [['title', 'ASC']];
  else if (sort === '-title') order = [['title', 'DESC']];
  else if (sort === 'publishedAt') order = [['publishedAt', 'ASC']];
  else if (sort === '-createdAt') order = [['createdAt', 'DESC']];

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await BlogPost.findAndCountAll({
    where,
    order,
    offset,
    limit: limitNum,
  });

  const posts = rows.map((p) => {
    const plain = p.toJSON();
    return {
      ...plain,
      _id: plain.id,
    };
  });

  return {
    posts,
    pagination: formatPaginationMeta(count, pageNum, limitNum),
  };
};

export const getAdminBlogPostById = async (id) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }
  const plain = post.toJSON();
  plain._id = post.id;
  return plain;
};

export const createAdminBlogPost = async (data, user = null, req = null) => {
  const slug = data.slug || createSlug(data.title);

  const existing = await BlogPost.findOne({ where: { slug } });
  if (existing) {
    const error = new Error(`Article with slug '${slug}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const words = (data.content || '').split(/\s+/).length;
  const readMinutes = data.readMinutes || Math.max(1, Math.ceil(words / 200));

  const post = await BlogPost.create({
    ...data,
    slug,
    readMinutes,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
  });

  await recordAuditLog({
    req,
    user,
    action: 'blog.create',
    entityType: 'blog_post',
    entityId: post.id,
    beforeSnapshot: null,
    afterSnapshot: post.toJSON(),
    metadata: { title: post.title, slug: post.slug, status: post.status },
  });

  cacheService.del('http:/api/v1/blog*');
  logger.info(`Article created by ${user?.name || 'admin'}: ${post.title} [${post.slug}]`);

  const plain = post.toJSON();
  plain._id = post.id;
  return plain;
};

export const updateAdminBlogPost = async (id, data, user = null, req = null) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = post.toJSON();
  const updatePayload = { ...data };

  if (data.slug && data.slug !== post.slug) {
    const existing = await BlogPost.findOne({ where: { slug: data.slug } });
    if (existing && existing.id !== post.id) {
      const error = new Error(`Article with slug '${data.slug}' already exists`);
      error.statusCode = 409;
      throw error;
    }
  }

  if (data.content) {
    const words = data.content.split(/\s+/).length;
    updatePayload.readMinutes = Math.max(1, Math.ceil(words / 200));
  }

  await post.update(updatePayload);

  await recordAuditLog({
    req,
    user,
    action: 'blog.update',
    entityType: 'blog_post',
    entityId: post.id,
    beforeSnapshot,
    afterSnapshot: post.toJSON(),
    metadata: { title: post.title, slug: post.slug, status: post.status },
  });

  cacheService.del('http:/api/v1/blog*');
  logger.info(`Article updated by ${user?.name || 'admin'}: ${post.title}`);

  const plain = post.toJSON();
  plain._id = post.id;
  return plain;
};

export const deleteAdminBlogPost = async (id, user = null, req = null) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = post.toJSON();
  await post.update({ status: 'archived' });

  await recordAuditLog({
    req,
    user,
    action: 'blog.delete',
    entityType: 'blog_post',
    entityId: post.id,
    beforeSnapshot,
    afterSnapshot: post.toJSON(),
    metadata: { title: post.title, slug: post.slug, status: 'archived' },
  });

  cacheService.del('http:/api/v1/blog*');
  logger.info(`Article archived by ${user?.name || 'admin'}: ${post.title}`);
  return { id: post.id, _id: post.id, status: 'archived' };
};

export const updateAdminBlogPostStatus = async (id, { status, publishedAt }, user = null, req = null) => {
  const post = await BlogPost.findByPk(id);
  if (!post) {
    const error = new Error('Article not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = post.toJSON();
  const updatePayload = { status };

  if (status === 'published' && !post.publishedAt) {
    updatePayload.publishedAt = new Date();
  }
  if (publishedAt) {
    updatePayload.publishedAt = new Date(publishedAt);
  }

  await post.update(updatePayload);

  await recordAuditLog({
    req,
    user,
    action: 'blog.status_change',
    entityType: 'blog_post',
    entityId: post.id,
    beforeSnapshot,
    afterSnapshot: post.toJSON(),
    metadata: { title: post.title, status, publishedAt: updatePayload.publishedAt },
  });

  cacheService.del('http:/api/v1/blog*');
  logger.info(`Article ${post.title} status changed to ${status}`);

  const plain = post.toJSON();
  plain._id = post.id;
  return plain;
};

// ==========================================
// FAQ MANAGER ADMINISTRATION
// ==========================================

export const getAdminFaqs = async ({
  search = '',
  group = '',
  showOnHome = '',
  isActive = '',
  page = 1,
  limit = 50,
  sort = 'order',
  order = 'ASC',
} = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    where[Op.or] = [
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('question')), { [Op.like]: term }),
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('answer')), { [Op.like]: term }),
      Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('group')), { [Op.like]: term }),
    ];
  }

  if (group && group.trim() && group !== 'all') {
    where.group = group.trim();
  }

  if (showOnHome === 'true' || showOnHome === true) {
    where.showOnHome = true;
  } else if (showOnHome === 'false' || showOnHome === false) {
    where.showOnHome = false;
  }

  if (isActive === 'true' || isActive === true) {
    where.isActive = true;
  } else if (isActive === 'false' || isActive === false) {
    where.isActive = false;
  }

  const validSortCols = ['order', 'homeOrder', 'question', 'group', 'createdAt', 'updatedAt'];
  const sortCol = validSortCols.includes(sort) ? sort : 'order';
  const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const orderClause =
    sortCol === 'homeOrder'
      ? [
          ['homeOrder', sortOrder],
          ['order', 'ASC'],
        ]
      : [
          [sortCol, sortOrder],
          ['id', 'ASC'],
        ];

  const { count, rows } = await Faq.findAndCountAll({
    where,
    order: orderClause,
    limit: limitNum,
    offset,
  });

  const [totalCount, activeCount, homeCount, groupRows] = await Promise.all([
    Faq.count(),
    Faq.count({ where: { isActive: true } }),
    Faq.count({ where: { showOnHome: true, isActive: true } }),
    Faq.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('group')), 'group']],
      raw: true,
    }),
  ]);

  const groups = groupRows
    .map((g) => g.group)
    .filter(Boolean)
    .sort();

  const faqs = rows.map((f) => {
    const plain = f.toJSON();
    return {
      ...plain,
      _id: plain.id,
    };
  });

  return {
    faqs,
    groups,
    metrics: {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      homepageFeatured: homeCount,
      groupCount: groups.length,
    },
    pagination: formatPaginationMeta(count, pageNum, limitNum),
  };
};

export const getAdminFaqById = async (id) => {
  const faq = await Faq.findByPk(id);
  if (!faq) {
    const error = new Error('FAQ item not found');
    error.statusCode = 404;
    throw error;
  }
  const plain = faq.toJSON();
  plain._id = faq.id;
  return plain;
};

export const createAdminFaq = async (faqData, user = null, req = null) => {
  const baseSlug = faqData.slug || createSlug(faqData.question);
  let uniqueSlug = baseSlug;
  let count = 1;
  while (await Faq.findOne({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${count++}`;
  }

  let assignedOrder = faqData.order;
  if (assignedOrder === undefined || assignedOrder === null || assignedOrder === 0) {
    const maxOrder = await Faq.max('order', {
      where: { group: faqData.group || 'Ordering & Minimum Quantities (MOQ)' },
    });
    assignedOrder = (maxOrder || 0) + 1;
  }

  const faq = await Faq.create({
    ...faqData,
    order: assignedOrder,
    slug: uniqueSlug,
  });

  try {
    const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
    await syncFaqEmbedding(faq);
  } catch {
    // Non-blocking embedding sync
  }

  await recordAuditLog({
    req,
    user,
    action: 'faq.create',
    entityType: 'faq',
    entityId: faq.id,
    afterSnapshot: faq.toJSON(),
    metadata: { question: faq.question, group: faq.group, slug: faq.slug },
  });

  cacheService.del('http:/api/v1/faqs*');
  logger.info(`FAQ created by ${user?.name || 'Staff'}: "${faq.question.slice(0, 40)}..."`);

  const plain = faq.toJSON();
  plain._id = faq.id;
  return plain;
};

export const updateAdminFaq = async (id, updateData, user = null, req = null) => {
  const faq = await Faq.findByPk(id);
  if (!faq) {
    const error = new Error('FAQ item not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = faq.toJSON();

  if (updateData.slug && updateData.slug !== faq.slug) {
    const existing = await Faq.findOne({ where: { slug: updateData.slug } });
    if (existing && existing.id !== faq.id) {
      const error = new Error(`FAQ with slug "${updateData.slug}" already exists`);
      error.statusCode = 409;
      throw error;
    }
  }

  await faq.update(updateData);

  try {
    const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
    await syncFaqEmbedding(faq);
  } catch {
    // Non-blocking
  }

  await recordAuditLog({
    req,
    user,
    action: 'faq.update',
    entityType: 'faq',
    entityId: faq.id,
    beforeSnapshot,
    afterSnapshot: faq.toJSON(),
    metadata: { question: faq.question, group: faq.group },
  });

  cacheService.del('http:/api/v1/faqs*');
  logger.info(`FAQ updated by ${user?.name || 'Staff'}: "${faq.question.slice(0, 40)}..."`);

  const plain = faq.toJSON();
  plain._id = faq.id;
  return plain;
};

export const deleteAdminFaq = async (id, user = null, req = null) => {
  const faq = await Faq.findByPk(id);
  if (!faq) {
    const error = new Error('FAQ item not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = faq.toJSON();
  await faq.update({ isActive: false });

  try {
    const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
    await syncFaqEmbedding(faq);
  } catch {
    // Non-blocking
  }

  await recordAuditLog({
    req,
    user,
    action: 'faq.archive',
    entityType: 'faq',
    entityId: faq.id,
    beforeSnapshot,
    afterSnapshot: faq.toJSON(),
    metadata: { question: faq.question, slug: faq.slug },
  });

  cacheService.del('http:/api/v1/faqs*');
  logger.info(`FAQ archived by ${user?.name || 'Staff'}: "${faq.question.slice(0, 40)}..."`);

  return { success: true, id: faq.id, isActive: false };
};

export const toggleAdminFaqHome = async (id, user = null, req = null) => {
  const faq = await Faq.findByPk(id);
  if (!faq) {
    const error = new Error('FAQ item not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = faq.toJSON();
  const nextVal = !faq.showOnHome;

  let nextHomeOrder = faq.homeOrder;
  if (nextVal && (!nextHomeOrder || nextHomeOrder === 0)) {
    const maxHomeOrder = await Faq.max('homeOrder', { where: { showOnHome: true } });
    nextHomeOrder = (maxHomeOrder || 0) + 1;
  }

  await faq.update({
    showOnHome: nextVal,
    homeOrder: nextHomeOrder,
  });

  await recordAuditLog({
    req,
    user,
    action: 'faq.toggle_home',
    entityType: 'faq',
    entityId: faq.id,
    beforeSnapshot,
    afterSnapshot: faq.toJSON(),
    metadata: { question: faq.question, showOnHome: nextVal, homeOrder: nextHomeOrder },
  });

  cacheService.del('http:/api/v1/faqs*');
  const plain = faq.toJSON();
  plain._id = faq.id;
  return plain;
};

export const toggleAdminFaqActive = async (id, user = null, req = null) => {
  const faq = await Faq.findByPk(id);
  if (!faq) {
    const error = new Error('FAQ item not found');
    error.statusCode = 404;
    throw error;
  }

  const beforeSnapshot = faq.toJSON();
  const nextVal = !faq.isActive;

  await faq.update({ isActive: nextVal });

  try {
    const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
    await syncFaqEmbedding(faq);
  } catch {
    // Non-blocking
  }

  await recordAuditLog({
    req,
    user,
    action: 'faq.toggle_active',
    entityType: 'faq',
    entityId: faq.id,
    beforeSnapshot,
    afterSnapshot: faq.toJSON(),
    metadata: { question: faq.question, isActive: nextVal },
  });

  cacheService.del('http:/api/v1/faqs*');
  const plain = faq.toJSON();
  plain._id = faq.id;
  return plain;
};

export const reorderAdminFaqs = async (items = [], user = null, req = null) => {
  const transaction = await sequelize.transaction();
  try {
    for (const item of items) {
      const updateFields = {};
      if (item.order !== undefined) updateFields.order = parseInt(item.order, 10);
      if (item.homeOrder !== undefined) updateFields.homeOrder = parseInt(item.homeOrder, 10);

      if (Object.keys(updateFields).length > 0) {
        await Faq.update(updateFields, {
          where: { id: item.id },
          transaction,
        });
      }
    }

    await transaction.commit();

    await recordAuditLog({
      req,
      user,
      action: 'faq.reorder',
      entityType: 'faq',
      entityId: null,
      metadata: { count: items.length },
    });

    cacheService.del('http:/api/v1/faqs*');
    logger.info(`Reordered ${items.length} FAQs by ${user?.name || 'Staff'}`);
    return { success: true, count: items.length };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export default {
  computeSla,
  getDashboardMetrics,
  getAdminInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  sendInquiryReply,
  flagInquiryAsSpam,
  unspamInquiry,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  softDeleteAdminProduct,
  toggleProductActive,
  toggleProductFeatured,
  verifyProductSpec,
  attachProductDocument,
  removeProductDocument,
  getAdminCategories,
  getAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
  toggleCategoryActive,
  reorderCategories,
  deleteAdminCategory,
  computeCertificateValidity,
  getAdminCertificates,
  getAdminCertificateById,
  createAdminCertificate,
  updateAdminCertificate,
  deleteAdminCertificate,
  toggleCertificatePublic,
  reorderCertificates,
  getAdminBlogPosts,
  getAdminBlogPostById,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  updateAdminBlogPostStatus,
  getAdminFaqs,
  getAdminFaqById,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  toggleAdminFaqHome,
  toggleAdminFaqActive,
  reorderAdminFaqs,
};
