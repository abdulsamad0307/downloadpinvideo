import type {
  MediaVariant,
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  ExtractionError,
} from "@/lib/api/errors";

import {
  attachDownloadTokens,
  detectGif,
  registerPreparedVideo,
  resolveMediaType,
  variantId,
} from "@/lib/media/tokenStore";

import {
  extractFromHtml,
  mapFetcherError,
  resolvePinterestPageUrl,
} from "@/lib/extractors/html";

import {
  extractPinterestVideoViaApi,
} from "./pinterestApi";

import {
  extractPinterestVideoViaYtdlp,
} from "@/lib/extractors/ytdlp/extractVideo";

import {
  logExtractionMethod,
} from "@/lib/logging/devLogger";

/**
 * Build the normal HTML result.
 */
function buildHtmlMediaResult(
  sourceUrl: string,
  parsed: Awaited<
    ReturnType<
      typeof extractFromHtml
    >
  >["parsed"],
): PinterestMediaResult {
  const hasVideo =
    parsed.videoVariants.length > 0;

  const primaryVariants =
    hasVideo
      ? parsed.videoVariants
      : parsed.imageVariants;

  const sampleUrl =
    primaryVariants[0]?.url ?? "";

  const isGif =
    !hasVideo &&
    detectGif(
      undefined,
      sampleUrl,
    );

  return {
    sourceUrl,
    type:
      resolveMediaType(
        hasVideo,
        isGif,
      ),
    title:
      parsed.title,
    thumbnail:
      parsed.thumbnail,
    variants:
      primaryVariants,
  };
}

/**
 * Build the prepared HLS result
 * from HTML extraction.
 */
async function buildHlsVideoResult(
  sourceUrl: string,
  parsed: Awaited<
    ReturnType<
      typeof extractFromHtml
    >
  >["parsed"],
): Promise<
  PinterestMediaResult | null
> {
  if (
    parsed.hlsVariants.length === 0
  ) {
    return null;
  }

  const bestHls =
    [
      ...parsed.hlsVariants,
    ].sort(
      (a, b) => {
        const aPixels =
          (a.width ?? 0) *
          (a.height ?? 0);

        const bPixels =
          (b.width ?? 0) *
          (b.height ?? 0);

        if (
          bPixels !==
          aPixels
        ) {
          return (
            bPixels -
            aPixels
          );
        }

        return (
          (b.height ?? 0) -
          (a.height ?? 0)
        );
      },
    )[0];

  if (!bestHls) {
    return null;
  }

  const token =
    await registerPreparedVideo(
      sourceUrl,
    );

  const quality =
    bestHls.height &&
    bestHls.height > 0
      ? `${bestHls.height}p`
      : bestHls.quality ??
        "Best";

  return {
    sourceUrl,
    type:
      "video",
    title:
      parsed.title,
    thumbnail:
      parsed.thumbnail,
    variants: [
      {
        id:
          variantId(
            sourceUrl,
            quality,
          ),
        url:
          `/api/video?token=${encodeURIComponent(
            token,
          )}`,
        format:
          "MP4",
        quality,
        width:
          bestHls.width,
        height:
          bestHls.height,
      },
    ],
  };
}

/**
 * Some variants may not expose
 * width/height directly but may
 * contain "720p", "1080p", etc.
 * in the quality label.
 */
