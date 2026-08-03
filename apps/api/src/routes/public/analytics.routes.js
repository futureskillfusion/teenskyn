import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const analyticsRouter = Router();

analyticsRouter.post('/analytics/events', async (req, res) => {
  const { type, productId, sessionId, metadata } = req.body || {};

  if (!type || !sessionId) {
    return res.status(204).end();
  }

  await prisma.analyticsEvent.create({
    data: {
      type,
      productId: productId || null,
      sessionId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  }).catch(() => {});

  res.status(204).end();
});
