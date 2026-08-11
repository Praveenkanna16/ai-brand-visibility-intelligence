// Simple in-memory token bucket rate limiter
// Suitable for single-region Vercel deployments

const buckets = new Map<string, { tokens: number; lastRefill: number }>();

const MAX_TOKENS = 5;
const REFILL_INTERVAL_MS = 60_000; // 1 minute

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(identifier, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    const retryAfterMs = REFILL_INTERVAL_MS - elapsed;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  bucket.tokens--;
  return { allowed: true, remaining: bucket.tokens, retryAfterMs: 0 };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > REFILL_INTERVAL_MS * 10) {
        buckets.delete(key);
      }
    }
  }, REFILL_INTERVAL_MS * 5);
}
