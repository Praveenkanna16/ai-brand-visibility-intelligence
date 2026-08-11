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

// ─── Negation patterns ───
const NEGATION_PATTERNS = [
  /unlike\s+/i,
  /not\s+/i,
  /except\s+(for\s+)?/i,
  /rather\s+than\s+/i,
  /instead\s+of\s+/i,
  /as\s+opposed\s+to\s+/i,
  /however[\s,]+.*?\s+(?:doesn't|does not|isn't|is not|lacks?)\s/i,
  /but\s+not\s+/i,
  /excluding\s+/i,
];

function isNegatedMention(text: string, brandName: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  // Find the brand mention position
  const brandIndex = lowerText.indexOf(lowerBrand);
  if (brandIndex < 0) return false;

  // Check a window of ~80 chars before the brand mention for negation
  const windowStart = Math.max(0, brandIndex - 80);
  const windowText = lowerText.slice(windowStart, brandIndex + lowerBrand.length + 30);

  for (const pattern of NEGATION_PATTERNS) {
    if (pattern.test(windowText)) {
      return true;
    }
  }

  return false;
}

function ruleBased(
  rawResponse: string,
  targetBrand: string,
  competitors: string[]
): ExtractionResult {
  const lowerRaw = rawResponse.toLowerCase();
  const lowerTarget = targetBrand.toLowerCase();
  const rawMentioned = lowerRaw.includes(lowerTarget);
  const isNegated = rawMentioned && isNegatedMention(rawResponse, targetBrand);
  const isMentioned = rawMentioned && !isNegated;

  const competitorsMentioned = competitors.filter((c) =>
    lowerRaw.includes(c.toLowerCase())
  );

  // Calculate position from numbered lists or sentence order
  let position: number | null = null;
  if (isMentioned) {
    // Try to find numbered list position (e.g., "1. Nike", "2. Adidas")
    const numberedPattern = new RegExp(
      `(\\d+)[.\\)\\-]\\s*[^\\n]*?${targetBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i'
    );
    const numberedMatch = rawResponse.match(numberedPattern);
    if (numberedMatch) {
      position = parseInt(numberedMatch[1], 10);
    } else {
      // Fall back to sentence-order position
      const sentences = rawResponse.split(/[.!?\n]+/);
      const mentionIdx = sentences.findIndex((s) =>
        s.toLowerCase().includes(lowerTarget)
      );
      position = mentionIdx >= 0 ? Math.min(mentionIdx + 1, 10) : 1;
    }
  }

  return {
    mentioned: isMentioned,
    position,
    competitorsMentioned,
    sentiment: isMentioned
      ? isNegated
        ? 'negative'
        : 'neutral'
      : null,
    relevantClaims: [],
    evidence: [
      {
        source: 'Rule-Based Extractor',
        title: 'String Matching Analysis',
        description: `${targetBrand} ${isMentioned ? 'was detected' : 'was not detected'}${isNegated ? ' (negated context)' : ''} in the AI response. ${competitorsMentioned.length > 0 ? `Competitors detected: ${competitorsMentioned.join(', ')}.` : 'No competitors detected.'}`,
      },
    ],
    confidence: 0.6,
  };
}

export class ExtractorAgent {
  static async extract(
    rawResponse: string,
    targetBrand: string,
    competitors: string[]
  ): Promise<ExtractionResult> {
    // Try LLM-based extraction first
    try {
      const provider = LLMProviderFactory.getProvider('gemini');
      const prompt = `Analyze the following AI answer engine response for mentions of the target brand "${targetBrand}" and competitors [${competitors.join(', ')}].

IMPORTANT:
- If the brand is mentioned in a NEGATIVE context (e.g., "unlike ${targetBrand}", "not ${targetBrand}"), set "mentioned" to false and "sentiment" to "negative".
- "position" should be the 1-indexed rank if the brand appears in a numbered or ordered list, otherwise null.
- Only include competitors from the provided list that are actually mentioned.
- "relevantClaims" should be specific claims from the text, not generic descriptions.

AI Response:
"""
${rawResponse}
"""

Return ONLY a valid JSON object matching this exact schema:
{
  "mentioned": boolean,
  "position": number or null,
  "competitorsMentioned": string[],
  "sentiment": "positive" | "neutral" | "negative" | null,
  "relevantClaims": string[],
  "evidence": [{"source": string, "title": string, "description": string}],
  "confidence": number (0.0 to 1.0)
}`;

      const response = await provider.generateResponse(prompt, {
        systemPrompt:
          'You are an expert AI Search & Semantic Extraction Agent. Output strictly valid JSON. No markdown, no code fences.',
      });

      const jsonStr = response.rawResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed = JSON.parse(jsonStr);
      return ExtractionSchema.parse(parsed);
    } catch (err) {
      console.warn(
        '[Extractor] LLM extraction failed, using rule-based fallback:',
        err instanceof Error ? err.message : err
      );
      return ruleBased(rawResponse, targetBrand, competitors);
    }
  }
}
