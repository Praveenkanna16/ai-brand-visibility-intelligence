import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { z } from 'zod';
import { RecommendationResult } from './agent';

export const BriefSchema = z.object({
  title: z.string(),
  targetQuery: z.string(),
  visibilityGap: z.string(),
  competitorAdvantage: z.string(),
  contentType: z.string(),
  strategicAngle: z.string(),
  formatType: z.string(),
  primaryAsset: z.string(),
  evidenceToInclude: z.string(),
  recommendedStructure: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  reasoning: z.string(),
  confidence: z.string(),
  limitations: z.string(),
  analystNote: z.string(),
});

export type BriefResult = z.infer<typeof BriefSchema>;

export class BriefGenerator {
  static generateBriefFromInsight(insight: {
    promptText?: string | null;
    observation?: string | null;
    whyCompetitorWon?: string | null;
    recommendedAction?: string | null;
    contentType?: string | null;
    contentAngle?: string | null;
    suggestedEvidence?: string | null;
    confidence?: number | null;
    limitations?: string | null;
    competitorName?: string | null;
  }): BriefResult {
    return {
      title: `Strategic Brief: Winning "${insight.promptText || 'Category Queries'}"`,
      targetQuery: insight.promptText || 'Category Query',
      visibilityGap: 'High',
      competitorAdvantage: insight.whyCompetitorWon || 'Competitor currently holds primary AI citations.',
      contentType: insight.contentType || 'Comparison Guide / Whitepaper',
      strategicAngle: insight.contentAngle || 'Technical deep-dive and evidence-backed performance benchmarks.',
      formatType: 'Long-form Technical Guide (2,500+ words)',
      primaryAsset: 'Downloadable Benchmark Matrix & Case Study Template',
      evidenceToInclude: insight.suggestedEvidence || 'Customer case studies, ROAS benchmarks, and implementation timeline data.',
      recommendedStructure: [
        { title: '1. Executive Summary & Market Problem', description: 'Address core enterprise challenges and why legacy solutions fall short.' },
        { title: '2. Predictive Automation & Technical Deep-Dive', description: 'Detail technical architecture, predictive scaling, and automated optimization workflows.' },
        { title: '3. Comparative Benchmark Analysis', description: 'Provide concrete ROI data and benchmark comparisons vs competing tools.' },
        { title: '4. Enterprise Implementation Plan', description: 'Step-by-step deployment timeline, stage-gates, and measurable success metrics.' },
      ],
      reasoning: insight.observation || 'Enterprise buyers and LLMs prioritize authoritative, structured technical content.',
      confidence: `${Math.round((insight.confidence || 0.88) * 100)}%`,
      limitations: insight.limitations || 'LLM citations vary dynamically across model updates.',
      analystNote: `High priority content brief to displace ${insight.competitorName || 'competitors'} in future AI runs.`,
    };
  }

  static async generate(
    recommendation: RecommendationResult,
    targetBrand: string,
    promptText: string
  ): Promise<BriefResult> {
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
      return this.generateBriefFromInsight({
        promptText,
        observation: recommendation.observation,
        whyCompetitorWon: recommendation.whyCompetitorWon,
        recommendedAction: recommendation.recommendedAction,
        contentType: recommendation.contentType,
        contentAngle: recommendation.contentAngle,
        suggestedEvidence: recommendation.suggestedEvidence,
        confidence: recommendation.confidence,
        limitations: recommendation.limitations,
      });
    }

    try {
      const provider = LLMProviderFactory.getProvider('gemini');
      const prompt = `You are a senior Content Strategist. Generate an actionable, professional Content Brief for target brand "${targetBrand}" based on this gap recommendation:

Observation: ${recommendation.observation}
Why Competitor Won: ${recommendation.whyCompetitorWon}
Recommended Action: ${recommendation.recommendedAction}
Target Query: ${promptText}

Return ONLY a valid JSON object matching this schema:
{
  "title": string (engaging editorial title),
  "targetQuery": string,
  "visibilityGap": string,
  "competitorAdvantage": string,
  "contentType": string,
  "strategicAngle": string,
  "formatType": string,
  "primaryAsset": string,
  "evidenceToInclude": string,
  "recommendedStructure": [{"title": string, "description": string}],
  "reasoning": string,
  "confidence": string,
  "limitations": string,
  "analystNote": string
}`;

      const res = await provider.generateResponse(prompt, {
        systemPrompt: 'You are an expert content strategist. Output strictly valid JSON.',
      });

      const jsonStr = res.rawResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return BriefSchema.parse(parsed);
    } catch (err) {
      console.warn('BriefGenerator LLM failed, using fallback:', err);
      return this.generateBriefFromInsight({
        promptText,
        observation: recommendation.observation,
        whyCompetitorWon: recommendation.whyCompetitorWon,
        recommendedAction: recommendation.recommendedAction,
        contentType: recommendation.contentType,
        contentAngle: recommendation.contentAngle,
        suggestedEvidence: recommendation.suggestedEvidence,
        confidence: recommendation.confidence,
        limitations: recommendation.limitations,
      });
    }
  }
}
