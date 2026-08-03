import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

const ADMIN_EMAIL = 'auth-test-admin@teenskyn.com';
const ADMIN_PASSWORD = 'correct-password-123';

describe('admin auth', () => {
  const app = createApp();

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.adminUser.upsert({
      where: { email: ADMIN_EMAIL },
      update: { passwordHash },
      create: { email: ADMIN_EMAIL, passwordHash, name: 'Test Admin' },
    });
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({ where: { email: ADMIN_EMAIL } });
    await prisma.$disconnect();
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'nobody@teenskyn.com', password: 'whatever' });
    expect(res.status).toBe(401);
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('logs in with correct credentials and sets a cookie', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/ts_admin_session=.+HttpOnly/);
  });

  it('rejects /auth/me without a session cookie', async () => {
    const res = await request(app).get('/api/admin/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows /auth/me with a valid session cookie', async () => {
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app).get('/api/admin/auth/me').set('Cookie', cookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(ADMIN_EMAIL);
  });

  it('blocks other admin routes without auth', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(401);
  });
});
