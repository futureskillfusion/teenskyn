import { prisma } from '../lib/prisma.js';

export async function generateOrderNumber() {
  const count = await prisma.order.count();
  return `TS-${1001 + count}`;
}

export function listOrders({ status, search } = {}) {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? { OR: [
        { orderNumber: { contains: search } },
        { customerEmail: { contains: search } },
      ] } : {}),
    },
    include: { items: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function getOrder(id) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true, variant: true } }, customer: true },
  });
}

export function getOrderByStripeSessionId(sessionId) {
  return prisma.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });
}

export function updateOrderStatus(id, status) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function upsertCustomerByEmail({ email, name }) {
  return prisma.customer.upsert({
    where: { email },
    update: { ...(name ? { name } : {}) },
    create: { email, name: name || null },
  });
}

export function listCustomers({ search } = {}) {
  return prisma.customer.findMany({
    where: search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } },
      ],
    } : {},
    orderBy: { createdAt: 'desc' },
  });
}

export function getCustomer(id) {
  return prisma.customer.findUnique({
    where: { id },
    include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } },
  });
}
