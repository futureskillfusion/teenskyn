import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const adminDashboardRouter = Router();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function revenueSince(date) {
  const result = await prisma.order.aggregate({
    where: { status: { in: ['paid', 'fulfilled'] }, createdAt: { gte: date } },
    _sum: { totalInCents: true },
    _count: true,
  });
  return { totalInCents: result._sum.totalInCents || 0, orderCount: result._count || 0 };
}

adminDashboardRouter.get('/dashboard/summary', async (req, res) => {
  const now = new Date();
  const [
    today, last7d, last30d, allTime,
    statusCounts, recentOrders, lowStock, topProducts, eventCounts,
    totalCustomers, totalOrders, totalProducts, pendingOrders, activeSales, newBookings,
  ] = await Promise.all([
    revenueSince(daysAgo(0)),
    revenueSince(daysAgo(7)),
    revenueSince(daysAgo(30)),
    revenueSince(new Date(0)),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.productVariant.findMany({
      where: { manageInventory: true, inventoryQuantity: { lte: 5 } },
      include: { product: true },
      take: 10,
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'titleSnapshot'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      where: { createdAt: { gte: daysAgo(30) } },
      _count: true,
    }),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.product.count({ where: { status: 'active', deletedAt: null } }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.productVariant.count({
      where: {
        salePriceInCents: { not: null },
        AND: [
          { OR: [{ saleStartsAt: null }, { saleStartsAt: { lte: now } }] },
          { OR: [{ saleEndsAt: null }, { saleEndsAt: { gte: now } }] },
        ],
      },
    }),
    prisma.booking.count({ where: { status: 'new' } }),
  ]);

  res.json({
    stats: {
      totalCustomers,
      totalOrders,
      totalProducts,
      totalRevenueInCents: allTime.totalInCents,
      revenueTodayInCents: today.totalInCents,
      pendingOrders,
      activeSales,
      newBookings,
    },
    revenue: { today, last7d, last30d },
    ordersByStatus: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
    recentOrders,
    lowStock: lowStock.map((v) => ({
      variantId: v.id,
      productId: v.productId,
      title: v.product.title,
      variantTitle: v.title,
      inventoryQuantity: v.inventoryQuantity,
    })),
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      title: p.titleSnapshot,
      unitsSold: p._sum.quantity,
    })),
    funnel: {
      product_view: eventCounts.find((e) => e.type === 'product_view')?._count || 0,
      add_to_cart: eventCounts.find((e) => e.type === 'add_to_cart')?._count || 0,
      checkout_started: eventCounts.find((e) => e.type === 'checkout_started')?._count || 0,
    },
  });
});
