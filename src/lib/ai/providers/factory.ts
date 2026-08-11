import { LLMProvider } from './base';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { DemoProvider } from './demo';

export class LLMProviderFactory {
  static getProvider(providerName: string, engineId?: string): LLMProvider {
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode) {
      return new DemoProvider(engineId);
    }

    switch (providerName.toLowerCase()) {
      case 'gemini':
        if (process.env.GEMINI_API_KEY) {
          return new GeminiProvider(process.env.GEMINI_API_KEY);
        }
        break;
      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          return new OpenAIProvider(process.env.OPENAI_API_KEY);
        }
        break;
      case 'anthropic':
        if (process.env.ANTHROPIC_API_KEY) {
          return new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
        }
        break;
    }

    // Fallback to Gemini if key exists, otherwise DemoProvider
    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY);
    }

    return new DemoProvider(engineId);
  }
}
