import { describe, it, expect } from 'vitest';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';

describe('LLMProviderFactory', () => {
  it('should throw error when GEMINI_API_KEY is missing', () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    expect(() => LLMProviderFactory.getProvider('gemini')).toThrow(
      'GEMINI_API_KEY environment variable is not set'
    );

    if (origKey) process.env.GEMINI_API_KEY = origKey;
  });

  it('should throw error for unsupported provider names like openai or claude', () => {
    expect(() => LLMProviderFactory.getProvider('openai')).toThrow(
      'Provider "openai" is not configured'
    );
    expect(() => LLMProviderFactory.getProvider('perplexity')).toThrow(
      'Provider "perplexity" is not configured'
    );
  });
});
