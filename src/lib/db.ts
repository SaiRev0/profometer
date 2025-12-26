import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../prisma/generated/client';
import 'server-only';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Increase pool size from default 10
  max: 30,  // Adjust based on your needs (v6 was ~num_cpus * 2 + 1)
  // Match Prisma ORM v6 timeout defaults:
  connectionTimeoutMillis: 5000,  // v6 connect_timeout was 5s
  idleTimeoutMillis: 300000,      // v6 max_idle_connection_lifetime was 300s
  // maxLifetimeSeconds: 0,        // Optional: v6 default (0 = no timeout)
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;
