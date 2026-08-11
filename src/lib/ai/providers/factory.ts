import { LLMProvider } from './base';
import { GeminiProvider } from './gemini';

export class LLMProviderFactory {
  static getProvider(providerName: string): LLMProvider {
    const normalized = providerName.toLowerCase();

    if (normalized !== 'gemini') {
      throw new Error(
        `Provider "${providerName}" is not configured. Only "gemini" is currently available.`
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is not set. Live analysis is unavailable.'
      );
    }

    return new GeminiProvider(apiKey);
  }
}
