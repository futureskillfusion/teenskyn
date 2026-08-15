import { Router } from 'express';
import { z } from 'zod';
import {
  listAdminServices,
  getAdminService,
  createService,
  updateService,
  softDeleteService,
} from '../../services/serviceCatalog.js';

export const adminServicesRouter = Router();

const serviceSchema = z.object({
  title: z.string().min(1),
  durationText: z.string().min(1),
  priceText: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

adminServicesRouter.get('/services', async (req, res) => {
  const services = await listAdminServices();
  res.json({ services });
});

adminServicesRouter.get('/services/:id', async (req, res) => {
  const service = await getAdminService(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ service });
});

adminServicesRouter.post('/services', async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const service = await createService(data);
    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
});

adminServicesRouter.patch('/services/:id', async (req, res, next) => {
  try {
    const data = serviceSchema.partial().parse(req.body);
    const service = await updateService(req.params.id, data);
    res.json({ service });
  } catch (err) {
    next(err);
  }
});

adminServicesRouter.delete('/services/:id', async (req, res) => {
  await softDeleteService(req.params.id);
  res.status(204).end();
});
