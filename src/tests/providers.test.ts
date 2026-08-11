import { describe, it, expect } from 'vitest';
import { LLMProviderFactory } from '@/lib/ai/providers/factory';

describe('LLMProviderFactory', () => {
  it('should return DemoProvider when DEMO_MODE=true', () => {
    process.env.DEMO_MODE = 'true';
    const provider = LLMProviderFactory.getProvider('gemini');
    expect(provider.name).toBe('demo');
  });

  it('should generate valid response from DemoProvider', async () => {
    const provider = LLMProviderFactory.getProvider('demo');
    const response = await provider.generateResponse('Best ad optimization tool');
    expect(response.rawResponse).toBeDefined();
    expect(response.rawResponse.length).toBeGreaterThan(0);
  });
});
