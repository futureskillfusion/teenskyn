import 'dotenv/config';
import fs from 'node:fs';
import { createApp } from './app.js';
import { UPLOADS_DIR } from './lib/paths.js';
import { prisma } from './lib/prisma.js';

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = createApp();
const port = process.env.PORT || 4000;

// Hostinger's platform expects listen() within a few seconds of startup, so
// the HTTP server comes up immediately. The database connects in the
// background — the first request just waits on the same in-flight connect.
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err.message));
