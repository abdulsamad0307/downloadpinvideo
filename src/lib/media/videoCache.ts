import { createHash } from "crypto";

import { getRedis } from "@/lib/redis";

export type VideoCacheStatus =
  | "preparing"
  | "ready"
  | "failed";

export interface VideoCacheEntry {
  cacheKey: string;
  sourceUrl: string;
  quality: string;
  status: VideoCacheStatus;
  storageKey?: string;
  expiresAt: number;
}

const READY_TTL_MS =
  30 * 60 * 1000;

const READY_TTL_SECONDS =
  30 * 60;

const PREPARING_TTL_MS =
  5 * 60 * 1000;

const PREPARING_TTL_SECONDS =
  5 * 60;

const FAILED_TTL_MS =
  60 * 1000;

const FAILED_TTL_SECONDS =
  60;

const CACHE_PREFIX =
  "download-pin-video:video-cache:";

const localCache = new Map<
  string,
  VideoCacheEntry
>();

function purgeExpired(): void {
  const now = Date.now();

  for (
    const [key, entry]
    of localCache.entries()
  ) {
    if (entry.expiresAt <= now) {
      localCache.delete(key);
    }
  }
}

function redisKey(
  cacheKey: string,
): string {
  return `${CACHE_PREFIX}${cacheKey}`;
}

export function createVideoCacheKey(
  sourceUrl: string,
  quality = "best",
): string {
  return createHash("sha256")
    .update(`${sourceUrl}:${quality}`)
    .digest("hex")
    .slice(0, 24);
}

async function setRedisEntry(
  entry: VideoCacheEntry,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedis();

  if (!redis) {
    return;
  }

  try {
    await redis.set(
      redisKey(entry.cacheKey),
      JSON.stringify(entry),
      "EX",
      ttlSeconds,
    );
  } catch (error) {
    console.error(
      "[Download Pin Video video cache Redis SET failed]",
      error,
    );
  }
}

async function getRedisEntry(
  cacheKey: string,
): Promise<VideoCacheEntry | null> {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  try {
    const raw =
      await redis.get(
        redisKey(cacheKey),
      );

    if (!raw) {
      return null;
    }

    const entry =
      JSON.parse(raw) as VideoCacheEntry;

    if (entry.expiresAt <= Date.now()) {
      await redis.del(
        redisKey(cacheKey),
      );

      return null;
    }

    return entry;
  } catch (error) {
    console.error(
      "[Download Pin Video video cache Redis GET failed]",
      error,
    );

    return null;
  }
}

export async function getVideoCacheEntry(
  cacheKey: string,
): Promise<VideoCacheEntry | null> {
  purgeExpired();

  const redisEntry =
    await getRedisEntry(cacheKey);

  if (redisEntry) {
    localCache.set(
      cacheKey,
      redisEntry,
    );

    return redisEntry;
  }

  const localEntry =
    localCache.get(cacheKey);

  if (
    !localEntry ||
    localEntry.expiresAt <= Date.now()
  ) {
    localCache.delete(cacheKey);

    return null;
  }

  return localEntry;
}

export async function setVideoPreparing(
  cacheKey: string,
  sourceUrl: string,
  quality: string,
): Promise<VideoCacheEntry> {
  const entry: VideoCacheEntry = {
    cacheKey,
    sourceUrl,
    quality,
    status: "preparing",
    expiresAt:
      Date.now() + PREPARING_TTL_MS,
  };

  localCache.set(
    cacheKey,
    entry,
  );

  await setRedisEntry(
    entry,
    PREPARING_TTL_SECONDS,
  );

  return entry;
}

export async function setVideoReady(
  cacheKey: string,
  sourceUrl: string,
  quality: string,
  storageKey: string,
): Promise<VideoCacheEntry> {
  const entry: VideoCacheEntry = {
    cacheKey,
    sourceUrl,
    quality,
    status: "ready",
    storageKey,
    expiresAt:
      Date.now() + READY_TTL_MS,
  };

  localCache.set(
    cacheKey,
    entry,
  );

  await setRedisEntry(
    entry,
    READY_TTL_SECONDS,
  );

  return entry;
}

export async function setVideoFailed(
  cacheKey: string,
  sourceUrl: string,
  quality: string,
): Promise<VideoCacheEntry> {
  const entry: VideoCacheEntry = {
    cacheKey,
    sourceUrl,
    quality,
    status: "failed",
    expiresAt:
      Date.now() + FAILED_TTL_MS,
  };

  localCache.set(
    cacheKey,
    entry,
  );

  await setRedisEntry(
    entry,
    FAILED_TTL_SECONDS,
  );

  return entry;
}

export async function clearVideoCacheEntry(
  cacheKey: string,
): Promise<void> {
  localCache.delete(cacheKey);

  const redis = getRedis();

  if (!redis) {
    return;
  }

  try {
    await redis.del(
      redisKey(cacheKey),
    );
  } catch (error) {
    console.error(
      "[Download Pin Video video cache Redis DELETE failed]",
      error,
    );
  }
}