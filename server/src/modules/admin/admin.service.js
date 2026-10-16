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
import emailService from '../../services/email.service.js';
import cacheService from '../../services/cache.service.js';
import logger from '../../utils/logger.js';
import { recordAuditLog } from '../audit/audit.service.js';

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

export const createAdminProduct = async (productData) => {
  const slug = productData.slug || createSlug(productData.name);

  const existing = await Product.findOne({ where: { slug } });
  if (existing) {
    const error = new Error(`Product slug '${slug}' already exists. Please choose a unique name.`);
    error.statusCode = 409;
    throw error;
  }

  const product = await Product.create({
    ...productData,
    slug,
  });

  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product created by admin: ${product.name} [${product.slug}]`);
  return product;
};

export const updateAdminProduct = async (id, productData) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await product.update(productData);
  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product updated by admin: ${product.name} [${product.slug}]`);
  return product;
};

export const softDeleteAdminProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  await product.update({ isActive: false });
  cacheService.del('http:/api/v1/products*');
  cacheService.del('admin:dashboard_metrics');
  logger.info(`Product soft-deleted by admin: ${product.name}`);
  return product;
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
  createAdminProduct,
  updateAdminProduct,
  softDeleteAdminProduct,
};
