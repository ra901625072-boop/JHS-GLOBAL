import SampleRequest from './sample.model.js';
import logger from '../../utils/logger.js';

export const sampleService = {
  async generateReferenceNo() {
    const year = new Date().getFullYear();
    const count = await SampleRequest.count();
    const sequence = String(count + 1).padStart(6, '0');
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
