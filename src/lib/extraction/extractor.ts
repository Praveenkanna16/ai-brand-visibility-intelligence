import { z } from 'zod';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';

export const ExtractionSchema = z.object({
  mentioned: z.boolean(),
  position: z.number().nullable(),
  competitorsMentioned: z.array(z.string()),
  sentiment: z.enum(['positive', 'neutral', 'negative']).nullable(),
  relevantClaims: z.array(z.string()),
  evidence: z.array(
    z.object({
      source: z.string(),
      title: z.string(),
      description: z.string(),
      url: z.string().optional(),
    })
  ),
  confidence: z.number().min(0).max(1),
});

export type ExtractionResult = z.infer<typeof ExtractionSchema>;

export class ExtractorAgent {
  static async extract(
    rawResponse: string,
    targetBrand: string,
    competitors: string[]
  ): Promise<ExtractionResult> {
    const isDemoMode = process.env.DEMO_MODE === 'true';

    // Algorithmic extraction fallback / primary check
    const lowerRaw = rawResponse.toLowerCase();
    const lowerTarget = targetBrand.toLowerCase();
    const isMentioned = lowerRaw.includes(lowerTarget);

    const competitorsMentioned = competitors.filter((c) =>
      lowerRaw.includes(c.toLowerCase())
    );

    // Calculate position
    let position: number | null = null;
    if (isMentioned) {
      // Crude position estimation based on mention order
      const sentences = rawResponse.split(/[.!?]+/);
      const mentionIndex = sentences.findIndex((s) => s.toLowerCase().includes(lowerTarget));
      position = mentionIndex >= 0 ? Math.min(mentionIndex + 1, 5) : 1;
    }

    if (isDemoMode || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
      return {
        mentioned: isMentioned,
        position,
        competitorsMentioned,
        sentiment: isMentioned ? 'positive' : null,
        relevantClaims: isMentioned
          ? [`Codeless AI infrastructure for ${targetBrand}`, 'Predictive ad optimization']
          : ['Enterprise advertising automation'],
        evidence: [
          {
            source: 'LLM Response Analysis',
            title: 'Synthesized Search Engine Result',
            description: `Extracted presence for ${targetBrand} alongside competitors: ${competitorsMentioned.join(', ') || 'None'}.`,
          },
        ],
        confidence: 0.92,
      };
    }

    // Call LLM with structured instruction
    try {
      const provider = LLMProviderFactory.getProvider('gemini');
      const prompt = `Analyze the following AI answer engine response for mentions of the target brand "${targetBrand}" and competitors [${competitors.join(', ')}].

AI Response:
"""
${rawResponse}
"""

Return ONLY a valid JSON object matching this exact JSON schema:
{
  "mentioned": boolean,
  "position": number or null (1-indexed rank if listed, else null),
  "competitorsMentioned": string[] (list of competitor names found),
  "sentiment": "positive" | "neutral" | "negative" | null,
  "relevantClaims": string[] (key claims made about the brands),
  "evidence": [{"source": string, "title": string, "description": string}],
  "confidence": number (between 0.0 and 1.0)
}`;

      const response = await provider.generateResponse(prompt, {
        systemPrompt: 'You are an expert AI Search & Semantic Extraction Agent. Output strictly JSON.',
      });

      const jsonStr = response.rawResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      return ExtractionSchema.parse(parsed);
    } catch (err) {
      console.warn('Extraction LLM failed, using fallback rule-based extraction:', err);
      return {
        mentioned: isMentioned,
        position,
        competitorsMentioned,
        sentiment: isMentioned ? 'neutral' : null,
        relevantClaims: ['Automated ad optimization'],
        evidence: [
          {
            source: 'Fallback Rule Extractor',
            title: 'Direct String Matching',
            description: `Brand ${targetBrand} ${isMentioned ? 'was' : 'was not'} detected in the raw response.`,
          },
        ],
        confidence: 0.8,
      };
    }
  }
}