function qualityHeight(
  variant: MediaVariant,
): number {
  if (
    variant.height &&
    variant.height > 0
  ) {
    return variant.height;
  }

  const match =
    variant.quality?.match(
      /(\d{3,4})p?/i,
    );

  if (!match?.[1]) {
    return 0;
  }

  const parsed =
    Number(
      match[1],
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

/**
 * Compare two media variants
 * by actual resolution.
 *
 * Positive:
 * a is better.
 *
 * Zero:
 * equal / cannot distinguish.
 *
 * Negative:
 * b is better.
 */
function compareVariantResolution(
  a: MediaVariant,
  b: MediaVariant,
): number {
  const aWidth =
    a.width ?? 0;

  const aHeight =
    qualityHeight(
      a,
    );

  const bWidth =
    b.width ?? 0;

  const bHeight =
    qualityHeight(
      b,
    );

  const aPixels =
    aWidth > 0 &&
    aHeight > 0
      ? aWidth *
        aHeight
      : 0;

  const bPixels =
    bWidth > 0 &&
    bHeight > 0
      ? bWidth *
        bHeight
      : 0;

  if (
    aPixels > 0 &&
    bPixels > 0 &&
    aPixels !== bPixels
  ) {
    return (
      aPixels -
      bPixels
    );
  }

  if (
    aHeight !==
    bHeight
  ) {
    return (
      aHeight -
      bHeight
    );
  }

  return (
    aWidth -
    bWidth
  );
}

/**
 * Find the highest-resolution variant.
 */
function bestVariant(
  variants:
    MediaVariant[],
): MediaVariant | undefined {
  if (
    variants.length === 0
  ) {
    return undefined;
  }

  return [
    ...variants,
  ].sort(
    (a, b) =>
      compareVariantResolution(
        b,
        a,
      ),
  )[0];
}

/**
 * /api/video means the API
 * extractor selected HLS and
 * registered a prepared video job.
 *
 * /api/media means we already found
 * a progressive/direct MP4.
 */
function isPreparedApiVideo(
  result:
    PinterestMediaResult,
): boolean {
  return (
    result.type ===
      "video" &&
    result.variants.some(
      (variant) =>
        variant.url.startsWith(
          "/api/video?",
        ),
    )
  );
}

/**
 * Build and return an image/GIF
 * result from already-parsed HTML.
 */
async function returnHtmlImageResult(
  sourceUrl: string,
  parsed: Awaited<
    ReturnType<
      typeof extractFromHtml
    >
  >["parsed"],
  logTotal:
    (method: string) => void,
): Promise<
  PinterestMediaResult
> {
  logExtractionMethod(
    "html",
    "image",
  );

  const result =
    buildHtmlMediaResult(
      sourceUrl,
      parsed,
    );

  logTotal(
    "html-image",
  );

  return await attachDownloadTokens(
    result,
  );
}

/**
 * Extraction options.
 *
 * fastMode is used by the browser-extension flow only.
 */
type ExtractionOptions = {
  fastMode?: boolean;
};

/**
 * Main Pinterest extraction
 * orchestrator.
 */
export async function extractPinterestMedia(
  inputUrl: string,
  options: ExtractionOptions = {},
): Promise<
  PinterestMediaResult
> {
  const fastMode =
    options.fastMode === true;

  const totalStart =
    performance.now();

  const logTotal = (
    method: string,
  ): void => {
    console.log(
      `[Download Pin Video SPEED] TOTAL (${method}): ${Math.round(
        performance.now() -
          totalStart,
      )}ms`,
    );
  };

  try {
    /**
     * STEP 1
     *
     * Resolve normal pinterest.com
     * or pin.it URL.
     */
    const resolveStart =
      performance.now();

    const resolvedUrl =
      await resolvePinterestPageUrl(
        inputUrl,
      );

    console.log(
      `[Download Pin Video SPEED] URL resolve: ${Math.round(
        performance.now() -
          resolveStart,
      )}ms`,
    );

    /**
     * STEP 2
     *
     * Pinterest API + HTML in parallel.
     */
    const apiStart =
      performance.now();

    const htmlStart =
      performance.now();

    const apiPromise =
      extractPinterestVideoViaApi(
        resolvedUrl,
      );

    const htmlPromise =
      extractFromHtml(
        resolvedUrl,
      )
        .then((value) => ({
          ok: true as const,
          value,
        }))
        .catch((error: unknown) => ({
          ok: false as const,
          error,
        }));

    const apiResult =
      await apiPromise;

    console.log(
      `[Download Pin Video SPEED] Pinterest API: ${Math.round(
        performance.now() -
          apiStart,
      )}ms`,
    );

    let apiFallback:
      PinterestMediaResult | null =
      null;

    if (apiResult) {
      /**
       * EXTENSION FAST API IMAGE PATH
       *
       * If Pinterest API already returned
       * a complete image result, extension
       * traffic does not need to wait for HTML.
       *
       * Homepage stays unchanged because
       * fastMode defaults to false.
       */
      if (
        fastMode &&
        apiResult.type ===
          "image"
      ) {
        console.log(
          "[Download Pin Video SPEED] fast mode: returning Pinterest API image immediately",
        );

        logTotal(
          "pinterest-api-image-fast",
        );

        return apiResult;
      }

      /**
       * Direct API video.
       */
      if (
        apiResult.type ===
          "video" &&
        !isPreparedApiVideo(
          apiResult,
        )
      ) {
        console.log(
          "[Download Pin Video] extraction_success | direct video via pinterest-api",
        );

        logTotal(
          "pinterest-api-direct",
        );

        return apiResult;
      }

      /**
       * Keep API HLS or other usable media
       * as fallback while checking HTML.
       */
      apiFallback =
        apiResult;

      if (
        isPreparedApiVideo(
          apiResult,
        )
      ) {
        console.log(
          "[Download Pin Video SPEED] Pinterest API returned HLS; checking HTML for direct MP4",
        );
      } else {
        console.log(
          "[Download Pin Video SPEED] Pinterest API returned non-direct media; checking HTML",
        );
      }
    } else {
      console.log(
        "[Download Pin Video SPEED] Pinterest API returned no usable media; falling back to HTML",
      );
    }

    /**
     * STEP 3
     *
     * HTML extraction.
     */
    const htmlSettled =
      await htmlPromise;

    if (!htmlSettled.ok) {
      if (apiFallback) {
        console.log(
          "[Download Pin Video] HTML extraction failed; using Pinterest API fallback",
        );

        logTotal(
          "pinterest-api-after-html-failure",
        );

        return apiFallback;
      }

      throw htmlSettled.error;
    }

    const {
      sourceUrl,
      parsed,
    } =
      htmlSettled.value;

    console.log(
      `[Download Pin Video SPEED] HTML fetch+parse: ${Math.round(
        performance.now() -
          htmlStart,
      )}ms`,
    );

    console.log(
      `[Download Pin Video SPEED] HTML variants: direct=${parsed.videoVariants.length}, hls=${parsed.hlsVariants.length}, images=${parsed.imageVariants.length}`,
    );

    /**
     * STEP 3A
     *
     * Progressive/direct MP4 found
     * in HTML.
     */
    if (
      parsed.videoVariants.length >
      0
    ) {
      const bestHtmlDirect =
        bestVariant(
          parsed.videoVariants,
        );

      if (
        apiFallback &&
        isPreparedApiVideo(
          apiFallback,
        )
      ) {
        const bestApiHls =
          bestVariant(
            apiFallback.variants,
          );

        if (
          bestHtmlDirect &&
          bestApiHls
        ) {
          const comparison =
            compareVariantResolution(
              bestHtmlDirect,
              bestApiHls,
            );

          console.log(
            "[Download Pin Video QUALITY COMPARE]",
            {
              htmlDirect:
                `${bestHtmlDirect.width ?? 0}x${qualityHeight(
                  bestHtmlDirect,
                )}`,
              apiHls:
                `${bestApiHls.width ?? 0}x${qualityHeight(
                  bestApiHls,
                )}`,
              selected:
                comparison >= 0
                  ? "HTML_DIRECT"
                  : "API_HLS",
            },
          );

          if (
            comparison >= 0
          ) {
            logExtractionMethod(
              "html",
              "video",
            );

            const result =
              buildHtmlMediaResult(
                sourceUrl,
                parsed,
              );

            logTotal(
              "html-direct-over-api-hls",
            );

            return await attachDownloadTokens(
              result,
            );
          }

          console.log(
            "[Download Pin Video] keeping higher-quality API HLS result",
          );

          logTotal(
            "pinterest-api-hls-quality",
          );

          return apiFallback;
        }

        if (
          !bestHtmlDirect ||
          !bestApiHls
        ) {
          console.log(
            "[Download Pin Video] incomplete resolution metadata; keeping API HLS for quality safety",
          );

          logTotal(
            "pinterest-api-hls-safe",
          );

          return apiFallback;
        }
      }

      logExtractionMethod(
        "html",
        "video",
      );

      const result =
        buildHtmlMediaResult(
          sourceUrl,
          parsed,
        );

      logTotal(
        "html-direct",
      );

      return await attachDownloadTokens(
        result,
      );
    }

    /**
     * STEP 3B
     *
     * API HLS fallback.
     */
    if (
      apiFallback &&
      isPreparedApiVideo(
        apiFallback,
      )
    ) {
      const bestHtmlHls =
        bestVariant(
          parsed.hlsVariants,
        );

      const bestApiHls =
        bestVariant(
          apiFallback.variants,
        );

      if (
        bestHtmlHls &&
        bestApiHls &&
        compareVariantResolution(
          bestHtmlHls,
          bestApiHls,
        ) > 0
      ) {
        const htmlHlsResult =
          await buildHlsVideoResult(
            sourceUrl,
            parsed,
          );

        if (
          htmlHlsResult
        ) {
          logExtractionMethod(
            "html",
            "video",
          );

          logTotal(
            "html-hls-higher",
          );

          return htmlHlsResult;
        }
      }

      console.log(
        "[Download Pin Video] no equal/better HTML direct MP4; using API HLS fallback",
      );

      logTotal(
        "pinterest-api-hls-fallback",
      );

      return apiFallback;
    }

    /**
     * STEP 3C
     *
     * HTML HLS fallback.
     */
    const hlsResult =
      await buildHlsVideoResult(
        sourceUrl,
        parsed,
      );

    if (
      hlsResult
    ) {
      logExtractionMethod(
        "html",
        "video",
      );

      logTotal(
        "html-hls",
      );

      return hlsResult;
    }

    /**
     * EXTENSION FAST HTML IMAGE MODE
     *
     * If API did not already return an image,
     * but HTML has one, skip slow yt-dlp.
     */
    if (
      fastMode &&
      parsed.imageVariants.length >
        0
    ) {
      console.log(
        "[Download Pin Video SPEED] fast mode: skipping yt-dlp and returning HTML image",
      );

      return await returnHtmlImageResult(
        sourceUrl,
        parsed,
        logTotal,
      );
    }

    /**
     * STEP 4
     *
     * Slow yt-dlp fallback.
     */
    const ytdlpStart =
      performance.now();

    let ytdlpResult:
      PinterestMediaResult | null =
      null;

    try {
      ytdlpResult =
        await extractPinterestVideoViaYtdlp(
          resolvedUrl,
        );

      console.log(
        `[Download Pin Video SPEED] yt-dlp fallback: ${Math.round(
          performance.now() -
            ytdlpStart,
        )}ms`,
      );
    } catch (ytdlpError) {
      console.log(
        `[Download Pin Video SPEED] yt-dlp fallback failed after ${Math.round(
          performance.now() -
            ytdlpStart,
        )}ms`,
      );

      if (
        parsed.imageVariants.length >
        0
      ) {
        console.log(
          "[Download Pin Video] yt-dlp found no usable video; returning HTML image",
        );

        return await returnHtmlImageResult(
          sourceUrl,
          parsed,
          logTotal,
        );
      }

      throw ytdlpError;
    }

    if (
      ytdlpResult
    ) {
      logExtractionMethod(
        "ytdlp",
        "video",
      );

      logTotal(
        "ytdlp-fallback",
      );

      return ytdlpResult;
    }

    /**
     * STEP 5
     *
     * Image / GIF fallback.
     */
    if (
      parsed.imageVariants.length >
      0
    ) {
      return await returnHtmlImageResult(
        sourceUrl,
        parsed,
        logTotal,
      );
    }

    if (
      apiFallback
    ) {
      logTotal(
        "pinterest-api-fallback",
      );

      return apiFallback;
    }

    logTotal(
      "failed",
    );

    throw new ExtractionError(
      "MEDIA_NOT_FOUND",
      "No downloadable media found in public page data",
    );
  } catch (error) {
    console.log(
      `[Download Pin Video SPEED] FAILED TOTAL: ${Math.round(
        performance.now() -
          totalStart,
      )}ms`,
    );

    mapFetcherError(
      error,
    );
  }
}