import Faq from './faq.model.js';
import slugify from '../../utils/slugify.js';

export const faqService = {
  async listActiveFaqs(options = {}) {
    const { group, featured } = typeof options === 'string' ? { group: options } : options;
    const isFeatured = featured === true || featured === 'true';

    const where = { isActive: true };
    if (isFeatured) {
      where.showOnHome = true;
    } else if (group) {
      where.group = group;
    }

    const order = isFeatured
      ? [
          ['homeOrder', 'ASC'],
          ['order', 'ASC'],
        ]
      : [['order', 'ASC']];

    const faqs = await Faq.findAll({
      where,
      order,
    });
    return faqs.map((f) => f.toJSON());
  },

  async getFaqBySlug(slug) {
    const faq = await Faq.findOne({
      where: { slug, isActive: true },
    });
    return faq ? faq.toJSON() : null;
  },

  async listAllFaqs(options = {}) {
    const where = {};
    if (options.group) where.group = options.group;
    if (typeof options.isActive === 'boolean') where.isActive = options.isActive;

    const faqs = await Faq.findAll({
      where,
      order: [
        ['group', 'ASC'],
        ['order', 'ASC'],
      ],
    });
    return faqs.map((f) => f.toJSON());
  },

  async createFaq(data) {
    const baseSlug = data.slug || slugify(data.question);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await Faq.findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const faq = await Faq.create({
      ...data,
      slug: uniqueSlug,
    });

    // Asynchronously sync RAG embedding if available
    try {
      const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
      await syncFaqEmbedding(faq);
    } catch {
      // Embedding sync failure should not block core DB transaction
    }

    return faq.toJSON();
  },

  async updateFaq(id, data) {
    const faq = await Faq.findByPk(id);
    if (!faq) return null;

    if (data.slug && data.slug !== faq.slug) {
      const existing = await Faq.findOne({ where: { slug: data.slug } });
      if (existing && existing.id !== faq.id) {
        throw new Error('FAQ slug must be unique');
      }
    }

    await faq.update(data);

    try {
      const { syncFaqEmbedding } = await import('../ai/rag/embedding.service.js');
      await syncFaqEmbedding(faq);
    } catch {
      // Non-blocking
    }

    return faq.toJSON();
  },

  async deleteFaq(id) {
    const faq = await Faq.findByPk(id);
    if (!faq) return false;
    await faq.update({ isActive: false });
    return true;
  },
};

export default faqService;
