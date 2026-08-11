/* ─── CiteScope Demo Data ───
 * Realistic deterministic data for the Pixis case study.
 * Target: Pixis | Competitors: Albert.ai, Smartly.io, Madgicx, AdCreative.ai
 * All data is labeled as research/demo data — not production AI search results.
 */

import type {
  DashboardData, RunResult, Insight, Brief, CompetitorAnalysis,
  TrendPoint, RunProgress, SettingsData, EngineBreakdown, CompetitorShare
} from '@/lib/types';

// ─── Brand ───
export const demoBrand = {
  id: 'brand-demo-001',
  name: 'Pixis',
  domain: 'pixis.ai',
  description: 'Pixis provides codeless AI infrastructure to scale accurate data-driven marketing.',
  createdAt: '2024-10-01T00:00:00Z',
  updatedAt: '2024-10-24T14:32:00Z',
};

export const demoCompetitors = [
  { id: 'comp-001', name: 'Albert.ai', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'comp-002', name: 'Smartly.io', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'comp-003', name: 'Madgicx', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'comp-004', name: 'AdCreative.ai', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
];

export const demoEngines = [
  { id: 'engine-gpt4', name: 'chatgpt', provider: 'openai', modelId: 'gpt-4', displayName: 'ChatGPT (GPT-4)', enabled: true, color: '#10a37f' },
  { id: 'engine-gemini', name: 'gemini', provider: 'gemini', modelId: 'gemini-pro', displayName: 'Gemini Advanced', enabled: true, color: '#1a73e8' },
  { id: 'engine-perplexity', name: 'perplexity', provider: 'perplexity', modelId: 'pplx-70b', displayName: 'Perplexity Pro', enabled: true, color: '#111111' },
  { id: 'engine-claude', name: 'claude', provider: 'anthropic', modelId: 'claude-3-opus', displayName: 'Claude 3 Opus', enabled: false, color: '#cc785c' },
];

// ─── Prompts ───
export const demoPrompts = [
  { id: 'p-001', text: 'Best AI platform for ecommerce ad optimization', category: 'Performance', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-002', text: 'How to automate social media reporting for agencies', category: 'Automation', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-003', text: 'Compare enterprise SEO tools with predictive AI', category: 'Enterprise', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-004', text: 'Tools for sentiment analysis on Twitter data', category: 'Analytics', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-005', text: 'Best AI tools for ecommerce advertising', category: 'Ecommerce', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-006', text: 'AI tools for creative ad generation', category: 'Creative', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-007', text: 'AI marketing automation platforms for DTC brands', category: 'DTC', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-008', text: 'How can brands improve ROAS using AI?', category: 'ROAS', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-009', text: 'Best AI advertising platform for enterprise brands', category: 'Enterprise', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-010', text: 'AI for cross-channel budget allocation', category: 'Budget', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-011', text: 'Best AI tools for marketing automation', category: 'Automation', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-012', text: 'How to automate social media ad creation', category: 'Creative', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-013', text: 'Top AI platforms for programmatic advertising', category: 'Programmatic', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-014', text: 'AI-powered audience targeting solutions', category: 'Targeting', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-015', text: 'Best codeless AI infrastructure for ad campaigns', category: 'Infrastructure', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-016', text: 'Enterprise AI implementation timeline', category: 'Enterprise', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-017', text: 'AI tools for predictive bidding in Google Ads', category: 'Bidding', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-018', text: 'Best platforms for AI-driven creative testing', category: 'Creative', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-019', text: 'AI solutions for retail media network optimization', category: 'Retail', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
  { id: 'p-020', text: 'How to scale paid social with AI automation', category: 'Social', brandId: demoBrand.id, createdAt: '2024-10-01T00:00:00Z' },
];

// ─── Run Results (subset shown in Prompt Intelligence table) ───
export const demoRunResults: RunResult[] = [
  {
    id: 'rr-001', runId: 'run-demo-001', promptId: 'p-001', engineId: 'engine-gpt4',
    rawResponse: `When looking for the best AI platform for ecommerce advertising optimization, several key players dominate the space, largely depending on your specific channel mix and scale.\n\nFor cross-channel enterprise optimization, Smartly.io remains the premier choice. They offer robust creative automation combined with predictive bidding algorithms that consistently outperform native platform tools, particularly for fashion and CPG brands.\n\nAnother strong contender is Madgicx, which provides excellent insights for Shopify-based businesses focusing heavily on Meta ads. However, if your focus is primarily on Google Performance Max campaigns, native tools often suffice, though third-party platforms like Optmyzr can provide additional control layers.`,
    mentioned: false, mentionType: 'not_mentioned', position: null,
    competitorsMentioned: ['Smartly.io', 'Madgicx'],
    sentiment: null, relevantClaims: ['ecommerce creative optimization', 'predictive bidding'],
    evidence: [
      { source: 'SOURCE MENTION', title: 'G2 Grid Report Fall 2024', description: 'High citation weight for "enterprise optimization" claim.', url: '' },
      { source: 'SOURCE MENTION', title: 'Smartly.io Case Studies', description: 'Direct correlation to "fashion and CPG brands" reference.', url: '' },
    ],
    confidence: 0.87, status: 'gap_detected', statusLabel: 'Gap detected',
    createdAt: '2024-10-24T14:32:00Z',
    prompt: demoPrompts[0],
    engine: demoEngines[0],
  },
  {
    id: 'rr-002', runId: 'run-demo-001', promptId: 'p-002', engineId: 'engine-claude',
    rawResponse: `For automating social media reporting, there are several excellent platforms to consider. Pixis stands out with its codeless AI infrastructure that enables automated cross-channel reporting with predictive insights. Their platform is particularly strong for agencies managing multiple client accounts.\n\nSprout Social and Hootsuite offer more traditional social media management suites with reporting capabilities, while newer AI-native tools like Pixis provide deeper automation layers.`,
    mentioned: true, mentionType: 'direct', position: 2,
    competitorsMentioned: [],
    sentiment: 'positive', relevantClaims: ['codeless AI infrastructure', 'automated cross-channel reporting'],
    evidence: [],
    confidence: 0.92, status: 'favorable', statusLabel: 'Favorable',
    createdAt: '2024-10-24T14:33:00Z',
    prompt: demoPrompts[1],
    engine: demoEngines[3],
  },
  {
    id: 'rr-003', runId: 'run-demo-001', promptId: 'p-003', engineId: 'engine-gemini',
    rawResponse: `When comparing enterprise SEO tools with predictive AI capabilities, the landscape includes several specialized platforms. BrightEdge and Conductor lead the enterprise SEO space with their deep integration capabilities and content optimization AI.\n\nFor predictive analytics specifically, platforms like MarketMuse and Clearscope offer AI-driven content strategy tools. However, the intersection of SEO and ad performance AI is still emerging, with few platforms offering truly unified predictive capabilities across both organic and paid channels.`,
    mentioned: false, mentionType: 'not_mentioned', position: null,
    competitorsMentioned: ['BrightEdge', 'Conductor'],
    sentiment: null, relevantClaims: ['enterprise SEO', 'predictive AI capabilities'],
    evidence: [],
    confidence: 0.79, status: 'high_priority_gap', statusLabel: 'High Priority Gap',
    createdAt: '2024-10-24T14:34:00Z',
    prompt: demoPrompts[2],
    engine: demoEngines[1],
  },
  {
    id: 'rr-004', runId: 'run-demo-001', promptId: 'p-004', engineId: 'engine-gpt4',
    rawResponse: `For sentiment analysis on Twitter (now X) data, several tools stand out. Brandwatch offers the most comprehensive social listening and sentiment analysis platform, with advanced AI models trained specifically on social media language patterns.\n\nPixis, while primarily known for ad optimization, has incorporated sentiment analysis into its audience intelligence modules, allowing brands to understand audience perception alongside ad performance. Sprinklr and Talkwalker are other strong options for enterprise-scale social sentiment monitoring.`,
    mentioned: true, mentionType: 'indirect', position: 4,
    competitorsMentioned: ['Brandwatch'],
    sentiment: 'neutral', relevantClaims: ['sentiment analysis', 'audience intelligence'],
    evidence: [],
    confidence: 0.74, status: 'needs_optimization', statusLabel: 'Needs Optimization',
    createdAt: '2024-10-24T14:35:00Z',
    prompt: demoPrompts[3],
    engine: demoEngines[0],
  },
];

// ─── Dashboard Data ───
export const demoDashboard: DashboardData = {
  brand: demoBrand,
  visibilityScore: 62,
  trendChange: 8.4,
  period: '30D',
  shareOfVoice: [
    { name: 'Pixis', share: 31 },
    { name: 'Smartly', share: 28 },
    { name: 'Albert', share: 19 },
    { name: 'Others', share: 22 },
  ],
  engineBreakdown: [
    { engineName: 'ChatGPT', engineColor: '#10a37f', mentionFrequency: 'High', avgPosition: 1.8, sentiment: 'positive', abbreviation: 'CG' },
    { engineName: 'Gemini', engineColor: '#1a73e8', mentionFrequency: 'Medium', avgPosition: 2.4, sentiment: 'neutral', abbreviation: 'G' },
    { engineName: 'Perplexity', engineColor: '#111111', mentionFrequency: 'High', avgPosition: 1.2, sentiment: 'positive', abbreviation: 'P' },
  ],
  aiInsight: 'Pixis over-indexes on "creative optimization" queries, but lacks visibility when users ask broad questions about "performance marketing automation." Expanding content strategies to address top-of-funnel automation concepts could capture an additional 15% SOV.',
  insightDate: 'Generated Today',
};

// ─── Insights ───
export const demoInsights: Insight[] = [
  {
    id: 'insight-001',
    runId: 'run-demo-001',
    promptId: 'p-001',
    brandId: demoBrand.id,
    competitorName: 'Smartly.io',
    promptText: 'Best AI platform for ecommerce ad optimization',
    brandMentioned: false,
    brandStatus: 'NOT MENTIONED',
    competitorMentioned: true,
    competitorPosition: 1,
    competitorCiteRate: 87,
    observation: 'Competitor (Smartly.io) is monopolizing the primary recommendation slot for enterprise queries.',
    whyCompetitorWon: 'Analysis of AI response patterns indicates that Smartly.io has established authoritative semantic links between "e-commerce," "predictive AI," and "creative optimization."\n\nTheir content strategy emphasizes long-form, data-rich technical guides that LLMs prioritize over standard marketing copy. Pixis lacks substantive, indexable content specifically addressing the nuanced needs of high-volume e-commerce advertisers.',
    evidenceText: 'AI heavily weighting recent G2 reports and specific vertical case studies (Fashion/CPG). Our recent technical whitepapers are not being synthesized.',
    hypothesis: 'To displace Smartly.io in this prompt context, we must publish high-authority content specifically targeting "creative automation" and "predictive bidding" within the enterprise tier.',
    recommendedAction: 'Create a comprehensive comparison guide on AI Ad Performance Platforms with a technical deep-dive on predictive scaling for e-commerce.',
    contentType: 'Comparison guide',
    contentAngle: 'Technical deep-dive on predictive scaling for e-commerce',
    suggestedEvidence: 'Case studies demonstrating >20% ROAS improvement',
    confidence: 0.87,
    limitations: 'Based on a single analysis snapshot. LLM responses vary by session and model version.',
    createdAt: '2024-10-24T14:40:00Z',
  },
];

// ─── Brief ───
export const demoBrief: Brief = {
  id: 'brief-001',
  insightId: 'insight-001',
  title: 'The Realistic Enterprise AI Implementation Timeline: From Pilot to Production',
  targetQuery: 'Enterprise AI implementation timeline',
  visibilityGap: 'Low',
  competitorAdvantage: 'Competitors lack specific timeline phases. Highlighting realistic stage-gates is our unique angle.',
  contentType: 'Long-form Guide',
  strategicAngle: 'Shift the narrative from vague "digital transformation" to concrete, phase-by-phase expectations. Focus on mitigating executive anxiety regarding time-to-value by outlining specific milestones for months 1, 3, 6, and 12.',
  formatType: 'Long-form Guide (2,500+ words)',
  primaryAsset: 'Downloadable Gantt Chart Template',
  evidenceToInclude: 'Internal deployment data, customer time-to-value metrics, industry benchmark comparisons',
  recommendedStructure: [
    { title: '1. The Pre-Flight Checklist (Month 0)', description: 'Data readiness assessment, stakeholder alignment, and defining measurable KPIs before vendor selection.' },
    { title: '2. Pilot Phase (Months 1-3)', description: 'Selecting a low-risk, high-reward use case. Establishing baseline metrics and integration testing.' },
    { title: '3. Scaling & Integration (Months 4-6)', description: 'Expanding to secondary use cases, refining models based on pilot data, and user training rollout.' },
  ],
  reasoning: 'Enterprise buyers need concrete timelines. Most AI content is vague about implementation. This creates an opportunity to own the narrative around practical deployment.',
  confidence: 'High',
  limitations: 'Implementation timelines vary significantly by organization size and existing infrastructure.',
  analystNote: 'Competitors lack specific timeline phases. Highlighting realistic stage-gates is our unique angle.',
  status: 'generated',
  winningCompetitors: [
    { name: 'TechCorp Insights', rank: 1 },
    { name: 'DataFrontier', rank: 2 },
  ],
  createdAt: '2024-10-24T15:00:00Z',
  updatedAt: '2024-10-24T15:00:00Z',
};

// ─── Competitor Analysis ───
export const demoCompetitorAnalysis: CompetitorAnalysis = {
  shareOfVoice: [
    { name: 'Pixis', share: 31 },
    { name: 'Smartly.io', share: 28 },
    { name: 'Albert.ai', share: 19 },
    { name: 'Others', share: 22 },
  ],
  avgPositions: [
    { name: 'Pixis', position: 1.8 },
    { name: 'Smartly.io', position: 2.4 },
    { name: 'Albert.ai', position: 3.1 },
  ],
  frequentClaims: [
    { competitor: 'Smartly.io', claim: '"Best for enterprise-scale creative automation."', frequency: 'Cited in 45% of ecommerce-related prompts.' },
    { competitor: 'Albert.ai', claim: '"Fully autonomous media buying capabilities."', frequency: 'Cited in 38% of media optimization prompts.' },
    { competitor: 'Pixis', claim: '"Superior AI-driven audience targeting."', frequency: 'Cited in 52% of general AI marketing prompts.' },
  ],
  promptComparison: [
    { promptTheme: '"Best AI tools for marketing automation"', brandPosition: '#1', topCompetitor: 'Smartly.io (#3)', sentiment: '↗ Positive' },
    { promptTheme: '"How to automate social media ad creation"', brandPosition: '#2', topCompetitor: 'Smartly.io (#1)', sentiment: '— Neutral' },
    { promptTheme: '"AI for cross-channel budget allocation"', brandPosition: '#1', topCompetitor: 'Albert.ai (#2)', sentiment: '↗ Positive' },
  ],
  competitiveSignal: 'Smartly.io appears most frequently when the query emphasizes ecommerce creative automation.',
};

// ─── Trend Data ───
export const demoTrends: TrendPoint[] = [
  { date: '2024-07-01', visibilityScore: 42, shareOfVoice: 22, avgPosition: 3.2, brandMentions: 18 },
  { date: '2024-07-15', visibilityScore: 45, shareOfVoice: 23, avgPosition: 3.0, brandMentions: 20 },
  { date: '2024-08-01', visibilityScore: 48, shareOfVoice: 24, avgPosition: 2.8, brandMentions: 24 },
  { date: '2024-08-15', visibilityScore: 46, shareOfVoice: 25, avgPosition: 2.9, brandMentions: 22 },
  { date: '2024-09-01', visibilityScore: 52, shareOfVoice: 27, avgPosition: 2.5, brandMentions: 28 },
  { date: '2024-09-15', visibilityScore: 55, shareOfVoice: 28, avgPosition: 2.3, brandMentions: 32 },
  { date: '2024-10-01', visibilityScore: 58, shareOfVoice: 29, avgPosition: 2.1, brandMentions: 35 },
  { date: '2024-10-15', visibilityScore: 60, shareOfVoice: 30, avgPosition: 1.9, brandMentions: 38 },
  { date: '2024-10-24', visibilityScore: 62, shareOfVoice: 31, avgPosition: 1.8, brandMentions: 40 },
];

// ─── Run Progress ───
export const demoRunProgress: RunProgress = {
  runId: 'run-demo-001',
  status: 'RUNNING',
  progressCurrent: 12,
  progressTotal: 20,
  currentStep: 'Mapping competitors',
  currentStepDetail: 'Extracting entity relationships from prompt #12 across primary engines...',
  steps: [
    { number: 1, label: 'Collecting AI responses', status: 'completed' },
    { number: 2, label: 'Extracting brand mentions', status: 'completed' },
    { number: 3, label: 'Mapping competitors', status: 'processing', detail: 'Processing' },
    { number: 4, label: 'Calculating visibility', status: 'pending' },
    { number: 5, label: 'Finding visibility gaps', status: 'pending' },
    { number: 6, label: 'Generating recommendations', status: 'pending' },
  ],
  engines: [
    { name: 'ChatGPT', abbreviation: 'GPT', status: 'syncing' },
    { name: 'Gemini', abbreviation: 'GEM', status: 'querying' },
    { name: 'Perplexity', abbreviation: 'PPLX', status: 'queued' },
  ],
  analystInsight: 'Early data suggests a strong presence in ChatGPT for generic queries, but lower visibility when specific competitor names are included in the prompt. We are indexing these gaps now.',
};

// ─── Settings ───
export const demoSettings: SettingsData = {
  brand: {
    name: 'Pixis',
    domain: 'pixis.ai',
    description: 'Pixis provides codeless AI infrastructure to scale accurate data-driven marketing.',
  },
  competitors: [
    { id: 'comp-001', name: 'Albert AI' },
    { id: 'comp-002', name: 'Skai' },
  ],
  engines: [
    { id: 'engine-gpt4', name: 'chatgpt', displayName: 'ChatGPT (GPT-4)', description: "OpenAI's flagship conversational model.", enabled: true },
    { id: 'engine-gemini', name: 'gemini', displayName: 'Gemini Advanced', description: "Google's primary search-integrated LLM.", enabled: true },
    { id: 'engine-claude', name: 'claude', displayName: 'Claude 3 Opus', description: "Anthropic's most capable model.", enabled: true },
    { id: 'engine-perplexity', name: 'perplexity', displayName: 'Perplexity Pro (Coming Soon)', description: 'Search-focused answer engine.', enabled: false },
  ],
};

// ─── Complete Run for "Completed" state ───
export const demoCompletedRun = {
  id: 'run-demo-001',
  brandId: demoBrand.id,
  status: 'COMPLETED' as const,
  progressCurrent: 20,
  progressTotal: 20,
  currentStep: 'Generating recommendations',
  currentStepDetail: 'Analysis complete.',
  enginesUsed: ['engine-gpt4', 'engine-gemini', 'engine-perplexity'],
  competitorNames: ['Albert.ai', 'Smartly.io', 'Madgicx', 'AdCreative.ai'],
  promptIds: demoPrompts.map(p => p.id),
  startedAt: '2024-10-24T14:30:00Z',
  completedAt: '2024-10-24T14:45:00Z',
  error: null,
  createdAt: '2024-10-24T14:30:00Z',
};
