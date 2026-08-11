import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from './base';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;
const TIMEOUT_MS = 30000;

export class GeminiProvider implements LLMProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName?: string) {
    if (!apiKey) {
      throw new Error('GeminiProvider requires a valid API key.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName || GEMINI_MODEL;
  }

  async generateResponse(
    prompt: string,
    options?: { systemPrompt?: string }
  ): Promise<LLMResponse> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          systemInstruction: options?.systemPrompt,
        });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
          const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          });

          clearTimeout(timeoutId);

          const response = result.response;
          const text = response.text();

          if (!text || text.trim().length === 0) {
            throw new Error('Gemini returned an empty response.');
          }

          return {
            rawResponse: text,
            engineId: 'engine-gemini',
            provider: 'gemini',
            model: this.modelName,
          };
        } catch (innerError) {
          clearTimeout(timeoutId);
          throw innerError;
        }
      } catch (error: any) {
        lastError = error;

        const statusCode = error?.status || error?.httpStatusCode;
        const isRetryable =
          statusCode === 429 ||
          statusCode === 500 ||
          statusCode === 502 ||
          statusCode === 503 ||
          error?.name === 'AbortError' ||
          error?.message?.includes('timeout') ||
          error?.message?.includes('ECONNRESET');

        if (!isRetryable || attempt >= MAX_RETRIES) {
          break;
        }

        // Exponential backoff
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(
          `[Gemini] Retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms (${error?.message || 'unknown error'})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const errorMsg =
      lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Gemini API Error: ${errorMsg}`);
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
