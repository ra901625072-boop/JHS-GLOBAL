import Certificate from './certificate.model.js';

export const certificateService = {
  async listPublicCertificates() {
    const certs = await Certificate.findAll({
      where: { isActive: true, isPublic: true },
      order: [
        ['order', 'ASC'],
        ['name', 'ASC'],
      ],
    });
    return certs.map((c) => {
      const data = c.toJSON();
      return {
        ...data,
        image: data.image || data.logo?.url || '',
      };
    });
  },

  async getCertificateById(id) {
    const cert = await Certificate.findByPk(id);
    return cert ? cert.toJSON() : null;
  },
};

export default certificateService;
