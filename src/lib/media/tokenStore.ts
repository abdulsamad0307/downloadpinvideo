import type {
  MediaType,
  MediaVariant,
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  createHash,
  randomUUID,
} from "crypto";

import { getRedis } from "@/lib/redis";

interface StoredMediaToken {
  mediaUrl: string;
  format?: string;
  expiresAt: number;
}

interface StoredPreparedVideoToken {
  sourceUrl: string;
  expiresAt: number;
}

const TOKEN_TTL_MS =
  10 * 60 * 1000;

const TOKEN_TTL_SECONDS =
  10 * 60;

const MEDIA_PREFIX =
  "download-pin-video:media:";

const PREPARED_PREFIX =
  "download-pin-video:prepared:";

/**
 * Local fallback.
 *
 * Used automatically while REDIS_URL is not configured,
 * and also as a safety fallback if Redis is temporarily unavailable.
 */
const store = new Map<
  string,
  StoredMediaToken
>();

const preparedVideoStore =
  new Map<
    string,
    StoredPreparedVideoToken
  >();

function purgeExpired(): void {
  const now = Date.now();

  for (
    const [key, value]
    of store.entries()
  ) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }

  for (
    const [key, value]
    of preparedVideoStore.entries()
  ) {
    if (value.expiresAt <= now) {
      preparedVideoStore.delete(key);
    }
  }
}

async function setRedisJson(
  key: string,
  value: unknown,
): Promise<boolean> {
  const redis = getRedis();

  if (!redis) {
    return false;
  }

  try {
    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      TOKEN_TTL_SECONDS,
    );

    return true;
  } catch (error) {
    console.error(
      "[Download Pin Video Redis SET failed]",
      error,
    );

    return false;
  }
}

async function getRedisJson<T>(
  key: string,
): Promise<T | null> {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  try {
    const raw =
      await redis.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(
      "[Download Pin Video Redis GET failed]",
      error,
    );

    return null;
  }
}

export async function registerMediaUrl(
  mediaUrl: string,
  format?: string,
): Promise<string> {
  purgeExpired();

  const token = randomUUID();

  const entry: StoredMediaToken = {
    mediaUrl,
    format,
    expiresAt:
      Date.now() + TOKEN_TTL_MS,
  };

  /**
   * Always keep a local copy.
   * This keeps local development fast and also gives
   * us a graceful fallback if Redis becomes unavailable.
   */
  store.set(
    token,
    entry,
  );

  await setRedisJson(
    `${MEDIA_PREFIX}${token}`,
    entry,
  );

  return token;
}

export async function resolveMediaToken(
  token: string,
): Promise<StoredMediaToken | null> {
  purgeExpired();

  /**
   * Redis first.
   *
   * This matters in production because the token may
   * have been created by another server instance.
   */
  const redisEntry =
    await getRedisJson<StoredMediaToken>(
      `${MEDIA_PREFIX}${token}`,
    );

  if (
    redisEntry &&
    redisEntry.expiresAt > Date.now()
  ) {
    return redisEntry;
  }

  const localEntry =
    store.get(token);

  if (
    !localEntry ||
    localEntry.expiresAt <= Date.now()
  ) {
    store.delete(token);

    return null;
  }

  return localEntry;
}

export async function registerPreparedVideo(
  sourceUrl: string,
): Promise<string> {
  purgeExpired();

  const token = randomUUID();

  const entry: StoredPreparedVideoToken = {
    sourceUrl,
    expiresAt:
      Date.now() + TOKEN_TTL_MS,
  };

  preparedVideoStore.set(
    token,
    entry,
  );

  await setRedisJson(
    `${PREPARED_PREFIX}${token}`,
    entry,
  );

  return token;
}

export async function resolvePreparedVideoToken(
  token: string,
): Promise<StoredPreparedVideoToken | null> {
  purgeExpired();

  const redisEntry =
    await getRedisJson<StoredPreparedVideoToken>(
      `${PREPARED_PREFIX}${token}`,
    );

  if (
    redisEntry &&
    redisEntry.expiresAt > Date.now()
  ) {
    return redisEntry;
  }

  const localEntry =
    preparedVideoStore.get(token);

  if (
    !localEntry ||
    localEntry.expiresAt <= Date.now()
  ) {
    preparedVideoStore.delete(token);

    return null;
  }

  return localEntry;
}

export async function attachDownloadTokens(
  result: PinterestMediaResult,
): Promise<PinterestMediaResult> {
  const variants =
    await Promise.all(
      result.variants.map(
        async (variant) => ({
          ...variant,
          url:
            `/api/media?token=${encodeURIComponent(
              await registerMediaUrl(
                variant.url,
                variant.format,
              ),
            )}`,
        }),
      ),
    );

  return {
    ...result,
    variants,
  };
}

export function variantId(
  url: string,
  quality?: string,
): string {
  return createHash("sha256")
    .update(
      `${url}:${quality ?? ""}`,
    )
    .digest("hex")
    .slice(0, 12);
}

export function dedupeVariants(
  variants: MediaVariant[],
): MediaVariant[] {
  const seen =
    new Set<string>();

  const output:
    MediaVariant[] = [];

  for (const variant of variants) {
    const key =
      `${variant.url}|` +
      `${variant.quality ?? ""}|` +
      `${variant.format ?? ""}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(variant);
  }

  return output;
}

export function inferFormatFromUrl(
  url: string,
): string | undefined {
  const pathname =
    url
      .split("?")[0]
      ?.toLowerCase() ?? "";

  if (
    pathname.endsWith(".mp4")
  ) {
    return "MP4";
  }

  if (
    pathname.endsWith(".gif")
  ) {
    return "GIF";
  }

  if (
    pathname.endsWith(".webp")
  ) {
    return "WEBP";
  }

  if (
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg")
  ) {
    return "JPEG";
  }

  if (
    pathname.endsWith(".png")
  ) {
    return "PNG";
  }

  return undefined;
}

export function qualityLabelFromKey(
  key: string,
): string | undefined {
  const normalized =
    key
      .replace(/^V_/i, "")
      .replace(/_/g, " ");

  if (
    /^\d+$/.test(
      normalized.replace(
        /[^\d]/g,
        "",
      ),
    ) &&
    normalized.match(/\d{3,4}/)
  ) {
    const match =
      normalized.match(
        /(\d{3,4})/,
      );

    return match
      ? `${match[1]}p`
      : normalized;
  }

  if (
    key.includes("720")
  ) {
    return "720p";
  }

  if (
    key.includes("1080")
  ) {
    return "1080p";
  }

  if (
    key.includes("orig") ||
    key.includes("ORIG")
  ) {
    return "Original";
  }

  if (
    key === "orig"
  ) {
    return "Original";
  }

  return normalized || undefined;
}

export function detectGif(
  typeHint: string | undefined,
  url: string,
): boolean {
  if (
    typeHint
      ?.toLowerCase()
      .includes("gif")
  ) {
    return true;
  }

  return url
    .toLowerCase()
    .includes(".gif");
}

export function resolveMediaType(
  hasVideo: boolean,
  isGif: boolean,
): MediaType {
  if (hasVideo) {
    return "video";
  }

  if (isGif) {
    return "gif";
  }

  return "image";
}