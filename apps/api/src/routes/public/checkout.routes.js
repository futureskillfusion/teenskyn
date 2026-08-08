import { Router } from 'express';
import { z } from 'zod';
import { initializeCheckout, createCodOrder } from '../../services/checkoutService.js';

export const checkoutRouter = Router();

const itemsSchema = z.array(z.object({
  variant_id: z.string(),
  quantity: z.number().int().min(1),
})).min(1);

const checkoutSchema = z.object({
  items: itemsSchema,
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

const codCheckoutSchema = z.object({
  items: itemsSchema,
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
  }),
});

checkoutRouter.post('/checkout/cod', async (req, res, next) => {
  try {
    const parsed = codCheckoutSchema.parse(req.body);
    const result = await createCodOrder(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
