import SampleRequest from './sample.model.js';
import logger from '../../utils/logger.js';

export const sampleService = {
  async generateReferenceNo() {
    const year = new Date().getFullYear();
    const last = await SampleRequest.findOne({
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
    return `SMP-${year}-${sequence}`;
  },

  async createSampleRequest(data) {
    const referenceNo = await this.generateReferenceNo();

    const sample = await SampleRequest.create({
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
