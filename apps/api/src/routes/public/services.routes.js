import { Router } from 'express';
import { listPublicServices } from '../../services/serviceCatalog.js';

export const servicesRouter = Router();

servicesRouter.get('/services', async (req, res) => {
  const services = await listPublicServices();
  res.json({
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      duration: s.durationText,
      price: s.priceText,
      description: s.description,
    })),
  });
});
