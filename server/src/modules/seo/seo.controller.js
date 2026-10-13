import env from '../../config/env.js';
import Category from '../category/category.model.js';
import Product from '../product/product.model.js';
import BlogPost from '../blog/blog.model.js';

export const getSitemap = async (req, res, next) => {
  try {
    const clientUrl = env.CLIENT_URL.replace(/\/+$/, '');

    const [categories, products, blogPosts] = await Promise.all([
      Category.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
      Product.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
      BlogPost.findAll({ where: { status: 'published' }, attributes: ['slug', 'updatedAt'] }),
    ]);

    const staticRoutes = [
      { loc: `${clientUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${clientUrl}/products`, priority: '0.9', changefreq: 'daily' },
      { loc: `${clientUrl}/quality`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${clientUrl}/export-process`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${clientUrl}/global-reach`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${clientUrl}/private-label`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${clientUrl}/about`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${clientUrl}/sample-request`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${clientUrl}/faq`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${clientUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${clientUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const r of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${r.loc}</loc>\n`;
      xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
      xml += `    <priority>${r.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Category pages
    for (const c of categories) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/categories/${c.slug}</loc>\n`;
      xml += `    <lastmod>${(c.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Product pages
    for (const p of products) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/products/${p.slug}</loc>\n`;
      xml += `    <lastmod>${(p.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // Blog articles
    for (const b of blogPosts) {
      xml += `  <url>\n`;
      xml += `    <loc>${clientUrl}/blog/${b.slug}</loc>\n`;
      xml += `    <lastmod>${(b.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

export const getRobots = (req, res) => {
  const clientUrl = env.CLIENT_URL.replace(/\/+$/, '');
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${clientUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  return res.status(200).send(content);
};
