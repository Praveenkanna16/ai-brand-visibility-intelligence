import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
  let url = rawUrl;
  if (rawUrl.startsWith('file:.')) {
    url = `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawUrl.replace('file:', ''))}`;
  }
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
