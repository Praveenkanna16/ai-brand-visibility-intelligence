export interface LLMResponse {
  rawResponse: string;
  engineId: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, options?: { systemPrompt?: string }): Promise<LLMResponse>;
  healthCheck(): Promise<boolean>;
}
