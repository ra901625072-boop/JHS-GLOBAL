import crypto from 'crypto';
import { Op } from 'sequelize';
import Inquiry from './inquiry.model.js';
import emailService from '../../services/email.service.js';
import { processInquiryAiJob } from '../ai/ai.service.js';
import { upsertCustomerFromInquiry } from '../customer/customer.service.js';
import logger from '../../utils/logger.js';

export const inquiryService = {
  /**
   * Generates formatted reference: RFQ-YYYY-XXXXXX
   */
  async generateReferenceNo() {
    const year = new Date().getFullYear();
    const last = await Inquiry.findOne({
      attributes: ['referenceNo'],
      order: [['id', 'DESC']],
    });
    let seq = 1;
    if (last && last.referenceNo) {
      const parts = last.referenceNo.split('-');
      if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
        seq = parseInt(parts[2], 10) + 1;
      }
    }
    const sequence = String(seq).padStart(6, '0');
    return `RFQ-${year}-${sequence}`;
  },

  /**
   * Create new commercial Inquiry
   */
  async createInquiry(data, clientMeta = {}) {
    // 1. Honeypot anti-spam verification
    const isSpam = Boolean(data.website_hp && data.website_hp.trim().length > 0);

    const referenceNo = await this.generateReferenceNo();

    // 2. Hash IP for privacy compliance
    const ipHash = clientMeta.ip
      ? crypto.createHash('sha256').update(clientMeta.ip).digest('hex').substring(0, 16)
      : '';

    // 3. Lead priority heuristic
    let priority = 'warm';
    const hasLargeTonnage = data.items?.some(
      (item) => item.unit?.includes('FCL') || (item.unit === 'MT' && item.quantity >= 10)
    );
    if (hasLargeTonnage || (data.destinationPort && data.company)) {
      priority = 'hot';
    }

    const savedInquiry = await Inquiry.create({
      referenceNo,
      buyer: {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        company: data.company,
        designation: data.designation || '',
        website: data.website || '',
        country: data.country,
        city: data.city || '',
        buyerType: data.buyerType || 'importer',
      },
      items: data.items || [],
      destinationPort: data.destinationPort || '',
      incoterm: data.incoterm || 'CIF',
      targetShipmentMonth: data.targetShipmentMonth || '',
      paymentTerm: data.paymentTerm || 'TT',
      needsPrivateLabel: Boolean(data.needsPrivateLabel),
      needsSample: Boolean(data.needsSample),
      message: data.message || '',
      status: isSpam ? 'spam' : 'new',
      priority: isSpam ? 'cold' : priority,
      meta: {
        ip: ipHash,
        userAgent: clientMeta.userAgent || '',
      },
    });

    logger.info(`Inquiry created: ${savedInquiry.referenceNo} for ${savedInquiry.buyer.company}`);

    // 4. Non-blocking asynchronous notification dispatch, customer upsert, and AI lead scoring
    if (!isSpam) {
      setImmediate(async () => {
        try {
          upsertCustomerFromInquiry(savedInquiry).catch((err) =>
            logger.warn(`Background customer upsert failed: ${err.message}`)
          );
          processInquiryAiJob(savedInquiry.id).catch((err) =>
            logger.warn(`Background AI lead scoring failed: ${err.message}`)
          );

          const [buyerRes, teamRes] = await Promise.allSettled([
            emailService.sendRfqBuyerAcknowledgment(savedInquiry),
            emailService.sendRfqSalesDeskAlert(savedInquiry),
          ]);

          await savedInquiry.update({
            emailSent: {
              buyer: buyerRes.status === 'fulfilled' && buyerRes.value?.success,
              team: teamRes.status === 'fulfilled' && teamRes.value?.success,
            },
          }).catch((err) => logger.warn(`Failed to update emailSent flag: ${err.message}`));
        } catch (err) {
          logger.error(`Background inquiry tasks error: ${err.message}`);
        }
      });
    }

    return savedInquiry;
  },

  /**
   * List inquiries for Admin / Sales Lead Desk
   */
  async listInquiries(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.country) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        Inquiry.sequelize.literal(`"buyer"->>'country' ILIKE '%${filters.country.replace(/'/g, "''")}%'`)
      );
    }

    const inquiries = await Inquiry.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    return inquiries.map((inq) => inq.toJSON());
  },

  /**
   * Find inquiry by ID or reference number
   */
  async getInquiryById(idOrRef) {
    if (typeof idOrRef === 'string' && idOrRef.startsWith('RFQ-')) {
      const inquiry = await Inquiry.findOne({ where: { referenceNo: idOrRef } });
      return inquiry ? inquiry.toJSON() : null;
    }
    const inquiry = await Inquiry.findByPk(idOrRef);
    return inquiry ? inquiry.toJSON() : null;
  },
};

export default inquiryService;
