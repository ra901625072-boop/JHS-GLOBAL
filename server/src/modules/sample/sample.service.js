import crypto from 'crypto';
import { Op, Sequelize } from 'sequelize';
import SampleRequest from './sample.model.js';
import User from '../user/user.model.js';
import Inquiry from '../inquiry/inquiry.model.js';
import logger from '../../utils/logger.js';
import { recordAuditLog } from '../audit/audit.service.js';

export const generateTrackingUrl = (courier, awb) => {
  if (!awb || !String(awb).trim()) return '';
  const cleanAwb = String(awb).trim();
  const c = String(courier || '').toUpperCase();

  if (c.includes('DHL')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(cleanAwb)}`;
  }
  if (c.includes('FEDEX')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(cleanAwb)}`;
  }
  if (c.includes('UPS')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(cleanAwb)}`;
  }
  if (c.includes('ARAMEX')) {
    return `https://www.aramex.com/us/en/track/shipments?ShipmentNumber=${encodeURIComponent(cleanAwb)}`;
  }
  if (c.includes('INDIA POST') || c.includes('SPEED POST')) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cptc.etracking/tracking.aspx?article=${encodeURIComponent(cleanAwb)}`;
  }
  return '';
};

export const sampleService = {
  generateTrackingUrl,

  async generateReferenceNo() {
    const year = new Date().getFullYear();
    const prefix = `SMP-${year}-`;
    const candidates = await SampleRequest.findAll({
      where: {
        referenceNo: {
          [Op.like]: `${prefix}%`,
        },
      },
      attributes: ['referenceNo'],
      order: [['referenceNo', 'DESC']],
      limit: 10,
    });
    let seq = 1;
    for (const cand of candidates) {
      const parts = cand.referenceNo.split('-');
      if (parts.length === 3 && !isNaN(parseInt(parts[2], 10))) {
        seq = parseInt(parts[2], 10) + 1;
        break;
      }
    }
    const sequence = String(seq).padStart(6, '0');
    return `${prefix}${sequence}`;
  },

  async createSampleRequest(data) {
    let sample;
    for (let attempt = 0; attempt < 3; attempt++) {
      const referenceNo = await this.generateReferenceNo();
      try {
        sample = await SampleRequest.create({
          referenceNo,
          buyer: {
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone || '',
            country: data.country,
          },
          products: data.products || [],
          shippingAddress: data.shippingAddress || {},
          courierAccount: data.courierAccount || {},
          testingParameters: data.testingParameters || '',
          status: 'new',
          courier: data.courierAccount?.provider || 'DHL',
          inquiryId: data.inquiryId ? parseInt(data.inquiryId, 10) : null,
        });
        break;
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError' && attempt < 2) {
          logger.warn(`Sample reference ${referenceNo} collision. Retrying...`);
          continue;
        }
        throw err;
      }
    }

    logger.info(`Sample request created: ${sample.referenceNo} for ${sample.buyer.company}`);
    return sample;
  },

  async listSampleRequests(filters = {}) {
    const { status, q, country, page = 1, limit = 20 } = filters;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (country) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        Sequelize.where(
          Sequelize.literal(`COALESCE("shipping_address"->>'country', "buyer"->>'country')`),
          { [Op.iLike]: `%${country.trim()}%` }
        )
      );
    }

    if (q && q.trim()) {
      const searchTerm = q.trim();
      where[Op.or] = [
        { referenceNo: { [Op.iLike]: `%${searchTerm}%` } },
        { awbNumber: { [Op.iLike]: `%${searchTerm}%` } },
        { trackingNo: { [Op.iLike]: `%${searchTerm}%` } },
        Sequelize.where(Sequelize.literal(`"buyer"->>'name'`), { [Op.iLike]: `%${searchTerm}%` }),
        Sequelize.where(Sequelize.literal(`"buyer"->>'company'`), { [Op.iLike]: `%${searchTerm}%` }),
        Sequelize.where(Sequelize.literal(`"buyer"->>'email'`), { [Op.iLike]: `%${searchTerm}%` }),
        Sequelize.where(Sequelize.literal(`"shipping_address"->>'city'`), { [Op.iLike]: `%${searchTerm}%` }),
        Sequelize.where(Sequelize.literal(`"shipping_address"->>'country'`), { [Op.iLike]: `%${searchTerm}%` }),
        Sequelize.where(Sequelize.cast(Sequelize.col('products'), 'text'), { [Op.iLike]: `%${searchTerm}%` }),
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await SampleRequest.findAndCountAll({
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

    const samples = rows.map((s) => {
      const plain = s.toJSON();
      if (plain.assignee) plain.assignedTo = plain.assignee;
      if (!plain.trackingUrl && plain.awbNumber) {
        plain.trackingUrl = generateTrackingUrl(plain.courier, plain.awbNumber);
      }
      return plain;
    });

    return {
      samples,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(count / limitNum) || 1,
      },
    };
  },

  async getSampleById(id) {
    const sample = await SampleRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'role'],
        },
        {
          model: Inquiry,
          as: 'inquiry',
          attributes: ['id', 'referenceNo', 'status', 'buyer'],
        },
      ],
    });

    if (!sample) {
      const error = new Error('Sample request not found');
      error.statusCode = 404;
      throw error;
    }

    const plain = sample.toJSON();
    if (plain.assignee) plain.assignedTo = plain.assignee;
    if (!plain.trackingUrl && plain.awbNumber) {
      plain.trackingUrl = generateTrackingUrl(plain.courier, plain.awbNumber);
    }
    return plain;
  },

  async updateSampleRequest(id, data, user = null, req = null) {
    const sample = await SampleRequest.findByPk(id);
    if (!sample) {
      const error = new Error('Sample request not found');
      error.statusCode = 404;
      throw error;
    }

    const beforeSnapshot = sample.toJSON();

    if (data.status) sample.status = data.status;
    if (data.courier) sample.courier = data.courier;
    if (data.awbNumber !== undefined) {
      sample.awbNumber = data.awbNumber.trim();
      sample.trackingNo = data.awbNumber.trim();
    }

    if (data.trackingUrl !== undefined) {
      sample.trackingUrl = data.trackingUrl || generateTrackingUrl(sample.courier, sample.awbNumber);
    } else if (data.courier || data.awbNumber) {
      sample.trackingUrl = generateTrackingUrl(sample.courier, sample.awbNumber);
    }

    if (data.estimatedDeliveryDate !== undefined) {
      sample.estimatedDeliveryDate = data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate) : null;
    }

    if (data.assignedTo !== undefined) {
      sample.assignedTo = data.assignedTo ? parseInt(data.assignedTo, 10) : null;
    }

    if (data.note && data.note.trim()) {
      const existingNotes = Array.isArray(sample.notes) ? [...sample.notes] : [];
      existingNotes.push({
        by: user?.name || 'Sales Staff',
        text: data.note.trim(),
        at: new Date().toISOString(),
      });
      sample.notes = existingNotes;
    }

    await sample.save();

    await recordAuditLog({
      req,
      user,
      action: 'sample.update',
      entityType: 'sample_request',
      entityId: sample.id,
      beforeSnapshot,
      afterSnapshot: sample.toJSON(),
      metadata: { status: sample.status, awbNumber: sample.awbNumber },
    });

    logger.info(`Sample ${sample.referenceNo} updated by ${user?.name || 'Staff'} - Status: ${sample.status}`);
    return this.getSampleById(sample.id);
  },

  async dispatchSampleRequest(id, data, user = null, req = null) {
    const sample = await SampleRequest.findByPk(id);
    if (!sample) {
      const error = new Error('Sample request not found');
      error.statusCode = 404;
      throw error;
    }

    const beforeSnapshot = sample.toJSON();
    const { courier, awbNumber, trackingUrl, estimatedDeliveryDate, note, documents } = data;

    sample.status = 'dispatched';
    sample.courier = courier;
    sample.awbNumber = awbNumber.trim();
    sample.trackingNo = awbNumber.trim();
    sample.trackingUrl = trackingUrl || generateTrackingUrl(courier, awbNumber);
    sample.dispatchedAt = new Date();

    if (estimatedDeliveryDate) {
      sample.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    if (documents && Array.isArray(documents) && documents.length > 0) {
      const existingDocs = Array.isArray(sample.documents) ? [...sample.documents] : [];
      documents.forEach((doc) => {
        existingDocs.push({
          id: crypto.randomUUID(),
          type: doc.type || 'COA',
          name: doc.name,
          url: doc.url,
          uploadedAt: new Date().toISOString(),
        });
      });
      sample.documents = existingDocs;
    }

    const existingNotes = Array.isArray(sample.notes) ? [...sample.notes] : [];
    existingNotes.push({
      by: user?.name || 'Dispatch Desk',
      text: `Sample package handed to ${courier} [AWB: ${awbNumber}]. Live tracking established.${
        note ? ` Note: ${note}` : ''
      }`,
      at: new Date().toISOString(),
    });
    sample.notes = existingNotes;

    await sample.save();

    await recordAuditLog({
      req,
      user,
      action: 'sample.dispatch',
      entityType: 'sample_request',
      entityId: sample.id,
      beforeSnapshot,
      afterSnapshot: sample.toJSON(),
      metadata: { courier, awbNumber, trackingUrl: sample.trackingUrl },
    });

    logger.info(`Sample ${sample.referenceNo} dispatched via ${courier} [AWB: ${awbNumber}]`);
    return this.getSampleById(sample.id);
  },

  async attachDocument(id, { type, name, url }, user = null, req = null) {
    const sample = await SampleRequest.findByPk(id);
    if (!sample) {
      const error = new Error('Sample request not found');
      error.statusCode = 404;
      throw error;
    }

    const beforeSnapshot = sample.toJSON();
    const existingDocs = Array.isArray(sample.documents) ? [...sample.documents] : [];
    const newDoc = {
      id: crypto.randomUUID(),
      type: type || 'COA',
      name: name.trim(),
      url: url.trim(),
      uploadedAt: new Date().toISOString(),
    };
    existingDocs.push(newDoc);
    sample.documents = existingDocs;

    const existingNotes = Array.isArray(sample.notes) ? [...sample.notes] : [];
    existingNotes.push({
      by: user?.name || 'Staff',
      text: `Attached technical specification document: [${newDoc.type}] ${newDoc.name}`,
      at: new Date().toISOString(),
    });
    sample.notes = existingNotes;

    await sample.save();

    await recordAuditLog({
      req,
      user,
      action: 'sample.attach_document',
      entityType: 'sample_request',
      entityId: sample.id,
      beforeSnapshot,
      afterSnapshot: sample.toJSON(),
      metadata: { type: newDoc.type, name: newDoc.name },
    });

    logger.info(`Document attached to sample ${sample.referenceNo}: [${type}] ${name}`);
    return this.getSampleById(sample.id);
  },
};

export default sampleService;
