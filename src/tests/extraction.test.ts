import { describe, it, expect } from 'vitest';
import { ExtractorAgent } from '@/lib/extraction/extractor';

describe('ExtractorAgent', () => {
  it('should detect direct brand mentions and competitors', async () => {
    const rawText = `Top running shoe brands include Nike, Adidas, and Puma. Nike leads in cushion technology.`;
    const result = await ExtractorAgent.extract(rawText, 'Nike', ['Adidas', 'Puma']);

    expect(result.mentioned).toBe(true);
    expect(result.competitorsMentioned).toContain('Adidas');
    expect(result.competitorsMentioned).toContain('Puma');
  });

  it('should handle negation context correctly', async () => {
    const rawText = `Unlike Nike, Adidas is widely recommended for serious marathons because of Boost soles.`;
    const result = await ExtractorAgent.extract(rawText, 'Nike', ['Adidas']);

    expect(result.mentioned).toBe(false);
    expect(result.competitorsMentioned).toContain('Adidas');
  });

  it('should return mentioned=false when brand is completely absent', async () => {
    const rawText = `The best options are Adidas and Puma. Both offer great traction.`;
    const result = await ExtractorAgent.extract(rawText, 'Nike', ['Adidas', 'Puma']);

    expect(result.mentioned).toBe(false);
    expect(result.competitorsMentioned).toEqual(['Adidas', 'Puma']);
  });
});
