import { prisma } from '../lib/prisma.js';

export function listPublicServices() {
  return prisma.service.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { order: 'asc' },
  });
}

export function listAdminServices() {
  return prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' },
  });
}

export function getAdminService(id) {
  return prisma.service.findFirst({ where: { id, deletedAt: null } });
}

export function createService(data) {
  return prisma.service.create({
    data: {
      title: data.title,
      durationText: data.durationText,
      priceText: data.priceText,
      description: data.description || '',
      order: data.order ?? 0,
      active: data.active ?? true,
    },
  });
}

export function updateService(id, data) {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.durationText !== undefined) updateData.durationText = data.durationText;
  if (data.priceText !== undefined) updateData.priceText = data.priceText;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.active !== undefined) updateData.active = data.active;
  return prisma.service.update({ where: { id }, data: updateData });
}

export function softDeleteService(id) {
  return prisma.service.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
}
