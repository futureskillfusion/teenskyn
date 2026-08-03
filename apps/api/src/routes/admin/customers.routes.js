import { Router } from 'express';
import { listCustomers, getCustomer } from '../../services/orderService.js';

export const adminCustomersRouter = Router();

adminCustomersRouter.get('/customers', async (req, res) => {
  const { search } = req.query;
  const customers = await listCustomers({ search });
  res.json({ customers });
});

adminCustomersRouter.get('/customers/:id', async (req, res) => {
  const customer = await getCustomer(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ customer });
});
