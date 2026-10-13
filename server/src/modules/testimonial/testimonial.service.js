import Testimonial from './testimonial.model.js';

export const testimonialService = {
  async listPublicTestimonials() {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']],
    });
    return testimonials.map((t) => t.toJSON());
  },
};

export default testimonialService;
