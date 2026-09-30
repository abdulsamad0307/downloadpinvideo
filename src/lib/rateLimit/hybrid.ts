import type {
    RateLimiter,
    RateLimitResult,
  } from "@/lib/rateLimit/memory";
  
  import {
    MemoryRateLimiter,
  } from "@/lib/rateLimit/memory";
  
  import {
    getRedis,
  } from "@/lib/redis";
  
  export interface HybridRateLimiterOptions {
    limit: number;
    windowMs: number;
    prefix?: string;
  }
  
  export class HybridRateLimiter implements RateLimiter {
    private readonly memoryLimiter: MemoryRateLimiter;
  
    private readonly prefix: string;
  
    constructor(
      private readonly options: HybridRateLimiterOptions,
    ) {
      this.memoryLimiter =
        new MemoryRateLimiter({
          limit: options.limit,
          windowMs: options.windowMs,
        });
  
      this.prefix =
        options.prefix ??
        "download-pin-video:rate-limit:";
    }
  
    private buildRedisKey(
      key: string,
    ): string {
      return `${this.prefix}${key}`;
    }
  
    async check(
      key: string,
    ): Promise<RateLimitResult> {
      const redis = getRedis();
  
      /**
       * Local development:
       * No REDIS_URL configured.
       *
       * Keep using the working memory limiter.
       */
      if (!redis) {
        return this.memoryLimiter.check(
          key,
        );
      }
  
      try {
        const redisKey =
          this.buildRedisKey(key);
  
        /**
         * Atomic enough for our fixed-window limiter:
         *
         * INCR creates the key with value 1 if it does not exist.
         */
        const count =
          await redis.incr(redisKey);
  
        /**
         * First request starts the rate-limit window.
         */
        if (count === 1) {
          await redis.pexpire(
            redisKey,
            this.options.windowMs,
          );
        }
  
        /**
         * Get remaining lifetime of this window.
         */
        let ttlMs =
          await redis.pttl(redisKey);
  
        /**
         * Safety:
         * if the key somehow exists without an expiry,
         * restore the expected expiration.
         */
        if (ttlMs < 0) {
          await redis.pexpire(
            redisKey,
            this.options.windowMs,
          );
  
          ttlMs =
            this.options.windowMs;
        }
  
        if (
          count >
          this.options.limit
        ) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterMs:
              Math.max(
                1,
                ttlMs,
              ),
          };
        }
  
        return {
          allowed: true,
          remaining:
            Math.max(
              0,
              this.options.limit -
                count,
            ),
        };
      } catch (error) {
        /**
         * Redis must never make the downloader unavailable.
         *
         * If Redis temporarily fails, fall back to the
         * existing local memory limiter.
         */
        console.error(
          "[Download Pin Video Redis rate limiter error]",
          error,
        );
  
        return this.memoryLimiter.check(
          key,
        );
      }
    }
  }
  
  /**
   * Main extraction endpoint limiter.
   *
   * Local:
   *   MemoryRateLimiter
   *
   * Production with REDIS_URL:
   *   Redis shared limiter
   */
  export const downloadRateLimiter =
    new HybridRateLimiter({
      limit: 10,
      windowMs: 60_000,
      prefix:
        "download-pin-video:rate-limit:download:",
    });