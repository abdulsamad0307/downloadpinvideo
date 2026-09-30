import { NextResponse } from "next/server";

import {
  readFile,
  rm,
} from "fs/promises";

import {
  createHash,
} from "crypto";

import path from "path";

import {
  resolvePreparedVideoToken,
} from "@/lib/media/tokenStore";

import {
  runSingleVideoJob,
} from "@/lib/media/videoJobCoordinator";

import {
  runYtdlpVideoDownload,
} from "@/lib/extractors/ytdlp/runner";

import {
  createVideoCacheKey,
  getVideoCacheEntry,
  setVideoPreparing,
  setVideoReady,
  setVideoFailed,
  clearVideoCacheEntry,
} from "@/lib/media/videoCache";

import {
  cleanupExpiredVideoFiles,
  getStoredVideoFile,
  storeVideoFile,
} from "@/lib/storage/videoStorage";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/**
 * yt-dlp binary location.
 *
 * Local Windows:
 * tools/yt-dlp.exe
 *
 * VPS:
 * normally /usr/local/bin/yt-dlp
 */
const YTDLP_PATH =
  process.env.YTDLP_PATH?.trim() ||
  (
    process.platform === "win32"
      ? path.join(
          process.cwd(),
          "tools",
          "yt-dlp.exe",
        )
      : "/usr/local/bin/yt-dlp"
  );

/**
 * Base yt-dlp timeout.
 */
const parsedTimeout =
  Number(
    process.env.YTDLP_TIMEOUT_MS ??
      "15000",
  );

const YTDLP_TIMEOUT_MS =
  Number.isFinite(
    parsedTimeout,
  ) &&
  parsedTimeout > 0
    ? parsedTimeout
    : 15_000;

/**
 * Video preparation may take longer
 * than simple metadata extraction.
 */
const VIDEO_PREPARATION_TIMEOUT_MS =
  Math.max(
    YTDLP_TIMEOUT_MS,
    120_000,
  );

/**
 * Current prepared-video quality key.
 *
 * If later multiple qualities are
 * supported, this can become 720p,
 * 1080p, etc.
 */
const VIDEO_QUALITY =
  "best";

/**
 * Stable key for one source URL.
 */
function createJobKey(
  sourceUrl: string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      sourceUrl,
    )
    .digest(
      "hex",
    );
}

/**
 * Read one already-cached MP4.
 */
async function readStoredVideo(
  storageKey: string,
): Promise<Buffer | null> {
  const stored =
    await getStoredVideoFile(
      storageKey,
    );

  if (!stored) {
    return null;
  }

  const buffer =
    await readFile(
      stored.filePath,
    );

  if (
    buffer.length === 0
  ) {
    return null;
  }

  return buffer;
}

/**
 * Prepare one HLS/video source and
 * place the completed MP4 in reusable
 * temporary storage.
 */
async function prepareAndCacheVideo(
  sourceUrl: string,
  cacheKey: string,
): Promise<Buffer> {
  const startedAt =
    Date.now();

  let tempDir:
    string | undefined;

  try {
    console.log(
      "[Download Pin Video PREPARED] START",
    );

    console.log(
      "[Download Pin Video PREPARED] YTDLP PATH",
      YTDLP_PATH,
    );

    /**
     * Mark cache entry as preparing.
     */
    await setVideoPreparing(
      cacheKey,
      sourceUrl,
      VIDEO_QUALITY,
    );

    /**
     * Clean expired cached files
     * opportunistically.
     */
    cleanupExpiredVideoFiles()
      .catch(
        (error) => {
          console.warn(
            "[Download Pin Video VIDEO CACHE CLEANUP ERROR]",
            error,
          );
        },
      );

    const prepared =
      await runYtdlpVideoDownload(
        YTDLP_PATH,
        sourceUrl,
        VIDEO_PREPARATION_TIMEOUT_MS,
      );

    tempDir =
      prepared.tempDir;

    /**
     * Save final MP4 into reusable
     * storage before removing yt-dlp
     * temp directory.
     */
    const stored =
      await storeVideoFile(
        cacheKey,
        prepared.filePath,
      );

    await setVideoReady(
      cacheKey,
      sourceUrl,
      VIDEO_QUALITY,
      stored.storageKey,
    );

    const fileBuffer =
      await readFile(
        stored.filePath,
      );

    if (
      fileBuffer.length === 0
    ) {
      throw new Error(
        "Prepared video file is empty",
      );
    }

    const elapsedMs =
      Date.now() -
      startedAt;

    console.log(
      `[Download Pin Video PREPARED] DONE ${elapsedMs}ms`,
    );

    return fileBuffer;
  } catch (error) {
    const elapsedMs =
      Date.now() -
      startedAt;

    console.error(
      `[Download Pin Video PREPARED] FAILED ${elapsedMs}ms`,
      error,
    );

    await setVideoFailed(
      cacheKey,
      sourceUrl,
      VIDEO_QUALITY,
    );

    throw error;
  } finally {
    /**
     * yt-dlp working directory can now
     * be deleted because final MP4 has
     * already been copied into cache.
     */
    if (tempDir) {
      try {
        await rm(
          tempDir,
          {
            recursive:
              true,

            force:
              true,
          },
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          "[Download Pin Video PREPARED] CLEANUP ERROR",
          cleanupError,
        );
      }
    }
  }
}

