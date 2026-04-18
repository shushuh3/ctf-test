import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

type LogLevel = 'warn' | 'error' | 'info' | 'query';

function makePrisma(): PrismaClient {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const log: LogLevel[] = process.env['NODE_ENV'] === 'development' ? ['warn', 'error'] : ['error'];
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log,
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.prisma ?? makePrisma();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = db;
}
