import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR, FRONTEND_DIST_DIR } from './lib/paths.js';

import { productsRouter } from './routes/public/products.routes.js';
import { categoriesRouter } from './routes/public/categories.routes.js';
import { checkoutRouter } from './routes/public/checkout.routes.js';
import { webhookRouter } from './routes/public/webhook.routes.js';
import { analyticsRouter } from './routes/public/analytics.routes.js';

import { authRouter } from './routes/admin/auth.routes.js';
import { adminProductsRouter } from './routes/admin/products.routes.js';
import { adminCategoriesRouter } from './routes/admin/categories.routes.js';
import { adminOrdersRouter } from './routes/admin/orders.routes.js';
import { adminCustomersRouter } from './routes/admin/customers.routes.js';
import { adminDashboardRouter } from './routes/admin/dashboard.routes.js';

import { requireAdminAuth } from './middleware/requireAdminAuth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

  // Stripe webhook needs the raw body for signature verification, so it's
  // mounted with express.raw() before express.json() parses everything else.
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRouter);

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api', productsRouter);
  app.use('/api', categoriesRouter);
  app.use('/api', checkoutRouter);
  app.use('/api', analyticsRouter);

  app.use('/api/admin', authRouter);
  app.use('/api/admin', requireAdminAuth, adminProductsRouter);
  app.use('/api/admin', requireAdminAuth, adminCategoriesRouter);
  app.use('/api/admin', requireAdminAuth, adminOrdersRouter);
  app.use('/api/admin', requireAdminAuth, adminCustomersRouter);
  app.use('/api/admin', requireAdminAuth, adminDashboardRouter);

  // In production the built React app (storefront + /admin panel) is served
  // by this same Node process, so the host only needs to run one app.
  if (fs.existsSync(FRONTEND_DIST_DIR)) {
    app.use(express.static(FRONTEND_DIST_DIR));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
