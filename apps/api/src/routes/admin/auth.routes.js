import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requireAdminAuth, ADMIN_COOKIE_NAME } from '../../middleware/requireAdminAuth.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

authRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie(ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/auth/logout', (req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ ok: true });
});

authRouter.get('/auth/me', requireAdminAuth, async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});
