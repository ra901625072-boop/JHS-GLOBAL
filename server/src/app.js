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

  // Security Headers (configured to allow serving SPA static assets with strict Content-Security-Policy)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          connectSrc: ["'self'", 'https:', 'ws:', 'wss:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Helper to determine if an origin is permitted
  const isAllowedOrigin = (origin, req) => {
    if (!origin) return true;

    // Configured allowed origins from environment and standard development ports
    const allowedOrigins = [
      env.CLIENT_URL,
      process.env.CLIENT_URL,
      process.env.RENDER_EXTERNAL_URL,
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
      'https://jhs-global.onrender.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return true;
    }

    try {
      const parsedOrigin = new URL(origin);

      // 1. Same-Origin Check: Request Origin host matches server Host header
      const host = req?.headers?.host;
      if (host && (parsedOrigin.host === host || parsedOrigin.hostname === host.split(':')[0])) {
        return true;
      }

      // 2. Render wildcard deployments (*.onrender.com)
      if (parsedOrigin.hostname.endsWith('.onrender.com')) {
        return true;
      }

      // 3. Localhost on any port in development/test
      if (env.NODE_ENV !== 'production' && (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1')) {
        return true;
      }
    } catch {
      return false;
    }

    return false;
  };

  // CORS Configuration
  app.use(
    cors((req, callback) => {
      // Allow public static assets and SEO metadata to be fetched freely without CORS blocking
      const isPublicStatic =
        req.path.startsWith('/assets/') ||
        req.path.startsWith('/fonts/') ||
        req.path.startsWith('/images/') ||
        req.path === '/favicon.ico' ||
        req.path === '/robots.txt' ||
        req.path === '/sitemap.xml';

      if (isPublicStatic) {
        return callback(null, {
          origin: true,
          methods: ['GET', 'HEAD', 'OPTIONS'],
        });
      }

      const origin = req.headers.origin;
      if (isAllowedOrigin(origin, req)) {
        return callback(null, {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
        });
      }

      const corsError = new Error('Not allowed by CORS');
      corsError.status = 403;
      return callback(corsError);
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
    app.use(
      express.static(clientDist, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          // Allow cross-origin asset access for fonts, styles, and module scripts
          res.setHeader('Access-Control-Allow-Origin', '*');
          // HTML files and service worker must revalidate immediately
          if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (
            filePath.includes(path.sep + 'assets' + path.sep) ||
            filePath.includes(path.sep + 'fonts' + path.sep) ||
            filePath.includes(path.sep + 'images' + path.sep)
          ) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    // Client-side routing fallback for non-API routes
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
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
