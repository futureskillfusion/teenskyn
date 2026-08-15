import { Router } from 'express';
import { z } from 'zod';
import { listBookings, updateBookingStatus } from '../../services/bookingService.js';

export const adminBookingsRouter = Router();

adminBookingsRouter.get('/bookings', async (req, res) => {
  const { status } = req.query;
  const bookings = await listBookings({ status });
  res.json({ bookings });
});

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'confirmed', 'completed', 'cancelled']),
});

adminBookingsRouter.patch('/bookings/:id/status', async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const booking = await updateBookingStatus(req.params.id, status);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
});
