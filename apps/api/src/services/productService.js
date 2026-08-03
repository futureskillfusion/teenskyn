import { prisma } from '../lib/prisma.js';
import { cleanHtml } from '../utils/sanitizeHtml.js';

const PRODUCT_INCLUDE = {
  images: true,
  variants: true,
  category: true,
};

export function listPublicProducts({ limit, offset, order, categoryId } = {}) {
  return prisma.product.findMany({
    where: {
      status: 'active',
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
    },
    include: PRODUCT_INCLUDE,
    orderBy: { order: order === 'DESC' ? 'desc' : 'asc' },
    take: limit ? Number(limit) : undefined,
    skip: offset ? Number(offset) : undefined,
  });
}

export function countPublicProducts({ categoryId } = {}) {
  return prisma.product.count({
    where: {
      status: 'active',
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
    },
  });
}

export function getPublicProduct(id) {
  return prisma.product.findFirst({
    where: { id, status: 'active', deletedAt: null },
    include: PRODUCT_INCLUDE,
  });
}

export function listAdminProducts({ search, status } = {}) {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search } } : {}),
    },
    include: PRODUCT_INCLUDE,
    orderBy: { updatedAt: 'desc' },
  });
}

export function getAdminProduct(id) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: PRODUCT_INCLUDE,
  });
}

export async function createProduct(data) {
  return prisma.product.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      ribbonText: data.ribbonText || null,
      description: cleanHtml(data.description || ''),
      thumbnailUrl: data.thumbnailUrl || null,
      purchasable: data.purchasable ?? true,
      order: data.order ?? 0,
      status: data.status || 'active',
      categoryId: data.categoryId || null,
      variants: {
        create: (data.variants && data.variants.length
          ? data.variants
          : [{ title: 'Default Variant', priceInCents: 0 }]
        ).map((v) => ({
          title: v.title || 'Default Variant',
          sku: v.sku || null,
          priceInCents: v.priceInCents,
          salePriceInCents: v.salePriceInCents ?? null,
          currency: 'myr',
          manageInventory: v.manageInventory ?? true,
          inventoryQuantity: v.inventoryQuantity ?? 0,
        })),
      },
    },
    include: PRODUCT_INCLUDE,
  });
}

export async function updateProduct(id, data) {
  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.ribbonText !== undefined) updateData.ribbonText = data.ribbonText;
  if (data.description !== undefined) updateData.description = cleanHtml(data.description);
  if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl;
  if (data.purchasable !== undefined) updateData.purchasable = data.purchasable;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;

  await prisma.product.update({ where: { id }, data: updateData });

  if (data.variants) {
    const existingIds = data.variants.filter((v) => v.id).map((v) => v.id);
    await prisma.productVariant.deleteMany({
      where: { productId: id, id: { notIn: existingIds.length ? existingIds : ['__none__'] } },
    });

    for (const v of data.variants) {
      const variantData = {
        title: v.title || 'Default Variant',
        sku: v.sku || null,
        priceInCents: v.priceInCents,
        salePriceInCents: v.salePriceInCents ?? null,
        manageInventory: v.manageInventory ?? true,
        inventoryQuantity: v.inventoryQuantity ?? 0,
      };

      if (v.id) {
        await prisma.productVariant.update({ where: { id: v.id }, data: variantData });
      } else {
        await prisma.productVariant.create({ data: { ...variantData, productId: id, currency: 'myr' } });
      }
    }
  }

  return getAdminProduct(id);
}

export function softDeleteProduct(id) {
  return prisma.product.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } });
}

export function addProductImage(productId, url) {
  return prisma.productImage.create({ data: { productId, url, order: 0 } });
}

export function removeProductImage(productId, imageId) {
  return prisma.productImage.deleteMany({ where: { id: imageId, productId } });
}
