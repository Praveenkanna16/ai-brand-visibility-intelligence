import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { z } from 'zod';

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
    const queryText = insight.promptText || 'Category Query';
    const competitor = insight.competitorName || 'Competitor';

    return {
      title: `Strategic Brief: Winning "${queryText}"`,
      targetQuery: queryText,
      visibilityGap: 'Detected',
      competitorAdvantage:
        insight.whyCompetitorWon ||
        `${competitor} currently holds primary AI citations for this query.`,
      contentType: insight.contentType || 'Targeted Content',
      strategicAngle:
        insight.contentAngle ||
        `Address the specific query context to displace ${competitor}.`,
      formatType: 'Long-form Guide (2,000+ words)',
      primaryAsset: 'Data-backed content addressing query intent',
      evidenceToInclude:
        insight.suggestedEvidence ||
        'Relevant benchmarks, case studies, and third-party validations.',
      recommendedStructure: [
        {
          title: '1. Direct Answer to Query',
          description: `Open with a comprehensive response to "${queryText}" positioning your brand.`,
        },
        {
          title: '2. Competitive Differentiation',
          description: `Explain specific advantages over ${competitor} with data.`,
        },
        {
          title: '3. Evidence & Validation',
          description: 'Include third-party data, case studies, and measurable outcomes.',
        },
        {
          title: '4. Action Plan',
          description: insight.recommendedAction || 'Concrete next steps for implementation.',
        },
      ],
      reasoning:
        insight.observation ||
        'AI answer engines prioritize authoritative, well-structured content.',
      confidence: `${Math.round((insight.confidence || 0.65) * 100)}%`,
      limitations:
        insight.limitations ||
        'Based on a single analysis snapshot. AI responses vary by session and model version.',
      analystNote: `Priority content brief to improve visibility against ${competitor} for this query.`,
    };
  }

  static async generate(
    recommendation: {
      observation: string;
      whyCompetitorWon: string;
      recommendedAction: string;
      contentType: string;
      contentAngle: string;
      suggestedEvidence: string;
      confidence: number;
      limitations: string;
    },
    targetBrand: string,
    promptText: string
  ): Promise<BriefResult> {
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
        systemPrompt:
          'You are an expert content strategist. Output strictly valid JSON. No markdown, no code fences.',
      });

      const jsonStr = res.rawResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed = JSON.parse(jsonStr);
      return BriefSchema.parse(parsed);
    } catch (err) {
      console.warn(
        '[BriefGenerator] LLM failed, using structured fallback:',
        err instanceof Error ? err.message : err
      );
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
