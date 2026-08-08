import 'dotenv/config';
import fs from 'node:fs';
import { createApp } from './app.js';
import { UPLOADS_DIR } from './lib/paths.js';
import { prisma } from './lib/prisma.js';

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = createApp();
const port = process.env.PORT || 4000;

// Connect once, up front, before accepting any traffic. Letting concurrent
// first requests race to lazily initialize the Prisma query engine is a
// known trigger for a "PANIC: timer has gone away" crash on cold start.
async function connectWithRetry(attempts = 5, delayMs = 2000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i}/${attempts} failed:`, err.message);
      if (i === attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await connectWithRetry();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
