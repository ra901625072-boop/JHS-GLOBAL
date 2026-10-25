import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import Category from '../server/src/modules/category/category.model.js';
import Product from '../server/src/modules/product/product.model.js';
import BlogPost from '../server/src/modules/blog/blog.model.js';

async function buildStaticSitemap() {
  await connectDB();
  const clientUrl = 'https://jhsglobal.in';

  const [categories, products, blogPosts] = await Promise.all([
    Category.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
    Product.findAll({ where: { isActive: true }, attributes: ['slug', 'updatedAt'] }),
    BlogPost.findAll({ where: { status: 'published' }, attributes: ['slug', 'updatedAt'] }),
  ]);

  console.log(`Active categories: ${categories.length}`);
  console.log(`Active products: ${products.length}`);
  console.log(`Published blog posts: ${blogPosts.length}`);

  const staticRoutes = [
    { loc: `${clientUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${clientUrl}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${clientUrl}/quality`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/export-process`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/about-us`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/sample-request`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/faq`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/contact`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${clientUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const r of staticRoutes) {
    xml += '  <url>\n';
    xml += `    <loc>${r.loc}</loc>\n`;
    xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
    xml += `    <priority>${r.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const c of categories) {
    xml += '  <url>\n';
    xml += `    <loc>${clientUrl}/categories/${c.slug}</loc>\n`;
    xml += `    <lastmod>${(c.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  for (const p of products) {
    xml += '  <url>\n';
    xml += `    <loc>${clientUrl}/products/${p.slug}</loc>\n`;
    xml += `    <lastmod>${(p.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  }

  for (const b of blogPosts) {
    xml += '  <url>\n';
    xml += `    <loc>${clientUrl}/blog/${b.slug}</loc>\n`;
    xml += `    <lastmod>${(b.updatedAt || new Date()).toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  const outPath = path.resolve('client', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Successfully wrote client/public/sitemap.xml with ${staticRoutes.length + categories.length + products.length + blogPosts.length} total URLs.`);

  await disconnectDB();
}

buildStaticSitemap().catch(console.error);
