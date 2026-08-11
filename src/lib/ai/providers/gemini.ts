import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from './base';

export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-1.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(key);
    this.modelName = modelName;
  }

  async generateResponse(prompt: string, options?: { systemPrompt?: string }): Promise<LLMResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: options?.systemPrompt,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        rawResponse: text,
        engineId: 'engine-gemini',
        provider: 'gemini',
        model: this.modelName,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini Provider Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await this.generateResponse('Hello, respond with OK.');
      return res.rawResponse.length > 0;
    } catch {
      return false;
    }
  }
}
