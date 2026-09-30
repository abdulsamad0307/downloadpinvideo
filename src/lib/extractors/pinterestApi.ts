import type {
  MediaVariant,
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  attachDownloadTokens,
  registerPreparedVideo,
  variantId,
} from "@/lib/media/tokenStore";

import {
  assertSafePinterestMediaUrl,
  assertSafePinterestPageUrl,
} from "@/lib/security/ssrf";

import {
  fetchWithTimeout,
} from "@/lib/http/fetchWithTimeout";

const PINTEREST_API_TIMEOUT_MS =
  8_000;

const API_HEADERS = {
  Accept:
    "application/json, text/javascript, */*; q=0.01",

  "X-Pinterest-PWS-Handler":
    "www/[username].js",

  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function extractPinId(
  url: string,
): string | null {
  try {
    const parsed =
      new URL(
        url,
      );

    const match =
      parsed.pathname.match(
        /\/pin\/(?:[\w-]+--)?(\d+)/i,
      );

    return (
      match?.[1] ??
      null
    );
  } catch {
    return null;
  }
}

function getString(
  value: unknown,
): string | undefined {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
    ? value
    : undefined;
}

function getNumber(
  value: unknown,
): number | undefined {
  return (
    typeof value === "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : undefined;
}

function findThumbnail(
  data: Record<string, unknown>,
): string | undefined {
  const images =
    data.images;

  if (
    !isRecord(
      images,
    )
  ) {
    return undefined;
  }

  const preferredKeys = [
    "orig",
    "originals",
    "736x",
    "600x",
    "564x",
    "474x",
    "236x",
  ];

  for (
    const key of
      preferredKeys
  ) {
    const image =
      images[key];

    if (
      isRecord(
        image,
      ) &&
      typeof image.url ===
        "string"
    ) {
      return image.url;
    }
  }

  for (
    const image of
      Object.values(
        images,
      )
  ) {
    if (
      isRecord(
        image,
      ) &&
      typeof image.url ===
        "string"
    ) {
      return image.url;
    }
  }

  return undefined;
}

function getImageFormat(
  url: string,
): string {
  try {
    const pathname =
      new URL(
        url,
      )
        .pathname
        .toLowerCase();

    if (
      pathname.endsWith(
        ".png",
      )
    ) {
      return "PNG";
    }

    if (
      pathname.endsWith(
        ".webp",
      )
    ) {
      return "WEBP";
    }

    if (
      pathname.endsWith(
        ".gif",
      )
    ) {
      return "GIF";
    }

    return "JPG";
  } catch {
    return "JPG";
  }
}

function buildBestImageVariant(
  data: Record<string, unknown>,
): MediaVariant | undefined {
  const images =
    data.images;

  if (
    !isRecord(
      images,
    )
  ) {
    return undefined;
  }

  const candidates: {
    url: string;
    width?: number;
    height?: number;
    score: number;
  }[] = [];

  for (
    const rawImage of
      Object.values(
        images,
      )
  ) {
    if (
      !isRecord(
        rawImage,
      )
    ) {
      continue;
    }

    const url =
      getString(
        rawImage.url,
      );

    if (!url) {
      continue;
    }

    try {
      assertSafePinterestMediaUrl(
        url,
      );
    } catch {
      continue;
    }

    const width =
      getNumber(
        rawImage.width,
      );

    const height =
      getNumber(
        rawImage.height,
      );

    const score =
      (width ?? 0) *
      (height ?? 0);

    candidates.push({
      url,
      width,
      height,
      score,
    });
  }

  if (
    candidates.length === 0
  ) {
    return undefined;
  }

  candidates.sort(
    (a, b) =>
      b.score -
      a.score,
  );

  const best =
    candidates[0];

  const quality =
    best.width &&
    best.height
      ? `${best.width}×${best.height}`
      : "Original";

  return {
    id:
      variantId(
        best.url,
        quality,
      ),

    url:
      best.url,

    format:
      getImageFormat(
        best.url,
      ),

    quality,

    width:
      best.width,

    height:
      best.height,
  };
}

function collectVideoLists(
  node: unknown,
  output:
    Record<string, unknown>[],
): void {
  if (
    Array.isArray(
      node,
    )
  ) {
    for (
      const value of
        node
    ) {
      collectVideoLists(
        value,
        output,
      );
    }

    return;
  }

  if (
    !isRecord(
      node,
    )
  ) {
    return;
  }

  if (
    isRecord(
      node.video_list,
    )
  ) {
    output.push(
      node.video_list,
    );
  }

  for (
    const value of
      Object.values(
        node,
      )
  ) {
    if (
      isRecord(
        value,
      ) ||
      Array.isArray(
        value,
      )
    ) {
      collectVideoLists(
        value,
        output,
      );
    }
  }
}

function buildDirectVariants(
  videoLists:
    Record<string, unknown>[],
): {
  direct: MediaVariant[];
  hls: MediaVariant[];
} {
  const direct:
    MediaVariant[] = [];

  const hls:
    MediaVariant[] = [];

  const seenUrls =
    new Set<string>();

  /**
   * Same Pinterest Pin can expose
   * several URLs for the exact same
   * resolution.
   *
   * Keep one result per resolution.
   */
  const seenDirectQualities =
    new Set<string>();

  const seenHlsQualities =
    new Set<string>();

  for (
    const videoList of
      videoLists
  ) {
    for (
      const [
        formatId,
        rawEntry,
      ] of
        Object.entries(
          videoList,
        )
    ) {
      if (
        !isRecord(
          rawEntry,
        )
      ) {
        continue;
      }

      const url =
        getString(
          rawEntry.url,
        );

      if (
        !url ||
        seenUrls.has(
          url,
        )
      ) {
        continue;
      }

      try {
        assertSafePinterestMediaUrl(
          url,
        );
      } catch {
        continue;
      }

      seenUrls.add(
        url,
      );

      const width =
        getNumber(
          rawEntry.width,
        );

      const height =
        getNumber(
          rawEntry.height,
        );

      const quality =
        height &&
        height > 0
          ? `${height}p`
          : formatId;

      const isHls =
        url.includes(
          ".m3u8",
        ) ||
        formatId
          .toLowerCase()
          .includes(
            "hls",
          );

      const resolutionKey =
        `${width ?? 0}x${height ?? 0}:${quality}`;

      if (isHls) {
        if (
          seenHlsQualities.has(
            resolutionKey,
          )
        ) {
          continue;
        }

        seenHlsQualities.add(
          resolutionKey,
        );
      } else {
        if (
          seenDirectQualities.has(
            resolutionKey,
          )
        ) {
          continue;
        }

        seenDirectQualities.add(
          resolutionKey,
        );
      }

      const variant:
        MediaVariant = {
          id:
            variantId(
              url,
              quality,
            ),

          url,

          format:
            isHls
              ? "HLS"
              : "MP4",

          quality,

          width,

          height,
        };

      if (isHls) {
        hls.push(
          variant,
        );
      } else {
        direct.push(
          variant,
        );
      }
    }
  }

  return {
    direct,
    hls,
  };
}

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
    (a, b) => {
      const aWidth =
        a.width ?? 0;

      const aHeight =
        a.height ?? 0;

      const bWidth =
        b.width ?? 0;

      const bHeight =
        b.height ?? 0;

      const aPixels =
        aWidth *
        aHeight;

      const bPixels =
        bWidth *
        bHeight;

      if (
        bPixels !==
        aPixels
      ) {
        return (
          bPixels -
          aPixels
        );
      }

      if (
        bHeight !==
        aHeight
      ) {
        return (
          bHeight -
          aHeight
        );
      }

      return (
        bWidth -
        aWidth
      );
    },
  )[0];
}

