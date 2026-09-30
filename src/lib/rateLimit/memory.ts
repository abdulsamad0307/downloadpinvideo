export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
  remaining?: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

export interface MemoryRateLimiterOptions {
  limit: number;
  windowMs: number;
}

interface Entry {
  count: number;
  windowStart: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly store = new Map<string, Entry>();

  constructor(private readonly options: MemoryRateLimiterOptions) {}

  async check(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= this.options.windowMs) {
      this.store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: this.options.limit - 1,
      };
    }

    if (entry.count >= this.options.limit) {
      const retryAfterMs = this.options.windowMs - (now - entry.windowStart);
      return { allowed: false, retryAfterMs };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: this.options.limit - entry.count,
    };
  }
}

// ~10 requests per minute per IP — swappable for Redis later
export const downloadRateLimiter = new MemoryRateLimiter({
  limit: 10,
  windowMs: 60_000,
});

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}
