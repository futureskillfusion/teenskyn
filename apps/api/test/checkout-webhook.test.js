import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/lib/prisma.js';

const mockSessionsCreate = vi.fn().mockResolvedValue({ id: 'cs_test_123', url: 'https://checkout.stripe.com/test-session' });
const mockConstructEvent = vi.fn((body) => JSON.parse(body.toString()));

vi.mock('../src/lib/stripe.js', () => ({
  stripe: {
    checkout: { sessions: { create: (...args) => mockSessionsCreate(...args) } },
    webhooks: { constructEvent: (...args) => mockConstructEvent(...args) },
  },
}));

const { createApp } = await import('../src/app.js');

describe('checkout + stripe webhook', () => {
  const app = createApp();
  let product;
  let variant;

  beforeAll(async () => {
    product = await prisma.product.create({
      data: {
        title: 'Checkout Test Product',
        status: 'active',
        variants: { create: [{ title: 'Default Variant', priceInCents: 5000, inventoryQuantity: 5 }] },
      },
      include: { variants: true },
    });
    variant = product.variants[0];
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { items: { some: { productId: product.id } } } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.$disconnect();
  });

  it('rejects checkout for an unknown variant', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ variant_id: 'nope', quantity: 1 }], successUrl: 'http://localhost:3000/', cancelUrl: 'http://localhost:3000/' });
    expect(res.status).toBe(400);
  });

  it('rejects checkout when quantity exceeds stock', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ variant_id: variant.id, quantity: 999 }], successUrl: 'http://localhost:3000/', cancelUrl: 'http://localhost:3000/' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  it('creates a pending order and a Stripe checkout session', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ variant_id: variant.id, quantity: 2 }], successUrl: 'http://localhost:3000/', cancelUrl: 'http://localhost:3000/' });

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://checkout.stripe.com/test-session');
    expect(mockSessionsCreate).toHaveBeenCalled();

    const order = await prisma.order.findUnique({ where: { stripeCheckoutSessionId: 'cs_test_123' } });
    expect(order).not.toBeNull();
    expect(order.status).toBe('pending');
    expect(order.totalInCents).toBe(10000);
  });

  it('marks the order paid and decrements stock on checkout.session.completed', async () => {
    const payload = {
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_test_123',
          customer_details: { email: 'shopper@example.com', name: 'Test Shopper' },
        },
      },
    };

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'irrelevant-because-mocked')
      .send(JSON.stringify(payload));

    expect(res.status).toBe(200);

    const order = await prisma.order.findUnique({ where: { stripeCheckoutSessionId: 'cs_test_123' } });
    expect(order.status).toBe('paid');
    expect(order.customerEmail).toBe('shopper@example.com');

    const updatedVariant = await prisma.productVariant.findUnique({ where: { id: variant.id } });
    expect(updatedVariant.inventoryQuantity).toBe(3);
  });

  it('is idempotent on duplicate webhook delivery', async () => {
    const payload = {
      id: 'evt_test_2',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123', payment_intent: 'pi_test_123', customer_details: { email: 'shopper@example.com' } } },
    };

    await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'irrelevant-because-mocked')
      .send(JSON.stringify(payload));

    const updatedVariant = await prisma.productVariant.findUnique({ where: { id: variant.id } });
    expect(updatedVariant.inventoryQuantity).toBe(3);
  });
});
