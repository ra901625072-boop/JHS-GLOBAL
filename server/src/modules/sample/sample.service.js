import { Op } from 'sequelize';
import SampleRequest from './sample.model.js';
import logger from '../../utils/logger.js';

export const sampleService = {
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

  async listSampleRequests() {
    const samples = await SampleRequest.findAll({
      order: [['createdAt', 'DESC']],
    });
    return samples.map((s) => s.toJSON());
  },
};

export default sampleService;
