import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';

  if (process.env.VERCEL === '1' && rawUrl.startsWith('file:')) {
    // Vercel serverless environment: use writable /tmp directory
    return 'file:/tmp/dev.db';
  }

  if (rawUrl.startsWith('file:.')) {
    return `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), rawUrl.replace('file:', ''))}`;
  }

  return rawUrl;
}

function createPrismaClient(): PrismaClient {
  const url = getDatabaseUrl();
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let dbInitialized = false;

export async function ensureDatabaseTables(): Promise<void> {
  if (dbInitialized) return;
  try {
    await prisma.brand.count();
    dbInitialized = true;
  } catch {
    console.log('[Prisma] Database tables missing, initializing schema...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Brand" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "domain" TEXT,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Competitor" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "domain" TEXT,
        "brandId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "AIEngine" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "provider" TEXT NOT NULL,
        "modelId" TEXT NOT NULL,
        "displayName" TEXT NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT 1,
        "color" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "Prompt" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "text" TEXT NOT NULL,
        "category" TEXT,
        "brandId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "Run" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "brandId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'QUEUED',
        "progressCurrent" INTEGER NOT NULL DEFAULT 0,
        "progressTotal" INTEGER NOT NULL DEFAULT 0,
        "currentStep" TEXT,
        "currentStepDetail" TEXT,
        "enginesUsed" TEXT,
        "competitorNames" TEXT,
        "promptIds" TEXT,
        "startedAt" DATETIME,
        "completedAt" DATETIME,
        "error" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "RunResult" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "runId" TEXT NOT NULL,
        "promptId" TEXT NOT NULL,
        "engineId" TEXT NOT NULL,
        "rawResponse" TEXT,
        "mentioned" BOOLEAN,
        "mentionType" TEXT,
        "position" INTEGER,
        "competitorsMentioned" TEXT,
        "sentiment" TEXT,
        "relevantClaims" TEXT,
        "evidence" TEXT,
        "confidence" REAL,
        "status" TEXT,
        "statusLabel" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("engineId") REFERENCES "AIEngine" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "VisibilityMetric" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "brandId" TEXT NOT NULL,
        "runId" TEXT,
        "visibilityScore" REAL NOT NULL DEFAULT 0,
        "mentionRate" REAL NOT NULL DEFAULT 0,
        "avgPosition" REAL,
        "shareOfMentions" REAL NOT NULL DEFAULT 0,
        "engineBreakdown" TEXT,
        "competitorShares" TEXT,
        "trendChange" REAL,
        "period" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE SET NULL
      );
      CREATE TABLE IF NOT EXISTS "Insight" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "runId" TEXT NOT NULL,
        "promptId" TEXT,
        "brandId" TEXT NOT NULL,
        "competitorName" TEXT NOT NULL,
        "promptText" TEXT,
        "brandMentioned" BOOLEAN NOT NULL DEFAULT 0,
        "brandStatus" TEXT,
        "competitorMentioned" BOOLEAN NOT NULL DEFAULT 1,
        "competitorPosition" INTEGER,
        "competitorCiteRate" REAL,
        "observation" TEXT,
        "whyCompetitorWon" TEXT,
        "evidenceText" TEXT,
        "hypothesis" TEXT,
        "recommendedAction" TEXT,
        "contentType" TEXT,
        "contentAngle" TEXT,
        "suggestedEvidence" TEXT,
        "confidence" REAL,
        "limitations" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("runId") REFERENCES "Run" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE SET NULL,
        FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "Brief" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "insightId" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "targetQuery" TEXT,
        "visibilityGap" TEXT,
        "competitorAdvantage" TEXT,
        "contentType" TEXT,
        "strategicAngle" TEXT,
        "formatType" TEXT,
        "primaryAsset" TEXT,
        "evidenceToInclude" TEXT,
        "recommendedStructure" TEXT,
        "reasoning" TEXT,
        "confidence" TEXT,
        "limitations" TEXT,
        "analystNote" TEXT,
        "status" TEXT NOT NULL DEFAULT 'generated',
        "winningCompetitors" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("insightId") REFERENCES "Insight" ("id") ON DELETE CASCADE
      );
    `);
    dbInitialized = true;
    console.log('[Prisma] Database tables initialized successfully.');
  }
}
