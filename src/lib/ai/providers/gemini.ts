import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from './base';

export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor(apiKey?: string, modelName = 'gemini-flash-latest') {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(key);
    this.primaryModel = modelName;
    this.fallbackModels = ['gemini-flash-latest', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
  }

  async generateResponse(prompt: string, options?: { systemPrompt?: string }): Promise<LLMResponse> {
    const modelsToTry = [this.primaryModel, ...this.fallbackModels.filter((m) => m !== this.primaryModel)];
    let lastError: unknown = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: options?.systemPrompt,
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
          rawResponse: text,
          engineId: 'engine-gemini',
          provider: 'gemini',
          model: modelName,
        };
      } catch (error) {
        console.warn(`Gemini API Warning with model ${modelName}:`, error instanceof Error ? error.message : error);
        lastError = error;
      }
    }

    console.error('Gemini API Error across all models:', lastError);
    throw new Error(`Gemini Provider Error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
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
