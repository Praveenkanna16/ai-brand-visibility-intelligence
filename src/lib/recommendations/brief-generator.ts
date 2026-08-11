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
  static async generate(
    recommendation: RecommendationResult,
    targetBrand: string,
    promptText: string
  ): Promise<BriefResult> {
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
      return {
        title: `The Realistic Enterprise AI Implementation Timeline: From Pilot to Production`,
        targetQuery: promptText,
        visibilityGap: 'High',
        competitorAdvantage: 'Competitors lack specific timeline phases. Highlighting realistic stage-gates is our unique angle.',
        contentType: recommendation.contentType || 'Long-form Guide',
        strategicAngle: recommendation.contentAngle || 'Shift the narrative from vague digital transformation to concrete phase-by-phase expectations.',
        formatType: 'Long-form Guide (2,500+ words)',
        primaryAsset: 'Downloadable Implementation Gantt Chart Template',
        evidenceToInclude: recommendation.suggestedEvidence || 'Internal deployment data, customer time-to-value metrics, industry benchmarks',
        recommendedStructure: [
          { title: '1. The Pre-Flight Assessment (Month 0)', description: 'Data readiness audit, stakeholder alignment, and defining measurable KPIs.' },
          { title: '2. Pilot Phase (Months 1-3)', description: 'Selecting low-risk high-reward use cases and establishing baseline metrics.' },
          { title: '3. Enterprise Scaling (Months 4-6)', description: 'Expanding across business units and integrating automated feedback loops.' },
        ],
        reasoning: 'Enterprise buyers need concrete timelines. Most AI content is vague about implementation. This creates an opportunity to own the narrative.',
        confidence: 'High (0.91)',
        limitations: 'Implementation timelines vary by organization size and existing tech stack.',
        analystNote: 'Competitors lack specific timeline phases. Highlighting realistic stage-gates is our unique angle.',
      };
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
      return {
        title: `Comprehensive Guide to ${promptText}`,
        targetQuery: promptText,
        visibilityGap: 'Medium',
        competitorAdvantage: 'Competitors currently hold top citations for this query.',
        contentType: 'Strategic Guide',
        strategicAngle: recommendation.contentAngle || 'Direct comparison and evidence-backed case studies.',
        formatType: 'Technical Guide',
        primaryAsset: 'Comparison Matrix PDF',
        evidenceToInclude: 'Performance metrics and ROI case studies.',
        recommendedStructure: [
          { title: 'Executive Summary', description: 'Overview of key capabilities.' },
          { title: 'Technical Architecture', description: 'Deep dive into performance optimizations.' },
        ],
        reasoning: 'Fills clear content gap identified in AI search runs.',
        confidence: 'Medium',
        limitations: 'General recommendations.',
        analystNote: 'High priority content brief.',
      };
    }
  }
}
