import { PrismaClient } from '@prisma/client';
import { PhpBridgeAdapterFactory } from './phpBridgeAdapter.js';

function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
  };
}

// Hostinger's Node.js runtime cannot open outbound connections to MySQL
// directly (confirmed: 5 host/IP combinations all time out at runtime while
// build-time connections and direct external connections both succeed).
// When DB_BRIDGE_URL is set, route all queries through a small PHP script
// hosted on the same account's classic hosting, which reaches MySQL over
// localhost without restriction. See src/lib/phpBridgeAdapter.js.
let adapter;

if (process.env.DB_BRIDGE_URL) {
  adapter = new PhpBridgeAdapterFactory({
    bridgeUrl: process.env.DB_BRIDGE_URL,
    bridgeSecret: process.env.DB_BRIDGE_SECRET,
  });
} else {
  const { PrismaMariaDb } = await import('@prisma/adapter-mariadb');
  adapter = new PrismaMariaDb({
    ...parseDatabaseUrl(process.env.DATABASE_URL),
    connectionLimit: 5,
  });
}

export const prisma = new PrismaClient({ adapter });
