import { Op } from 'sequelize';
import Customer from './customer.model.js';
import User from '../user/user.model.js';
import Inquiry from '../inquiry/inquiry.model.js';
import Quotation from '../quotation/quotation.model.js';
import logger from '../../utils/logger.js';

export const createCustomer = async (customerData, user) => {
  const normalizedEmail = (customerData.email || '').toLowerCase().trim();
  const existing = await Customer.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    const error = new Error(`Customer with email '${customerData.email}' already exists.`);
    error.statusCode = 409;
    throw error;
  }

  const initialNotes = [];
  if (customerData.note) {
    initialNotes.push({
      by: user?.name || 'Sales Desk',
      text: customerData.note,
      at: new Date().toISOString(),
    });
  }

  const customer = await Customer.create({
    ...customerData,
    email: normalizedEmail,
    notes: initialNotes,
  });

  logger.info(`Customer profile created: ${customer.companyName} (${customer.email})`);
  return customer;
};

export const upsertCustomerFromInquiry = async (inquiry) => {
  if (!inquiry || !inquiry.buyer?.email) return null;

  try {
    const email = inquiry.buyer.email.toLowerCase().trim();
    let customer = await Customer.findOne({ where: { email } });

    const newCommodityNames = (inquiry.items || []).map((i) => i.productName).filter(Boolean);

    if (!customer) {
      customer = await Customer.create({
        companyName: inquiry.buyer.company || 'Overseas Buyer',
        contactPerson: inquiry.buyer.name || 'Commercial Contact',
        country: inquiry.buyer.country || 'International',
        city: inquiry.buyer.city || '',
        email,
        phone: inquiry.buyer.phone || '',
        whatsapp: inquiry.buyer.whatsapp || '',
        website: inquiry.buyer.website || '',
        businessType: inquiry.buyer.buyerType || 'importer',
        interestedProducts: newCommodityNames,
        preferredPort: inquiry.destinationPort || '',
        preferredIncoterm: inquiry.incoterm || 'CIF',
        paymentTerms: inquiry.paymentTerm || '30% Advance TT',
        lastContactDate: new Date(),
        notes: [
          {
            by: 'System (RFQ Auto-Sync)',
            text: `Initial RFQ received [Ref: ${inquiry.referenceNo}] for ${newCommodityNames.join(', ')}`,
            at: new Date().toISOString(),
          },
        ],
      });
      logger.info(`New CRM customer auto-registered from RFQ: ${customer.companyName}`);
    } else {
      const existingInterests = new Set(customer.interestedProducts || []);
      newCommodityNames.forEach((item) => existingInterests.add(item));
      customer.interestedProducts = Array.from(existingInterests);
      customer.lastContactDate = new Date();

      const existingNotes = Array.isArray(customer.notes) ? [...customer.notes] : [];
      existingNotes.push({
        by: 'System (RFQ Auto-Sync)',
        text: `Subsequent RFQ recorded [Ref: ${inquiry.referenceNo}]`,
        at: new Date().toISOString(),
      });
      customer.notes = existingNotes;

      await customer.save();
      logger.info(`Existing CRM customer updated with RFQ ${inquiry.referenceNo}: ${customer.companyName}`);
    }

    // Link customer to inquiry
    if (inquiry.update) {
      await inquiry.update({ customerId: customer.id });
    }

    return customer;
  } catch (err) {
    logger.warn(`Failed to auto-upsert customer from RFQ ${inquiry.referenceNo}: ${err.message}`);
    return null;
  }
};

export const getCustomers = async ({ q, country, businessType, page = 1, limit = 20 }) => {
  const where = {};

  if (country && country !== 'all') {
    where.country = { [Op.iLike]: `%${country}%` };
  }

  if (businessType && businessType !== 'all') {
    where.businessType = businessType;
  }

  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/'/g, "''");
    where[Op.or] = [
      { companyName: { [Op.iLike]: `%${searchTerm}%` } },
      { contactPerson: { [Op.iLike]: `%${searchTerm}%` } },
      { email: { [Op.iLike]: `%${searchTerm}%` } },
      { country: { [Op.iLike]: `%${searchTerm}%` } },
      Customer.sequelize.literal(`"interested_products"::text ILIKE '%${searchTerm}%'`),
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Customer.findAndCountAll({
    where,
    order: [
      ['lastContactDate', 'DESC'],
      ['createdAt', 'DESC'],
    ],
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
    customers: rows.map((r) => {
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

export const getCustomerById = async (id) => {
  const customer = await Customer.findByPk(id, {
    include: [
      {
        model: User,
        as: 'salesperson',
        attributes: ['id', 'name', 'email', 'role'],
      },
      {
        model: Inquiry,
        as: 'inquiries',
        attributes: ['id', 'referenceNo', 'items', 'destinationPort', 'incoterm', 'status', 'priority', 'createdAt'],
      },
      {
        model: Quotation,
        as: 'quotations',
        attributes: ['id', 'quotationNumber', 'totalAmount', 'currency', 'incoterm', 'status', 'createdAt'],
      },
    ],
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const plain = customer.toJSON();
  if (plain.salesperson) {
    plain.assignedSalesperson = plain.salesperson;
  }
  plain.previousInquiries = plain.inquiries || [];
  plain.previousQuotations = plain.quotations || [];
  return plain;
};

export const updateCustomer = async (id, updateData, user) => {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const { note, ...fieldsToUpdate } = updateData;
  Object.assign(customer, fieldsToUpdate);

  if (note && note.trim()) {
    const existingNotes = Array.isArray(customer.notes) ? [...customer.notes] : [];
    existingNotes.push({
      by: user?.name || 'Sales Staff',
      text: note.trim(),
      at: new Date().toISOString(),
    });
    customer.notes = existingNotes;
  }

  customer.lastContactDate = new Date();
  await customer.save();

  logger.info(`Customer profile updated: ${customer.companyName} by ${user?.name || 'Staff'}`);
  return customer;
};

export const addCustomerNote = async (id, noteText, user) => {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const existingNotes = Array.isArray(customer.notes) ? [...customer.notes] : [];
  existingNotes.push({
    by: user?.name || 'Sales Staff',
    text: noteText,
    at: new Date().toISOString(),
  });
  customer.notes = existingNotes;
  customer.lastContactDate = new Date();
  await customer.save();

  return customer;
};

export default {
  createCustomer,
  upsertCustomerFromInquiry,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addCustomerNote,
};
