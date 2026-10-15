import { Op } from 'sequelize';
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
    Inquiry.count({ where: { status: 'new' } }),
    Inquiry.findAll({
      attributes: ['status', [sequelize.fn('count', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Inquiry.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'referenceNo', 'buyer', 'status', 'priority', 'items', 'createdAt'],
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
    contacted: 0,
    requirement_confirmed: 0,
    quotation_preparing: 0,
    quotation_sent: 0,
    negotiation: 0,
    confirmed: 0,
    order_processing: 0,
    completed: 0,
    rejected: 0,
    lost: 0,
    on_hold: 0,
    in_review: 0,
    quoted: 0,
    sample_sent: 0,
    won: 0,
    spam: 0,
  };

  inquiriesByStatusRows.forEach((item) => {
    if (statusMap[item.status] !== undefined) {
      statusMap[item.status] = parseInt(item.count, 10);
    }
  });

  const totalRevenue = revenueSum || 0;
  const conversionRate = totalInquiries > 0 ? Number(((totalOrders / totalInquiries) * 100).toFixed(1)) : 0;

  const metrics = {
    inquiries: {
      total: totalInquiries,
      new: newInquiries,
      byStatus: statusMap,
      recent: recentInquiriesRows.map((r) => r.toJSON()),
    },
    operations: {
      newInquiries,
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

  if (status && status !== 'all') {
    where.status = status;
  }

  if (priority && priority !== 'all') {
    where.priority = priority;
  }

  if (country) {
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push(
      sequelize.literal(`"buyer"->>'country' ILIKE '%${country.replace(/'/g, "''")}%'`)
    );
  }

  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/'/g, "''");
    where[Op.or] = [
      { referenceNo: { [Op.iLike]: `%${searchTerm}%` } },
      sequelize.literal(`"buyer"->>'company' ILIKE '%${searchTerm}%'`),
      sequelize.literal(`"buyer"->>'name' ILIKE '%${searchTerm}%'`),
      sequelize.literal(`"buyer"->>'email' ILIKE '%${searchTerm}%'`),
      sequelize.literal(`"buyer"->>'country' ILIKE '%${searchTerm}%'`),
      sequelize.literal(`"items"::text ILIKE '%${searchTerm}%'`),
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
      const plain = r.toJSON();
      if (plain.assignee) {
        plain.assignedTo = plain.assignee;
      }
      return plain;
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

  const plain = inquiry.toJSON();
  if (plain.assignee) {
    plain.assignedTo = plain.assignee;
  }
  return plain;
};

export const updateInquiryStatus = async (id, { status, priority, note, assignedTo }, user) => {
  const inquiry = await Inquiry.findByPk(id);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  if (status) inquiry.status = status;
  if (priority) inquiry.priority = priority;
  if (assignedTo !== undefined) {
    inquiry.assignedTo = assignedTo ? parseInt(assignedTo, 10) : null;
  }

  if (note && note.trim()) {
    const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
    existingNotes.push({
      by: user.name || 'Admin',
      text: note.trim(),
      at: new Date().toISOString(),
    });
    inquiry.notes = existingNotes;
  }

  await inquiry.save();
  logger.info(`Inquiry ${inquiry.referenceNo} updated by ${user.name} (${user.role}) - Status: ${inquiry.status}`);

  return inquiry;
};

export const sendInquiryReply = async (id, { subject, message, status = 'quoted' }, user) => {
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

  // 1. Dispatch approved email through email service
  const emailResult = await emailService.sendBuyerReply({
    to: inquiry.buyer.email,
    subject,
    message,
    referenceNo: inquiry.referenceNo,
    senderName: user.name || 'International Trade Desk',
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
  ai.approvedBy = user.id;
  ai.approvedAt = new Date().toISOString();
  ai.replySubject = subject;
  inquiry.ai = ai;

  const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
  existingNotes.push({
    by: user.name || 'Sales Desk',
    text: `Commercial reply approved and sent to buyer (${inquiry.buyer.email}) with subject: "${subject}"`,
    at: new Date().toISOString(),
  });
  inquiry.notes = existingNotes;

  await inquiry.save();
  logger.info(
    `Inquiry ${inquiry.referenceNo} reply approved & sent by ${user.name} (${user.role}) - Status: ${inquiry.status}`
  );

  return inquiry;
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
  getDashboardMetrics,
  getAdminInquiries,
  getAdminInquiryById,
  updateInquiryStatus,
  sendInquiryReply,
  createAdminProduct,
  updateAdminProduct,
  softDeleteAdminProduct,
};
