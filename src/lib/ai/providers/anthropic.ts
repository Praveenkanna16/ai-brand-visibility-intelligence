import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMResponse } from './base';

export class AnthropicProvider implements LLMProvider {
  name = 'anthropic';
  private client: Anthropic;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'claude-3-5-sonnet-20241022') {
    const key = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.client = new Anthropic({ apiKey: key });
    this.modelName = modelName;
  }

  async generateResponse(prompt: string, options?: { systemPrompt?: string }): Promise<LLMResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 2000,
        system: options?.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { text: string }).text)
        .join('\n');

      return {
        rawResponse: text,
        engineId: 'engine-claude',
        provider: 'anthropic',
        model: this.modelName,
      };
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw new Error(`Anthropic Provider Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.generateResponse('Hi');
      return res.rawResponse.length > 0;
    } catch {
      return false;
    }
  }
}
