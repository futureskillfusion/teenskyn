import { prisma } from '../lib/prisma.js';

export function createBooking(data) {
  return prisma.booking.create({
    data: {
      name: data.name,
      phone: data.phone,
      age: data.age ?? null,
      service: data.service,
      preferredDate: data.preferredDate || null,
      preferredTime: data.preferredTime || null,
      notes: data.notes || null,
    },
  });
}

export function listBookings({ status } = {}) {
  return prisma.booking.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
  });
}

export function updateBookingStatus(id, status) {
  return prisma.booking.update({ where: { id }, data: { status } });
}
