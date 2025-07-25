import { PrismaClient } from '../../prisma/generated/client';
import 'server-only';

const getPrismaClient = () => {
  return new PrismaClient();
};
export type ExtendedPrismaClient = ReturnType<typeof getPrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: ExtendedPrismaClient;
}

let prisma: ExtendedPrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = getPrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = getPrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
