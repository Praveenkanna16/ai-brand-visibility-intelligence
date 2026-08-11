-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEngine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEngine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunResult" (
    "id" TEXT NOT NULL,
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
    "confidence" DOUBLE PRECISION,
    "status" TEXT,
    "statusLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RunResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisibilityMetric" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "runId" TEXT,
    "visibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgPosition" DOUBLE PRECISION,
    "shareOfMentions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engineBreakdown" TEXT,
    "competitorShares" TEXT,
    "trendChange" DOUBLE PRECISION,
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisibilityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "promptId" TEXT,
    "brandId" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Competitor_brandId_idx" ON "Competitor"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_brandId_name_key" ON "Competitor"("brandId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AIEngine_name_key" ON "AIEngine"("name");

-- CreateIndex
CREATE INDEX "Prompt_brandId_idx" ON "Prompt"("brandId");

-- CreateIndex
CREATE INDEX "Run_brandId_idx" ON "Run"("brandId");

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_sessionId_idx" ON "Run"("sessionId");

-- CreateIndex
CREATE INDEX "RunResult_runId_idx" ON "RunResult"("runId");

-- CreateIndex
CREATE INDEX "RunResult_promptId_idx" ON "RunResult"("promptId");

-- CreateIndex
CREATE INDEX "RunResult_engineId_idx" ON "RunResult"("engineId");

-- CreateIndex
CREATE INDEX "VisibilityMetric_brandId_idx" ON "VisibilityMetric"("brandId");

-- CreateIndex
CREATE INDEX "VisibilityMetric_runId_idx" ON "VisibilityMetric"("runId");

-- CreateIndex
CREATE INDEX "Insight_runId_idx" ON "Insight"("runId");

-- CreateIndex
CREATE INDEX "Insight_brandId_idx" ON "Insight"("brandId");

-- CreateIndex
CREATE INDEX "Insight_promptId_idx" ON "Insight"("promptId");

-- CreateIndex
CREATE UNIQUE INDEX "Brief_insightId_key" ON "Brief"("insightId");

-- CreateIndex
CREATE INDEX "Brief_insightId_idx" ON "Brief"("insightId");

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunResult" ADD CONSTRAINT "RunResult_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "AIEngine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibilityMetric" ADD CONSTRAINT "VisibilityMetric_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "Insight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

