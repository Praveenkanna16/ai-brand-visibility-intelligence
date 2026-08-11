import { describe, it, expect } from 'vitest';
import { ScoringCalculator } from '@/lib/scoring/calculator';

describe('ScoringCalculator', () => {
  it('should correctly calculate visibility score and share of voice (50% visibility)', () => {
    const input = {
      targetBrand: 'Nike',
      results: [
        {
          mentioned: true,
          position: 1,
          competitorsMentioned: ['Adidas'],
          engineName: 'Gemini',
          sentiment: 'positive',
        },
        {
          mentioned: false,
          position: null,
          competitorsMentioned: ['Puma', 'Adidas'],
          engineName: 'Gemini',
          sentiment: null,
        },
      ],
      allCompetitors: ['Adidas', 'Puma'],
    };

    const output = ScoringCalculator.calculate(input);

    expect(output.visibilityScore).toBe(50); // 1 out of 2 = 50%
    expect(output.mentionRate).toBe(50);
    expect(output.avgPosition).toBe(1.0);
    expect(output.engineBreakdown).toHaveLength(1);
    expect(output.competitorShares).toBeDefined();
  });

  it('should return 0% visibility when target brand is never mentioned', () => {
    const input = {
      targetBrand: 'Nike',
      results: [
        {
          mentioned: false,
          position: null,
          competitorsMentioned: ['Adidas', 'Puma'],
          engineName: 'Gemini',
        },
      ],
      allCompetitors: ['Adidas', 'Puma'],
    };

    const output = ScoringCalculator.calculate(input);

    expect(output.visibilityScore).toBe(0);
    expect(output.avgPosition).toBe(0);
    expect(output.shareOfMentions).toBe(0);
  });

  it('should return 100% visibility when target brand is always mentioned', () => {
    const input = {
      targetBrand: 'Nike',
      results: [
        {
          mentioned: true,
          position: 2,
          competitorsMentioned: ['Adidas'],
          engineName: 'Gemini',
        },
        {
          mentioned: true,
          position: 1,
          competitorsMentioned: [],
          engineName: 'Gemini',
        },
      ],
      allCompetitors: ['Adidas', 'Puma'],
    };

    const output = ScoringCalculator.calculate(input);

    expect(output.visibilityScore).toBe(100);
    expect(output.avgPosition).toBe(1.5);
  });
});
