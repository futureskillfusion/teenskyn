import jwt from 'jsonwebtoken';

export const ADMIN_COOKIE_NAME = 'ts_admin_session';

export function requireAdminAuth(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
