import Faq from './faq.model.js';

export const faqService = {
  async listActiveFaqs(group) {
    const where = { isActive: true };
    if (group) where.group = group;
    const faqs = await Faq.findAll({
      where,
      order: [['order', 'ASC']],
    });
    return faqs.map((f) => f.toJSON());
  },
};

export default faqService;
