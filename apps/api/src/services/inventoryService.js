import { prisma } from '../lib/prisma.js';

export async function decrementInventoryForOrder(orderId) {
  const items = await prisma.orderItem.findMany({ where: { orderId }, include: { variant: true } });

  for (const item of items) {
    if (item.variant?.manageInventory) {
      await prisma.productVariant.update({
        where: { id: item.variant.id },
        data: { inventoryQuantity: { decrement: item.quantity } },
      });
    }
  }
}

export async function hasSufficientStock(variantId, requestedQuantity) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return false;
  if (!variant.manageInventory) return true;
  return variant.inventoryQuantity >= requestedQuantity;
}
