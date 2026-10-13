import { Op } from 'sequelize';
import Quotation from './quotation.model.js';
import Inquiry from '../inquiry/inquiry.model.js';
import User from '../user/user.model.js';
import { generateQuotationPdf } from './pdf.service.js';
import logger from '../../utils/logger.js';

export const createQuotation = async (quotationData, user) => {
  // Generate quotation sequence number
  const count = await Quotation.count();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(6, '0');
  const quotationNumber = `QT-${year}-${sequence}`;

  // Recalculate totals for integrity
  const items = Array.isArray(quotationData.items) ? quotationData.items : [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const totalAmount = subtotal +
    (Number(quotationData.shippingCharges) || 0) +
    (Number(quotationData.insuranceCharges) || 0) +
    (Number(quotationData.otherCharges) || 0);

  const quotation = await Quotation.create({
    ...quotationData,
    quotationNumber,
    subtotal,
    totalAmount,
    createdBy: user?.id || null,
  });

  // If created from an inquiry, link and advance status
  if (quotationData.inquiryId) {
    const inquiry = await Inquiry.findByPk(quotationData.inquiryId);
    if (inquiry) {
      inquiry.status = 'quoted';
      const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
      existingNotes.push({
        by: user?.name || 'Sales Desk',
        text: `Official Quotation ${quotationNumber} issued for ${quotation.currency} ${totalAmount.toLocaleString()} (${quotation.incoterm})`,
        at: new Date().toISOString(),
      });
      inquiry.notes = existingNotes;
      await inquiry.save();
    }
  }

  logger.info(`Quotation created: ${quotation.quotationNumber} by ${user?.name || 'Staff'}`);
  return quotation;
};

export const getQuotations = async ({ status, q, customerId, page = 1, limit = 20 }) => {
  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (customerId) {
    where.customerId = parseInt(customerId, 10);
  }

  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/'/g, "''");
    where[Op.or] = [
      { quotationNumber: { [Op.iLike]: `%${searchTerm}%` } },
      Quotation.sequelize.literal(`"buyer"->>'company' ILIKE '%${searchTerm}%'`),
      Quotation.sequelize.literal(`"buyer"->>'name' ILIKE '%${searchTerm}%'`),
      Quotation.sequelize.literal(`"buyer"->>'email' ILIKE '%${searchTerm}%'`),
      Quotation.sequelize.literal(`"items"::text ILIKE '%${searchTerm}%'`),
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Quotation.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: limitNum,
    offset,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    distinct: true,
  });

  return {
    quotations: rows.map((r) => {
      const plain = r.toJSON();
      if (plain.creator) {
        plain.createdBy = plain.creator;
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

export const getQuotationById = async (id) => {
  const quotation = await Quotation.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
  });

  if (!quotation) {
    const error = new Error('Quotation not found');
    error.statusCode = 404;
    throw error;
  }

  const plain = quotation.toJSON();
  if (plain.creator) {
    plain.createdBy = plain.creator;
  }
  return plain;
};

export const updateQuotationStatus = async (id, { status, notes }, user) => {
  const quotation = await Quotation.findByPk(id);
  if (!quotation) {
    const error = new Error('Quotation not found');
    error.statusCode = 404;
    throw error;
  }

  quotation.status = status;
  if (notes) {
    quotation.notes = quotation.notes ? `${quotation.notes}\n[${new Date().toISOString()}] ${notes}` : notes;
  }

  await quotation.save();
  logger.info(`Quotation ${quotation.quotationNumber} updated to status: ${status} by ${user?.name || 'Staff'}`);
  return quotation;
};

export const getQuotationPdfBuffer = async (id) => {
  const quotation = await getQuotationById(id);
  const pdfBuffer = await generateQuotationPdf(quotation);
  return { quotation, pdfBuffer };
};

export default {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus,
  getQuotationPdfBuffer,
};
