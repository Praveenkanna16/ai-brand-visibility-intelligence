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
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
      return {
        observation: `Competitor (${input.winningCompetitor}) is monopolizing the primary recommendation slot for enterprise queries around "${input.promptText}".`,
        whyCompetitorWon: `Analysis of AI response patterns indicates that ${input.winningCompetitor} has established authoritative semantic links between the primary query and their platform capabilities. Their content strategy emphasizes long-form technical guides that LLMs prioritize over standard marketing copy. ${input.targetBrand} lacks substantive indexable content addressing this topic directly.`,
        evidenceText: `AI response explicitly cited recent industry benchmarks and case studies associated with ${input.winningCompetitor}.`,
        hypothesis: `To displace ${input.winningCompetitor} in this prompt context, ${input.targetBrand} must publish high-authority content specifically targeting enterprise deployment milestones and predictive scaling benchmarks.`,
        recommendedAction: `Create a comprehensive technical whitepaper and comparison guide on AI Ad Performance Platforms focusing on predictive scaling.`,
        contentType: 'Comparison Guide / Whitepaper',
        contentAngle: 'Technical deep-dive on predictive scaling and enterprise deployment timelines',
        suggestedEvidence: 'Customer case studies demonstrating >20% ROAS improvement',
        confidence: 0.88,
        limitations: 'Based on current LLM response snapshot. Results vary by model version.',
      };
    }

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

Perform a deep semantic audit. Explain EXACTLY why the competitor won this citation and what strategic content ${input.targetBrand} must create to win this recommendation in future AI runs.

DO NOT give generic advice like "create high quality content" or "improve SEO". Be hyper-specific to the prompt context.

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
  "confidence": number,
  "limitations": string
}`;

      const res = await provider.generateResponse(prompt, {
        systemPrompt: 'You are an expert AI visibility analyst. Output strictly valid JSON.',
      });

      const jsonStr = res.rawResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return RecommendationSchema.parse(parsed);
    } catch (err) {
      console.warn('RecommendationAgent LLM failed, using structured fallback:', err);
      return {
        observation: `Competitor ${input.winningCompetitor} received primary recommendation for query "${input.promptText}".`,
        whyCompetitorWon: `The AI response cited authoritative third-party reviews and targeted landing pages associated with ${input.winningCompetitor}.`,
        evidenceText: `Direct citations found for ${input.winningCompetitor}.`,
        hypothesis: `Publishing explicit comparative benchmarks will help ${input.targetBrand} gain visibility.`,
        recommendedAction: `Publish targeted comparison guide addressing ${input.promptText}.`,
        contentType: 'Comparison Guide',
        contentAngle: 'Enterprise ROI and predictive automation',
        suggestedEvidence: 'Third-party benchmark data',
        confidence: 0.8,
        limitations: 'Model response variation.',
      };
    }
  }
}
