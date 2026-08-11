/* ─── CiteScope TypeScript Types ─── */

export type RunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
export type Sentiment = 'positive' | 'neutral' | 'negative' | null;
export type MentionType = 'direct' | 'indirect' | 'not_mentioned';
export type BriefStatusType = 'generated' | 'drafted';

export interface Brand {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  domain?: string;
  brandId: string;
  createdAt: string;
}

export interface AIEngine {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  displayName: string;
  enabled: boolean;
  color?: string;
}

export interface Prompt {
  id: string;
  text: string;
  category?: string;
  brandId: string;
  createdAt: string;
}

export interface Run {
  id: string;
  brandId: string;
  status: RunStatus;
  progressCurrent: number;
  progressTotal: number;
  currentStep?: string;
  currentStepDetail?: string;
  enginesUsed?: string[];
  competitorNames?: string[];
  promptIds?: string[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

export interface RunResult {
  id: string;
  runId: string;
  promptId: string;
  engineId: string;
  rawResponse?: string;
  mentioned?: boolean;
  mentionType?: MentionType;
  position?: number | null;
  competitorsMentioned?: string[];
  sentiment?: Sentiment;
  relevantClaims?: string[];
  evidence?: Evidence[];
  confidence?: number;
  status?: string;
  statusLabel?: string;
  createdAt: string;
  prompt?: Prompt;
  engine?: AIEngine;
}

export interface Evidence {
  source: string;
  title: string;
  description: string;
  url?: string;
}

export interface VisibilityMetric {
  id: string;
  brandId: string;
  runId?: string;
  visibilityScore: number;
  mentionRate: number;
  avgPosition?: number;
  shareOfMentions: number;
  engineBreakdown?: EngineBreakdown[];
  competitorShares?: CompetitorShare[];
  trendChange?: number;
  period?: string;
  createdAt: string;
}

export interface EngineBreakdown {
  engineName: string;
  engineColor: string;
  mentionFrequency: string;
  avgPosition: number;
  sentiment: Sentiment;
  abbreviation: string;
}

export interface CompetitorShare {
  name: string;
  share: number;
  color?: string;
}

export interface Insight {
  id: string;
  runId: string;
  promptId?: string;
  brandId: string;
  competitorName: string;
  promptText?: string;
  brandMentioned: boolean;
  brandStatus?: string;
  competitorMentioned: boolean;
  competitorPosition?: number;
  competitorCiteRate?: number;
  observation?: string;
  whyCompetitorWon?: string;
  evidenceText?: string;
  hypothesis?: string;
  recommendedAction?: string;
  contentType?: string;
  contentAngle?: string;
  suggestedEvidence?: string;
  confidence?: number;
  limitations?: string;
  createdAt: string;
  brief?: Brief;
}

export interface Brief {
  id: string;
  insightId: string;
  title: string;
  targetQuery?: string;
  visibilityGap?: string;
  competitorAdvantage?: string;
  contentType?: string;
  strategicAngle?: string;
  formatType?: string;
  primaryAsset?: string;
  evidenceToInclude?: string;
  recommendedStructure?: BriefSection[];
  reasoning?: string;
  confidence?: string;
  limitations?: string;
  analystNote?: string;
  status: BriefStatusType;
  winningCompetitors?: WinningCompetitor[];
  createdAt: string;
  updatedAt: string;
}

export interface BriefSection {
  title: string;
  description: string;
}

export interface WinningCompetitor {
  name: string;
  rank: number;
}

export interface DashboardData {
  brand: Brand;
  visibilityScore: number;
  trendChange: number;
  period: string;
  shareOfVoice: CompetitorShare[];
  engineBreakdown: EngineBreakdown[];
  aiInsight: string;
  insightDate: string;
}

export interface CompetitorAnalysis {
  shareOfVoice: CompetitorShare[];
  avgPositions: { name: string; position: number }[];
  frequentClaims: { competitor: string; claim: string; frequency: string }[];
  promptComparison: PromptComparisonRow[];
  competitiveSignal: string;
}

export interface PromptComparisonRow {
  promptTheme: string;
  brandPosition: string;
  topCompetitor: string;
  sentiment: string;
}

export interface TrendPoint {
  date: string;
  visibilityScore: number;
  shareOfVoice: number;
  avgPosition: number;
  brandMentions: number;
}

export interface RunProgress {
  runId: string;
  status: RunStatus;
  progressCurrent: number;
  progressTotal: number;
  currentStep: string;
  currentStepDetail: string;
  steps: ProgressStep[];
  engines: EngineStatus[];
  analystInsight?: string;
}

export interface ProgressStep {
  number: number;
  label: string;
  status: 'completed' | 'processing' | 'pending';
  detail?: string;
}

export interface EngineStatus {
  name: string;
  abbreviation: string;
  status: 'completed' | 'syncing' | 'querying' | 'queued' | 'error';
}

// ─── API Request Types ───
export interface CreateRunRequest {
  brandName: string;
  brandDomain?: string;
  competitors: string[];
  engines: string[];
  prompts: string[];
}

export interface SettingsData {
  brand: {
    name: string;
    domain: string;
    description: string;
  };
  competitors: { id: string; name: string }[];
  engines: { id: string; name: string; displayName: string; description: string; enabled: boolean }[];
}
