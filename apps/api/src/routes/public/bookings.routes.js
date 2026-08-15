import { Router } from 'express';
import { z } from 'zod';
import { createBooking } from '../../services/bookingService.js';

export const bookingsRouter = Router();

const bookingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  age: z.number().int().min(1).max(120).optional(),
  service: z.string().min(1),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  notes: z.string().optional(),
});

bookingsRouter.post('/bookings', async (req, res, next) => {
  try {
    const parsed = bookingSchema.parse(req.body);
    const booking = await createBooking(parsed);
    res.status(201).json({ booking: { id: booking.id } });
  } catch (err) {
    next(err);
  }
});
