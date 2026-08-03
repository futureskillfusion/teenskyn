import { prisma } from '../lib/prisma.js';
import { stripe } from '../lib/stripe.js';
import { generateOrderNumber } from './orderService.js';

class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function initializeCheckout({ items, successUrl, cancelUrl }) {
  if (!items || !items.length) {
    throw new CheckoutError('Cart is empty');
  }

  const variantIds = items.map((i) => i.variant_id);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  const lineItems = [];
  const orderItemsData = [];
  let subtotalInCents = 0;

  for (const item of items) {
    const variant = variantMap.get(item.variant_id);
    if (!variant) {
      throw new CheckoutError(`Product variant ${item.variant_id} no longer exists`);
    }
    if (variant.manageInventory && variant.inventoryQuantity < item.quantity) {
      throw new CheckoutError(`Not enough stock for ${variant.product.title} (${variant.title})`);
    }

    const unitPrice = variant.salePriceInCents ?? variant.priceInCents;
    const lineTotal = unitPrice * item.quantity;
    subtotalInCents += lineTotal;

    orderItemsData.push({
      productId: variant.productId,
      variantId: variant.id,
      titleSnapshot: variant.product.title,
      variantTitleSnapshot: variant.title,
      skuSnapshot: variant.sku,
      unitPriceInCents: unitPrice,
      quantity: item.quantity,
      lineTotalInCents: lineTotal,
    });

    lineItems.push({
      price_data: {
        currency: 'myr',
        product_data: { name: `${variant.product.title}${variant.title !== 'Default Variant' ? ` — ${variant.title}` : ''}` },
        unit_amount: unitPrice,
      },
      quantity: item.quantity,
    });
  }

  const orderNumber = await generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: 'pending',
      subtotalInCents,
      totalInCents: subtotalInCents,
      currency: 'myr',
      customerEmail: '',
      items: { create: orderItemsData },
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { url: session.url };
}
