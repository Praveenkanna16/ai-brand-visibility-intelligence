import { describe, it, expect } from 'vitest';
import { ScoringCalculator } from '@/lib/scoring/calculator';

describe('ScoringCalculator', () => {
  it('should correctly calculate visibility score and share of voice', () => {
    const input = {
      targetBrand: 'Pixis',
      results: [
        {
          mentioned: true,
          position: 1,
          competitorsMentioned: ['Smartly.io'],
          engineName: 'ChatGPT',
          sentiment: 'positive',
        },
        {
          mentioned: false,
          position: null,
          competitorsMentioned: ['Albert.ai', 'Smartly.io'],
          engineName: 'Gemini',
          sentiment: null,
        },
      ],
      allCompetitors: ['Albert.ai', 'Smartly.io'],
    };

    const output = ScoringCalculator.calculate(input);

    expect(output.visibilityScore).toBe(50); // 1 out of 2 = 50%
    expect(output.avgPosition).toBe(1.0);
    expect(output.engineBreakdown).toHaveLength(2);
  });
});
