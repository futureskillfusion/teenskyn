import { Router } from 'express';
import { z } from 'zod';
import { initializeCheckout } from '../../services/checkoutService.js';

export const checkoutRouter = Router();

const checkoutSchema = z.object({
  items: z.array(z.object({
    variant_id: z.string(),
    quantity: z.number().int().min(1),
  })).min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

checkoutRouter.post('/checkout', async (req, res, next) => {
  try {
    const parsed = checkoutSchema.parse(req.body);
    const result = await initializeCheckout(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
