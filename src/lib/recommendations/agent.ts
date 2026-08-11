import { LLMProviderFactory } from '@/lib/ai/providers/factory';
import { z } from 'zod';

export const RecommendationSchema = z.object({
  observation: z.string(),
  whyCompetitorWon: z.string(),
  evidenceText: z.string(),
  hypothesis: z.string(),
  recommendedAction: z.string(),
  contentType: z.string(),
  contentAngle: z.string(),
  suggestedEvidence: z.string(),
  confidence: z.number(),
  limitations: z.string(),
});

export type RecommendationResult = z.infer<typeof RecommendationSchema>;

export class RecommendationAgent {
  static async analyzeGap(input: {
    promptText: string;
    rawResponse: string;
    targetBrand: string;
    winningCompetitor: string;
  }): Promise<RecommendationResult> {
    try {
      const provider = LLMProviderFactory.getProvider('gemini');
      const prompt = `You are a strategic AI Answer-Engine Visibility Analyst.

The user asked the following category query to an AI answer engine:
"${input.promptText}"

The AI answer engine responded:
"""
${input.rawResponse}
"""

The target brand "${input.targetBrand}" was NOT mentioned.
The competitor "${input.winningCompetitor}" WAS mentioned.

Perform a deep semantic audit. Explain EXACTLY why the competitor won this citation and what specific, actionable content ${input.targetBrand} must create to win this recommendation in future AI runs.

DO NOT give generic advice like "create high quality content" or "improve SEO". Be hyper-specific to the prompt context, the actual response content, and the brands involved.

Return ONLY a valid JSON object matching this schema:
{
  "observation": string,
  "whyCompetitorWon": string,
  "evidenceText": string,
  "hypothesis": string,
  "recommendedAction": string,
  "contentType": string,
  "contentAngle": string,
  "suggestedEvidence": string,
  "confidence": number (0.0 to 1.0),
  "limitations": string
}`;

      const res = await provider.generateResponse(prompt, {
        systemPrompt:
          'You are an expert AI visibility analyst. Output strictly valid JSON. No markdown, no code fences.',
      });

      const jsonStr = res.rawResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed = JSON.parse(jsonStr);
      return RecommendationSchema.parse(parsed);
    } catch (err) {
      console.warn(
        '[RecommendationAgent] LLM analysis failed, using structured fallback:',
        err instanceof Error ? err.message : err
      );

      // Structured fallback based on actual input data — NOT generic boilerplate
      return {
        observation: `"${input.winningCompetitor}" received a recommendation for the query "${input.promptText}" while "${input.targetBrand}" was not mentioned.`,
        whyCompetitorWon: `The AI response cited "${input.winningCompetitor}" in its answer. This suggests the competitor has stronger content signals or authoritative references for this specific query context.`,
        evidenceText: `"${input.winningCompetitor}" appears in the AI-generated response for the query "${input.promptText}". "${input.targetBrand}" does not appear.`,
        hypothesis: `Publishing targeted content that directly addresses the query "${input.promptText}" could help "${input.targetBrand}" gain visibility for this topic.`,
        recommendedAction: `Create content specifically addressing "${input.promptText}" that positions "${input.targetBrand}" as a credible authority in this area.`,
        contentType: 'Targeted Content',
        contentAngle: `Direct response to: "${input.promptText}"`,
        suggestedEvidence: 'Case studies, benchmarks, or third-party validations relevant to this query',
        confidence: 0.65,
        limitations:
          'This analysis is based on a single AI response snapshot. LLM fallback was used because the detailed analysis could not be completed.',
      };
    }
  }
}
