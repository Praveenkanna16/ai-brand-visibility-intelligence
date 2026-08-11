import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  it('should allow up to 5 requests per minute and block the 6th', () => {
    const testIP = `192.168.1.${Math.floor(Math.random() * 10000)}`;

    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIP);
      expect(res.allowed).toBe(true);
    }

    const blocked = checkRateLimit(testIP);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });
});
