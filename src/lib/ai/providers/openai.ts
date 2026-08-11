import OpenAI from 'openai';
import { LLMProvider, LLMResponse } from './base';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';
  private client: OpenAI;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gpt-4o') {
    const key = apiKey || process.env.OPENAI_API_KEY || '';
    this.client = new OpenAI({ apiKey: key });
    this.modelName = modelName;
  }

  async generateResponse(prompt: string, options?: { systemPrompt?: string }): Promise<LLMResponse> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const completion = await this.client.chat.completions.create({
        model: this.modelName,
        messages,
      });

      const content = completion.choices[0]?.message?.content || '';

      return {
        rawResponse: content,
        engineId: 'engine-gpt4',
        provider: 'openai',
        model: this.modelName,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI Provider Error: ${error instanceof Error ? error.message : String(error)}`);
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
