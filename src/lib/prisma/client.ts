import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/citescope';

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Self-healing helper: Ensures PostgreSQL tables exist on remote database
 */
export async function ensureDatabaseTables(): Promise<void> {
  try {
    await prisma.$queryRawUnsafe(`SELECT 1 FROM "Brand" LIMIT 1;`);
  } catch (err: any) {
    console.log('[Prisma Client] Brand table not found, initializing PostgreSQL schema...');
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Brand" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "domain" TEXT,
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Competitor" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL,
          "domain" TEXT,
          "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Competitor_brandId_name_key" UNIQUE ("brandId", "name")
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AIEngine" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "provider" TEXT NOT NULL,
          "modelId" TEXT NOT NULL,
          "displayName" TEXT NOT NULL,
          "enabled" BOOLEAN NOT NULL DEFAULT true,
          "color" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Prompt" (
          "id" TEXT PRIMARY KEY,
          "text" TEXT NOT NULL,
          "category" TEXT,
          "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Run" (
          "id" TEXT PRIMARY KEY,
          "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
          "sessionId" TEXT,
          "status" TEXT NOT NULL DEFAULT 'QUEUED',
          "progressCurrent" INTEGER NOT NULL DEFAULT 0,
          "progressTotal" INTEGER NOT NULL DEFAULT 0,
          "currentStep" TEXT,
          "currentStepDetail" TEXT,
          "enginesUsed" TEXT,
          "competitorNames" TEXT,
          "promptTexts" TEXT,
          "startedAt" TIMESTAMP(3),
          "completedAt" TIMESTAMP(3),
          "error" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "RunResult" (
          "id" TEXT PRIMARY KEY,
          "runId" TEXT NOT NULL REFERENCES "Run"("id") ON DELETE CASCADE,
          "promptId" TEXT NOT NULL REFERENCES "Prompt"("id") ON DELETE CASCADE,
          "engineId" TEXT NOT NULL REFERENCES "AIEngine"("id") ON DELETE CASCADE,
          "rawResponse" TEXT,
          "mentioned" BOOLEAN,
          "mentionType" TEXT,
          "position" INTEGER,
          "competitorsMentioned" TEXT,
          "sentiment" TEXT,
          "relevantClaims" TEXT,
          "evidence" TEXT,
          "confidence" DOUBLE PRECISION,
          "status" TEXT,
          "statusLabel" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VisibilityMetric" (
          "id" TEXT PRIMARY KEY,
          "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
          "runId" TEXT REFERENCES "Run"("id") ON DELETE SET NULL,
          "visibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "mentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "avgPosition" DOUBLE PRECISION,
          "shareOfMentions" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "engineBreakdown" TEXT,
          "competitorShares" TEXT,
          "trendChange" DOUBLE PRECISION,
          "period" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Insight" (
          "id" TEXT PRIMARY KEY,
          "runId" TEXT NOT NULL REFERENCES "Run"("id") ON DELETE CASCADE,
          "promptId" TEXT REFERENCES "Prompt"("id") ON DELETE SET NULL,
          "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
          "competitorName" TEXT NOT NULL,
          "promptText" TEXT,
          "brandMentioned" BOOLEAN NOT NULL DEFAULT false,
          "brandStatus" TEXT,
          "competitorMentioned" BOOLEAN NOT NULL DEFAULT true,
          "competitorPosition" INTEGER,
          "competitorCiteRate" DOUBLE PRECISION,
          "observation" TEXT,
          "whyCompetitorWon" TEXT,
          "evidenceText" TEXT,
          "hypothesis" TEXT,
          "recommendedAction" TEXT,
          "contentType" TEXT,
          "contentAngle" TEXT,
          "suggestedEvidence" TEXT,
          "confidence" DOUBLE PRECISION,
          "limitations" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Brief" (
          "id" TEXT PRIMARY KEY,
          "insightId" TEXT NOT NULL UNIQUE REFERENCES "Insight"("id") ON DELETE CASCADE,
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
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[Prisma Client] PostgreSQL tables created successfully.');
    } catch (createErr: any) {
      console.error('[Prisma Client] Failed to auto-create PostgreSQL tables:', createErr);
    }
  }
}
