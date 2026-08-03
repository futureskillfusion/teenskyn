import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

describe('public product & category API', () => {
  const app = createApp();
  let category;
  let product;

  beforeAll(async () => {
    category = await prisma.category.create({
      data: { title: 'Test Category', slug: `test-category-${Date.now()}` },
    });

    product = await prisma.product.create({
      data: {
        title: 'Test Serum',
        subtitle: '20 ml',
        description: 'A test product',
        status: 'active',
        categoryId: category.id,
        variants: {
          create: [{ title: 'Default Variant', priceInCents: 4200, inventoryQuantity: 10 }],
        },
      },
      include: { variants: true },
    });
  });

  afterAll(async () => {
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: category.id } });
    await prisma.$disconnect();
  });

  it('lists active products in the normalized shape', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    const found = res.body.products.find((p) => p.id === product.id);
    expect(found).toBeDefined();
    expect(found.variants[0].price_formatted).toBe('RM42.00');
    expect(found.variants[0].currency_info).toEqual({ code: 'MYR', symbol: 'RM', template: 'RM$1', decimal_digits: 2 });
  });

  it('retrieves a single product by id', async () => {
    const res = await request(app).get(`/api/products/${product.id}`);
    expect(res.status).toBe(200);
    expect(res.body.product.title).toBe('Test Serum');
  });

  it('returns 404 for a missing product', async () => {
    const res = await request(app).get('/api/products/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('lists categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories.some((c) => c.id === category.id)).toBe(true);
  });

  it('returns live inventory via the quantities endpoint', async () => {
    const res = await request(app).get(`/api/products/quantities?product_ids=${product.id}`);
    expect(res.status).toBe(200);
    expect(res.body.variants[0].inventory_quantity).toBe(10);
  });
});
