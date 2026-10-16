import { Op, Sequelize } from 'sequelize';
import Order from './order.model.js';
import Quotation from '../quotation/quotation.model.js';
import Inquiry from '../inquiry/inquiry.model.js';
import Customer from '../customer/customer.model.js';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

export const createOrder = async (orderData, user) => {
  const count = await Order.count();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(6, '0');
  const orderNumber = `ORD-${year}-${sequence}`;

  const order = await Order.create({
    ...orderData,
    orderNumber,
    assignedSalesperson: user?.id || null,
  });

  // Link and update Quotation status
  if (orderData.quotationId) {
    const quote = await Quotation.findByPk(orderData.quotationId);
    if (quote) {
      await quote.update({
        status: 'accepted',
        notes: `Converted to official Order ${orderNumber}`,
      });
    }
  }

  // Link and update Inquiry status
  if (orderData.inquiryId) {
    const inquiry = await Inquiry.findByPk(orderData.inquiryId);
    if (inquiry) {
      inquiry.status = 'won';
      const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
      existingNotes.push({
        by: user?.name || 'Sales Staff',
        text: `Order confirmed: ${orderNumber} for ${order.currency} ${order.totalAmount.toLocaleString()}`,
        at: new Date().toISOString(),
      });
      inquiry.notes = existingNotes;
      await inquiry.save();
    }
  }

  // Update Customer order history and lifetime value
  const customerEmail = orderData.buyer?.email?.toLowerCase().trim();
  let customer = null;
  if (orderData.customerId) {
    customer = await Customer.findByPk(orderData.customerId);
  } else if (customerEmail) {
    customer = await Customer.findOne({ where: { email: customerEmail } });
  }

  if (customer) {
    customer.totalOrderValue = Number(customer.totalOrderValue || 0) + Number(order.totalAmount);
    customer.lastContactDate = new Date();
    const existingNotes = Array.isArray(customer.notes) ? [...customer.notes] : [];
    existingNotes.push({
      by: 'System (Order Confirmed)',
      text: `Commercial Order ${orderNumber} placed for ${order.currency} ${order.totalAmount.toLocaleString()}`,
      at: new Date().toISOString(),
    });
    customer.notes = existingNotes;
    await customer.save();

    if (!order.customerId) {
      await order.update({ customerId: customer.id });
    }
  }

  logger.info(`Commercial order created: ${order.orderNumber} for ${order.buyer?.company || 'Buyer'}`);
  return order;
};

export const getOrders = async ({ status, q, page = 1, limit = 20 }) => {
  const where = {};

  if (status && status !== 'all') {
    where.orderStatus = status;
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { orderNumber: { [Op.iLike]: `%${searchTerm}%` } },
      Sequelize.where(Sequelize.literal(`"buyer"->>'company'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"buyer"->>'name'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"buyer"->>'email'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"shipment"->>'containerNumber'`), { [Op.iLike]: `%${searchTerm}%` }),
      Sequelize.where(Sequelize.literal(`"shipment"->>'billOfLadingNumber'`), { [Op.iLike]: `%${searchTerm}%` }),
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Order.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset,
    include: [
      {
        model: User,
        as: 'salesperson',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    distinct: true,
  });

  return {
    orders: rows.map((r) => {
      const plain = r.toJSON();
      if (plain.salesperson) {
        plain.assignedSalesperson = plain.salesperson;
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

export const getOrderById = async (id) => {
  const order = await Order.findByPk(id, {
    include: [
      {
        model: User,
        as: 'salesperson',
        attributes: ['id', 'name', 'email', 'role'],
      },
      {
        model: Quotation,
        as: 'quotation',
        attributes: ['id', 'quotationNumber', 'subtotal', 'totalAmount', 'incoterm'],
      },
      {
        model: Inquiry,
        as: 'inquiry',
        attributes: ['id', 'referenceNo', 'createdAt'],
      },
    ],
  });

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const plain = order.toJSON();
  if (plain.salesperson) {
    plain.assignedSalesperson = plain.salesperson;
  }
  return plain;
};

export const updateOrderStatus = async (id, { orderStatus, notes }, user) => {
  const order = await Order.findByPk(id);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  order.orderStatus = orderStatus;
  if (notes) {
    order.notes = order.notes ? `${order.notes}\n[${new Date().toISOString()}] ${notes}` : notes;
  }

  await order.save();
  logger.info(`Order ${order.orderNumber} updated to status: ${orderStatus} by ${user?.name || 'Staff'}`);
  return order;
};

export const updateShipmentDetails = async (id, shipmentData, user) => {
  const order = await Order.findByPk(id);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const currentShipment = order.shipment ? { ...order.shipment } : {};
  order.shipment = {
    ...currentShipment,
    ...shipmentData,
  };

  await order.save();
  logger.info(`Shipment details updated for ${order.orderNumber} by ${user?.name || 'Staff'}`);
  return order;
};

export const addExportDocument = async (id, docData, user) => {
  const order = await Order.findByPk(id);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const existingDocs = Array.isArray(order.documents) ? [...order.documents] : [];
  const newDoc = {
    _id: Date.now().toString(),
    id: Date.now(),
    ...docData,
    uploadedAt: new Date().toISOString(),
  };
  existingDocs.push(newDoc);
  order.documents = existingDocs;

  await order.save();
  logger.info(`Export document '${docData.documentType}' added to order ${order.orderNumber}`);
  return order;
};

export const removeExportDocument = async (orderId, docId, user) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const existingDocs = Array.isArray(order.documents) ? [...order.documents] : [];
  order.documents = existingDocs.filter(
    (d) => String(d._id) !== String(docId) && String(d.id) !== String(docId)
  );

  await order.save();
  logger.info(`Export document ${docId} removed from order ${order.orderNumber}`);
  return order;
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateShipmentDetails,
  addExportDocument,
  removeExportDocument,
};
