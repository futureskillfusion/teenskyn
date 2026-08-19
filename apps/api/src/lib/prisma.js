import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
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
//
// NB: this must be a static import + synchronous branch, not a dynamic
// `await import(...)`. Hostinger's launcher (lsnode.js) loads the entry
// file via require(), and Node's require(esm) support refuses to load any
// module in the graph that contains top-level await, even on an unused
// branch — it throws ERR_REQUIRE_ASYNC_MODULE before your code ever runs.
const adapter = process.env.DB_BRIDGE_URL
  ? new PhpBridgeAdapterFactory({
      bridgeUrl: process.env.DB_BRIDGE_URL,
      bridgeSecret: process.env.DB_BRIDGE_SECRET,
    })
  : new PrismaMariaDb({
      ...parseDatabaseUrl(process.env.DATABASE_URL),
      connectionLimit: 5,
    });

export const prisma = new PrismaClient({ adapter });
