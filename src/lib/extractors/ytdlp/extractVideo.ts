import { ExtractionError } from "@/lib/api/errors";
import { getExtractionConfig } from "@/lib/config/extraction";

import {
  normalizeYtdlpVideoResult,
  parseYtdlpMetadata,
} from "@/lib/extractors/ytdlp/normalize";

import {
  runYtdlpMetadata,
  YtdlpProcessError,
} from "@/lib/extractors/ytdlp/runner";

import type {
  PinterestMediaResult,
  MediaVariant,
} from "@/lib/media/types";

import {
  attachDownloadTokens,
  registerPreparedVideo,
  variantId,
} from "@/lib/media/tokenStore";

async function buildPreparedVideoResult(
  resolvedUrl: string,
  metadata: ReturnType<typeof parseYtdlpMetadata>,
): Promise<PinterestMediaResult | null> {
  const videoFormats = (metadata.formats ?? []).filter((format) => {
    if (!format.url) {
      return false;
    }

    if (format.vcodec === "none") {
      return false;
    }

    const protocol =
      format.protocol?.toLowerCase() ?? "";

    const url =
      format.url.toLowerCase();

    return (
      protocol.includes("m3u8") ||
      url.includes(".m3u8")
    );
  });

  if (videoFormats.length === 0) {
    return null;
  }

  const bestFormat = [...videoFormats].sort(
    (a, b) =>
      (b.height ?? 0) -
      (a.height ?? 0),
  )[0];

  const token =
    await registerPreparedVideo(
      resolvedUrl,
    );

  const quality =
    bestFormat?.height &&
    bestFormat.height > 0
      ? `${bestFormat.height}p`
      : "Best";

  const variant: MediaVariant = {
    id: variantId(
      resolvedUrl,
      quality,
    ),

    url:
      `/api/video?token=${encodeURIComponent(
        token,
      )}`,

    format: "MP4",
    quality,
    width: bestFormat?.width,
    height: bestFormat?.height,

    fileSize:
      bestFormat?.filesize ??
      bestFormat?.filesize_approx,
  };

  return {
    sourceUrl: resolvedUrl,
    type: "video",
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    variants: [variant],
  };
}

export async function extractPinterestVideoViaYtdlp(
  resolvedUrl: string,
): Promise<PinterestMediaResult | null> {
  const config =
    getExtractionConfig();

  if (!config.ytdlpEnabled) {
    return null;
  }

  try {
    const { json } =
      await runYtdlpMetadata(
        config.ytdlpPath,
        resolvedUrl,
        config.ytdlpTimeoutMs,
      );

    const metadata =
      parseYtdlpMetadata(json);

    /*
     * 1) Direct progressive MP4 available.
     */
    const normalized =
      normalizeYtdlpVideoResult(
        metadata,
        resolvedUrl,
      );

    if (normalized) {
      return await attachDownloadTokens(
        normalized,
      );
    }

    /*
     * 2) HLS-only Pinterest video.
     */
    const prepared =
      await buildPreparedVideoResult(
        resolvedUrl,
        metadata,
      );

    if (prepared) {
      return prepared;
    }

    return null;
  } catch (error) {
    if (
      error instanceof
      YtdlpProcessError
    ) {
      if (
        error.code ===
        "BINARY_MISSING"
      ) {
        return null;
      }

      if (
        error.code ===
        "TIMEOUT"
      ) {
        throw new ExtractionError(
          "TIMEOUT",
          error.message,
        );
      }

      if (
        error.message.includes("404") ||
        error.message
          .toLowerCase()
          .includes("not found") ||
        error.message.includes(
          "Private video",
        )
      ) {
        return null;
      }

      throw new ExtractionError(
        "EXTRACTION_FAILED",
        error.message,
      );
    }

    throw error;
  }
}