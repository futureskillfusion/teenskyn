import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

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

const adapter = new PrismaMariaDb({
  ...parseDatabaseUrl(process.env.DATABASE_URL),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
