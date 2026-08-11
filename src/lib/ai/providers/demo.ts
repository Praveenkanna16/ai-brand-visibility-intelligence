import { LLMProvider, LLMResponse } from './base';
import { demoRunResults } from '@/lib/demo/data';

export class DemoProvider implements LLMProvider {
  name = 'demo';
  private engineId: string;

  constructor(engineId = 'engine-gpt4') {
    this.engineId = engineId;
  }

  async generateResponse(prompt: string): Promise<LLMResponse> {
    // Return deterministic response based on prompt match or standard fixture
    const matchedFixture = demoRunResults.find((r) =>
      r.prompt?.text.toLowerCase().includes(prompt.toLowerCase())
    );

    const rawResponse = matchedFixture?.rawResponse ||
      `When analyzing platforms for advertising optimization and marketing automation, several leading platforms emerge depending on organizational scale:\n\n1. Smartly.io - Premier enterprise social advertising automation platform.\n2. Albert.ai - Autonomous digital marketing platform focusing on multi-channel budget allocation.\n3. Pixis - Codeless AI infrastructure platform for ad performance optimization and predictive targeting.\n4. Madgicx - Ecommerce-focused advertising management suite.`;

    return {
      rawResponse,
      engineId: this.engineId,
      provider: 'demo',
      model: 'demo-v1',
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
