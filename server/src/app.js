import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import './models/index.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { successResponse } from './utils/apiResponse.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
import notFoundHandler from './middlewares/notFound.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import productRoutes from './modules/product/product.routes.js';
import inquiryRoutes from './modules/inquiry/inquiry.routes.js';
import sampleRoutes from './modules/sample/sample.routes.js';
import certificateRoutes from './modules/certificate/certificate.routes.js';
import testimonialRoutes from './modules/testimonial/testimonial.routes.js';
import marketRegionRoutes from './modules/marketRegion/marketRegion.routes.js';
import faqRoutes from './modules/faq/faq.routes.js';
import companyFactRoutes from './modules/companyFact/companyFact.routes.js';
import blogRoutes from './modules/blog/blog.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import quotationRoutes from './modules/quotation/quotation.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import { getSitemap, getRobots } from './modules/seo/seo.controller.js';
import redirectLegacyUrlsMiddleware from './middlewares/redirect.middleware.js';

export const createApp = () => {
  const app = express();

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security Headers (configured to allow serving SPA static assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    })
  );

  // Response compression (gzip/deflate for payloads >= 1KB)
  app.use(compression({ threshold: 1024 }));

  // Body and cookie parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Request logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.originalUrl !== '/api/v1/health') {
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  // Base rate limiter for public API
  app.use('/api/v1', generalLimiter);

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    return successResponse(res, {
      status: 'healthy',
      service: 'export-b2b-api',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // 301 Permanent Redirects for Decommissioned Legacy URLs
  app.use(redirectLegacyUrlsMiddleware);

  // Feature Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/inquiries', inquiryRoutes);
  app.use('/api/v1/samples', sampleRoutes);
  app.use('/api/v1/certificates', certificateRoutes);
  app.use('/api/v1/testimonials', testimonialRoutes);
  app.use('/api/v1/market-regions', marketRegionRoutes);
  app.use('/api/v1/faqs', faqRoutes);
  app.use('/api/v1/company-facts', companyFactRoutes);
  app.use('/api/v1/blog', blogRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/quotations', quotationRoutes);
  app.use('/api/v1/customers', customerRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/tasks', taskRoutes);
  app.use('/api/v1/search/suggest', (req, res, next) => {
    // Alias to product suggest
    req.url = '/suggest' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
    return productRoutes(req, res, next);
  });

  // SEO Endpoints (root level)
  app.get('/sitemap.xml', getSitemap);
  app.get('/robots.txt', getRobots);

  // Serve Frontend Static Files in Production / when client/dist exists
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));

    // Client-side routing fallback for non-API routes
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // 404 Fallback for unhandled API routes
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
