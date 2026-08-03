import { Router } from 'express';
import { z } from 'zod';
import { listOrders, getOrder, updateOrderStatus } from '../../services/orderService.js';

export const adminOrdersRouter = Router();

const statusSchema = z.object({
  status: z.enum(['pending', 'paid', 'fulfilled', 'cancelled', 'refunded']),
});

adminOrdersRouter.get('/orders', async (req, res) => {
  const { status, search } = req.query;
  const orders = await listOrders({ status, search });
  res.json({ orders });
});

adminOrdersRouter.get('/orders/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

adminOrdersRouter.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const order = await updateOrderStatus(req.params.id, status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});
