import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  if (!redis) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on("error", (error) => {
      console.error(
        "[Download Pin Video Redis error]",
        error,
      );
    });
  }

  return redis;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}