/**
 * Build final MP4 response.
 */
function videoResponse(
  buffer: Buffer,
): Response {
  return new Response(
    new Uint8Array(
      buffer,
    ),
    {
      status:
        200,

      headers: {
        "Content-Type":
          "application/x-download-pin-video-binary",

        "Content-Length":
          String(
            buffer.length,
          ),

        /**
         * Browser should download rather
         * than reuse a private response.
         *
         * Server-side reusable cache is
         * handled independently.
         */
        "Cache-Control":
          "private, no-store, max-age=0",

        "X-Content-Type-Options":
          "nosniff",
      },
    },
  );
}

/**
 * GET /api/video?token=...
 */
export async function GET(
  request: Request,
) {
  const {
    searchParams,
  } =
    new URL(
      request.url,
    );

  const token =
    searchParams.get(
      "token",
    );

  if (!token) {
    return NextResponse.json(
      {
        error:
          "Missing video token",
      },
      {
        status:
          400,
      },
    );
  }

  /**
   * Resolve internal token back
   * to Pinterest/HLS source.
   */
  const entry =
    await resolvePreparedVideoToken(
      token,
    );

  if (!entry) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired video token",
      },
      {
        status:
          404,
      },
    );
  }

  const sourceUrl =
    entry.sourceUrl;

  const cacheKey =
    createVideoCacheKey(
      sourceUrl,
      VIDEO_QUALITY,
    );

  const jobKey =
    createJobKey(
      sourceUrl,
    );

  try {
    /**
     * FAST PATH #1
     *
     * Cache metadata says ready.
     */
    const cacheEntry =
      await getVideoCacheEntry(
        cacheKey,
      );

    if (
      cacheEntry?.status ===
        "ready" &&
      cacheEntry.storageKey
    ) {
      const cachedBuffer =
        await readStoredVideo(
          cacheEntry.storageKey,
        );

      if (cachedBuffer) {
        console.log(
          `[Download Pin Video VIDEO CACHE] HIT ${cacheKey}`,
        );

        return videoResponse(
          cachedBuffer,
        );
      }

      /**
       * Metadata exists but file no
       * longer exists.
       */
      await clearVideoCacheEntry(
        cacheKey,
      );
    }

    /**
     * FAST PATH #2
     *
     * Even if Redis/local metadata was
     * lost, storage may still contain
     * the cached file.
     */
    const orphanStored =
      await getStoredVideoFile(
        cacheKey,
      );

    if (orphanStored) {
      const cachedBuffer =
        await readFile(
          orphanStored.filePath,
        );

      if (
        cachedBuffer.length > 0
      ) {
        await setVideoReady(
          cacheKey,
          sourceUrl,
          VIDEO_QUALITY,
          cacheKey,
        );

        console.log(
          `[Download Pin Video VIDEO CACHE] STORAGE HIT ${cacheKey}`,
        );

        return videoResponse(
          cachedBuffer,
        );
      }
    }

    console.log(
      `[Download Pin Video VIDEO CACHE] MISS ${cacheKey}`,
    );

    /**
     * Only one actual preparation
     * job may run for one source URL.
     *
     * Concurrent users/request retries
     * join the same promise.
     */
    const fileBuffer =
      await runSingleVideoJob(
        jobKey,
        () =>
          prepareAndCacheVideo(
            sourceUrl,
            cacheKey,
          ),
      );

    if (
      fileBuffer.length === 0
    ) {
      throw new Error(
        "Prepared video response is empty",
      );
    }

    return videoResponse(
      fileBuffer,
    );
  } catch (error) {
    console.error(
      "[Download Pin Video VIDEO ROUTE ERROR]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to prepare video",
      },
      {
        status:
          500,
      },
    );
  }
}