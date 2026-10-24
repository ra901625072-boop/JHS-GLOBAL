import Certificate from '../modules/certificate/certificate.model.js';
import logger from '../utils/logger.js';

export const seedCertificates = async () => {
  logger.info('Seeding verified export certificates for JHS GLOBAL...');

  const certs = [
    {
      name: 'FSSAI Central License',
      fullName: 'Food Safety and Standards Authority of India (Central License - Exporter & Importer)',
      issuedBy: 'FSSAI Central Licensing Authority, Mumbai, Govt. of India',
      number: '10725997001058',
      scope: 'Central License for export and import of spices, pulses, cereals, dehydrated fruits, vegetables, food ingredients, and nutraceuticals.',
      file: { url: '/documents/fssai-license.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/fssai-license.png' },
      order: 1,
      isPublic: true,
    },
    {
      name: 'APEDA Registration',
      fullName: 'Agricultural and Processed Food Products Export Development Authority (RCMC)',
      issuedBy: 'APEDA, Ministry of Commerce and Industry, Govt. of India',
      number: 'RCMC/APEDA/15765/2024-2025',
      scope: 'Merchant Exporter registration for Basmati and Non-Basmati rice, fresh fruits & vegetables, processed food products, groundnuts, pulses, and cereals.',
      file: { url: '/documents/apeda-rcmc.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/apeda-rcmc.png' },
      order: 2,
      isPublic: true,
    },
    {
      name: 'Spices Board CRES',
      fullName: 'Certificate of Registration as Exporter of Spices (CRES)',
      issuedBy: 'Spices Board, Head Office, Cochin, Ministry of Commerce & Industry, Govt. of India',
      number: 'CRES/SBCB/26585/2025-2026',
      scope: 'Statutory registration as Merchant Exporter for all 52 scheduled Indian spices and spice derivatives.',
      file: { url: '/documents/spices-board-cres.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/spices-board-cres.png' },
      order: 3,
      isPublic: true,
    },
    {
      name: 'DGFT IEC',
      fullName: 'Directorate General of Foreign Trade Importer-Exporter Code (IEC)',
      issuedBy: 'Joint DGFT, Surat, Ministry of Commerce & Industry, Govt. of India',
      number: 'EZHPP3437C',
      scope: 'Permanent statutory trade license issued by Government of India authorizing international export shipments.',
      file: { url: '/documents/iec-certificate.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/iec-certificate.png' },
      order: 4,
      isPublic: true,
    },
    {
      name: 'GST Registration',
      fullName: 'Goods and Services Tax Registration Certificate (Form GST REG-06)',
      issuedBy: 'Central Board of Indirect Taxes and Customs, Government of India',
      number: '24EZHPP3437C1ZH',
      scope: 'Commercial tax registration establishing statutory business identity and zero-rated cross-border export documentation.',
      file: { url: '/documents/gst-certificate.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/gst-certificate.png' },
      order: 5,
      isPublic: true,
    },
    {
      name: 'MSME Udyam Registration',
      fullName: 'Ministry of Micro, Small and Medium Enterprises Udyam Registration Certificate',
      issuedBy: 'Ministry of MSME, Govt. of India',
      number: 'UDYAM-GJ-22-0460260',
      scope: 'Government registered micro enterprise under NIC Code 46209 (Wholesale of agricultural raw materials).',
      file: { url: '/documents/msme-udyam.pdf', type: 'pdf' },
      logo: { url: '/images/certifications/msme-udyam.png' },
      order: 6,
      isPublic: true,
    },
    {
      name: 'FIEO Registration',
      fullName: 'Federation of Indian Export Organisations',
      issuedBy: 'Federation of Indian Export Organisations (Set up by Ministry of Commerce, Govt. of India)',
      number: '', // TODO(client): verify exact certificate/registration number and validity
      scope: 'Apex trade facilitation organisation set up by Ministry of Commerce, Govt. of India, representing Indian exporters in global commerce.',
      file: { url: '', type: 'text' },
      logo: { url: '' }, // Text badge used until official logo is supplied by client
      order: 7,
      isPublic: true,
    },
  ];

  for (const c of certs) {
    let cert = await Certificate.findOne({ where: { name: c.name } });
    if (cert) {
      await cert.update(c);
    } else {
      await Certificate.create(c);
    }
    logger.info(`Updated/created certificate: ${c.name}`);
  }

  logger.info('Verified export certificates seeded successfully');
};

export default seedCertificates;
