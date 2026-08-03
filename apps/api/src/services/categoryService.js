import { prisma } from '../lib/prisma.js';
import { slugify } from '../utils/slugify.js';

export function listCategories() {
  return prisma.category.findMany({ where: { deletedAt: null }, orderBy: { order: 'asc' } });
}

export function getCategory(id) {
  return prisma.category.findFirst({ where: { id, deletedAt: null } });
}

export async function createCategory(data) {
  let slug = slugify(data.title);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  return prisma.category.create({
    data: { title: data.title, slug, imageUrl: data.imageUrl || null, order: data.order ?? 0 },
  });
}

export function updateCategory(id, data) {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.order !== undefined) updateData.order = data.order;
  return prisma.category.update({ where: { id }, data: updateData });
}

export function softDeleteCategory(id) {
  return prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });
}