export async function extractPinterestVideoViaApi(
  resolvedUrl: string,
): Promise<PinterestMediaResult | null> {
  assertSafePinterestPageUrl(
    resolvedUrl,
  );

  const pinId =
    extractPinId(
      resolvedUrl,
    );

  if (!pinId) {
    return null;
  }

  try {
    const endpoint =
      new URL(
        "https://www.pinterest.com/resource/PinResource/get/",
      );

    endpoint.searchParams.set(
      "data",
      JSON.stringify({
        options: {
          field_set_key:
            "unauth_react_main_pin",

          id:
            pinId,
        },
      }),
    );

    const response =
      await fetchWithTimeout(
        endpoint.toString(),
        {
          timeoutMs:
            PINTEREST_API_TIMEOUT_MS,

          headers:
            API_HEADERS,

          redirect:
            "follow",
        },
      );

    if (
      !response.ok
    ) {
      return null;
    }

    const payload:
      unknown =
        await response.json();

    if (
      !isRecord(
        payload,
      )
    ) {
      return null;
    }

    const resourceResponse =
      payload.resource_response;

    if (
      !isRecord(
        resourceResponse,
      )
    ) {
      return null;
    }

    const data =
      resourceResponse.data;

    if (
      !isRecord(
        data,
      )
    ) {
      return null;
    }

    const title =
      getString(
        data.title,
      ) ??
      getString(
        data.grid_title,
      ) ??
      `Pinterest Pin #${pinId}`;

    const thumbnail =
      findThumbnail(
        data,
      );

    const videoLists:
      Record<
        string,
        unknown
      >[] = [];

    collectVideoLists(
      data,
      videoLists,
    );

    const {
      direct,
      hls,
    } =
      buildDirectVariants(
        videoLists,
      );

    /**
     * BEST VIDEO SELECTION
     *
     * Direct MP4 is preferred only when
     * its quality is equal to or better
     * than the best HLS quality.
     *
     * If HLS offers higher resolution,
     * choose HLS so quality is never
     * sacrificed just for speed.
     */
    const bestDirect =
      bestVariant(
        direct,
      );

    const bestHls =
      bestVariant(
        hls,
      );

    const directPixels =
      (bestDirect?.width ?? 0) *
      (bestDirect?.height ?? 0);

    const hlsPixels =
      (bestHls?.width ?? 0) *
      (bestHls?.height ?? 0);

    /**
     * FAST DIRECT MP4 PATH
     *
     * Use direct MP4 whenever its
     * resolution is equal to or better
     * than HLS.
     *
     * Direct MP4 is tokenized through
     * /api/media.
     *
     * /api/media streams Pinterest bytes
     * without transcoding or recompression.
     */
    if (
      bestDirect &&
      (
        !bestHls ||
        directPixels >=
          hlsPixels
      )
    ) {
      const sortedDirect =
        [
          ...direct,
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
        );

      console.log(
        "[Download Pin Video QUALITY]",
        {
          direct:
            bestDirect
              ? `${bestDirect.width ?? 0}x${bestDirect.height ?? 0}`
              : "none",

          hls:
            bestHls
              ? `${bestHls.width ?? 0}x${bestHls.height ?? 0}`
              : "none",

          selected:
            "DIRECT",
        },
      );

      const result:
        PinterestMediaResult =
        {
          sourceUrl:
            resolvedUrl,

          type:
            "video",

          title,

          thumbnail,

          variants:
            sortedDirect,
        };

      /**
       * Stable direct-video path.
       *
       * Raw pinimg.com links cannot reliably
       * force a browser download and direct
       * JavaScript fetch is blocked by CORS.
       *
       * Tokenized /api/media keeps the
       * download same-origin while preserving
       * the exact Pinterest MP4 bytes.
       */
      return await attachDownloadTokens(
        result,
      );
    }

    /**
     * BEST-QUALITY HLS PATH
     *
     * Use HLS only when it provides
     * genuinely higher resolution than
     * the best direct MP4.
     *
     * Existing yt-dlp prepared-video
     * fallback remains unchanged.
     */
    if (bestHls) {
      console.log(
        "[Download Pin Video QUALITY]",
        {
          direct:
            bestDirect
              ? `${bestDirect.width ?? 0}x${bestDirect.height ?? 0}`
              : "none",

          hls:
            `${bestHls.width ?? 0}x${bestHls.height ?? 0}`,

          selected:
            "HLS",
        },
      );

      const token =
        await registerPreparedVideo(
          bestHls.url,
        );

      const quality =
        bestHls.width &&
        bestHls.height
          ? `${bestHls.width}×${bestHls.height}`
          : bestHls.height &&
              bestHls.height > 0
            ? `${bestHls.height}p`
            : "Best";

      return {
        sourceUrl:
          resolvedUrl,

        type:
          "video",

        title,

        thumbnail,

        variants: [
          {
            id:
              variantId(
                bestHls.url,
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
     * SAFETY FALLBACK
     *
     * If direct MP4 exists but metadata
     * is incomplete and there is no
     * usable HLS result, still return
     * the direct video through /api/media.
     */
    if (bestDirect) {
      const result:
        PinterestMediaResult =
        {
          sourceUrl:
            resolvedUrl,

          type:
            "video",

          title,

          thumbnail,

          variants:
            direct,
        };

      return await attachDownloadTokens(
        result,
      );
    }

    /**
     * IMAGE-ONLY PIN FALLBACK
     */
    const imageVariant =
      buildBestImageVariant(
        data,
      );

    if (!imageVariant) {
      return null;
    }

    const imageResult:
      PinterestMediaResult =
      {
        sourceUrl:
          resolvedUrl,

        type:
          "image",

        title:
          title ===
          `Pinterest Pin #${pinId}`
            ? `Pinterest image #${pinId}`
            : title,

        thumbnail:
          imageVariant.url,

        variants: [
          imageVariant,
        ],
      };

    return await attachDownloadTokens(
      imageResult,
    );
  } catch (error) {
    console.warn(
      "[Download Pin Video Pinterest API fast-path failed]",
      error,
    );

    return null;
  }
}