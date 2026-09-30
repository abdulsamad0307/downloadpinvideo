import type { MediaVariant } from "@/lib/media/types";

import { isPinterestMediaHostname } from "@/lib/url/pinterestHosts";

import {
  dedupeVariants,
  inferFormatFromUrl,
  qualityLabelFromKey,
  variantId,
} from "@/lib/media/tokenStore";

const EMBEDDED_SCRIPT_IDS = [
  "__PWS_INITIAL_PROPS__",
  "__PWS_DATA__",
  "__INITIAL_STATE__",
] as const;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function extractMetaContent(
  html: string,
  property: string,
): string | undefined {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(
        match[1].trim(),
      );
    }
  }

  return undefined;
}

function decodeHtmlEntities(
  value: string,
): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractScriptJsonById(
  html: string,
  id: string,
): unknown | null {
  const match = html.match(
    new RegExp(
      `<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`,
      "i",
    ),
  );

  if (!match?.[1]) {
    return null;
  }

  try {
    return JSON.parse(
      match[1],
    );
  } catch {
    return null;
  }
}

function extractEmbeddedJsonPayloads(
  html: string,
): unknown[] {
  const payloads: unknown[] = [];

  for (
    const id of
      EMBEDDED_SCRIPT_IDS
  ) {
    const json =
      extractScriptJsonById(
        html,
        id,
      );

    if (json) {
      payloads.push(
        json,
      );
    }
  }

  return payloads;
}

function isAllowedMediaUrl(
  url: string,
): boolean {
  if (
    !url ||
    url.includes(".m3u8")
  ) {
    return false;
  }

  try {
    const hostname =
      new URL(
        url,
      ).hostname.toLowerCase();

    return isPinterestMediaHostname(
      hostname,
    );
  } catch {
    return false;
  }
}

function isAllowedHlsUrl(
  url: string,
): boolean {
  if (
    !url ||
    !url.includes(".m3u8")
  ) {
    return false;
  }

  try {
    const hostname =
      new URL(
        url,
      ).hostname.toLowerCase();

    return isPinterestMediaHostname(
      hostname,
    );
  } catch {
    return false;
  }
}

function addVariant(
  variants: MediaVariant[],
  url: string,
  options: {
    quality?: string;
    format?: string;
    width?: number;
    height?: number;
  } = {},
): void {
  if (
    !isAllowedMediaUrl(
      url,
    )
  ) {
    return;
  }

  variants.push({
    id: variantId(
      url,
      options.quality,
    ),
    url,
    quality:
      options.quality,
    format:
      options.format ??
      inferFormatFromUrl(url),
    width:
      options.width,
    height:
      options.height,
  });
}

function addHlsVariant(
  variants: MediaVariant[],
  url: string,
  options: {
    quality?: string;
    width?: number;
    height?: number;
  } = {},
): void {
  if (
    !isAllowedHlsUrl(
      url,
    )
  ) {
    return;
  }

  variants.push({
    id: variantId(
      url,
      options.quality,
    ),
    url,
    quality:
      options.quality,
    format:
      "HLS",
    width:
      options.width,
    height:
      options.height,
  });
}

function extractUrlFromVideoEntry(
  value: unknown,
): string | undefined {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  if (
    !isRecord(value)
  ) {
    return undefined;
  }

  if (
    typeof value.url ===
    "string"
  ) {
    return value.url;
  }

  if (
    typeof value.src ===
    "string"
  ) {
    return value.src;
  }

  return undefined;
}

function collectFromVideoList(
  videoList:
    Record<string, unknown>,

  variants:
    MediaVariant[],

  hlsVariants:
    MediaVariant[],
): void {
  for (
    const [key, value]
    of Object.entries(
      videoList,
    )
  ) {
    const url =
      extractUrlFromVideoEntry(
        value,
      );

    if (!url) {
      continue;
    }

    const meta =
      isRecord(value)
        ? value
        : {};

    const quality =
      qualityLabelFromKey(
        key,
      );

    const width =
      typeof meta.width ===
      "number"
        ? meta.width
        : undefined;

    const height =
      typeof meta.height ===
      "number"
        ? meta.height
        : undefined;

    if (
      url.includes(".m3u8")
    ) {
      addHlsVariant(
        hlsVariants,
        url,
        {
          quality,
          width,
          height,
        },
      );

      continue;
    }

    addVariant(
      variants,
      url,
      {
        quality,
        format: "MP4",
        width,
        height,
      },
    );
  }
}

function collectStoryPinVideos(
  node: unknown,
  variants:
    MediaVariant[],
  hlsVariants:
    MediaVariant[],
): void {
  if (
    !isRecord(node)
  ) {
    return;
  }

  const storyPinData =
    node.story_pin_data;

  if (
    !isRecord(
      storyPinData,
    )
  ) {
    return;
  }

  const pages =
    storyPinData.pages;

  if (
    !Array.isArray(
      pages,
    )
  ) {
    return;
  }

  for (
    const page of pages
  ) {
    if (
      !isRecord(page)
    ) {
      continue;
    }

    const blocks =
      page.blocks;

    if (
      !Array.isArray(
        blocks,
      )
    ) {
      continue;
    }

    for (
      const block of blocks
    ) {
      if (
        !isRecord(block)
      ) {
        continue;
      }

      for (
        const videoKey of [
          "video",
          "videoV2",
          "videos",
        ]
      ) {
        const videoNode =
          block[videoKey];

        if (
          !isRecord(
            videoNode,
          )
        ) {
          continue;
        }

        if (
          isRecord(
            videoNode.video_list,
          )
        ) {
          collectFromVideoList(
            videoNode.video_list,
            variants,
            hlsVariants,
          );
        }

        const directUrl =
          extractUrlFromVideoEntry(
            videoNode,
          );

        if (
          !directUrl
        ) {
          continue;
        }

        if (
          directUrl.includes(
            ".m3u8",
          )
        ) {
          addHlsVariant(
            hlsVariants,
            directUrl,
            {
              quality:
                "Original",
            },
          );
        } else {
          addVariant(
            variants,
            directUrl,
            {
              format:
                "MP4",
              quality:
                "Original",
            },
          );
        }
      }
    }
  }
}

function collectVideos(
  node: unknown,
  variants:
    MediaVariant[],
  hlsVariants:
    MediaVariant[],
): void {
  if (
    !isRecord(node)
  ) {
    return;
  }

  collectStoryPinVideos(
    node,
    variants,
    hlsVariants,
  );

  if (
    isRecord(node.videos) &&
    isRecord(
      node.videos.video_list,
    )
  ) {
    collectFromVideoList(
      node.videos.video_list,
      variants,
      hlsVariants,
    );
  }

  if (
    isRecord(
      node.video_list,
    )
  ) {
    collectFromVideoList(
      node.video_list,
      variants,
      hlsVariants,
    );
  }

  if (
    typeof node.video_url ===
    "string"
  ) {
    if (
      node.video_url.includes(
        ".m3u8",
      )
    ) {
      addHlsVariant(
        hlsVariants,
        node.video_url,
        {
          quality:
            "Original",
        },
      );
    } else {
      addVariant(
        variants,
        node.video_url,
        {
          format:
            "MP4",
          quality:
            "Original",
        },
      );
    }
  }

  for (
    const value of
      Object.values(node)
  ) {
    if (
      isRecord(value) ||
      Array.isArray(value)
    ) {
      collectVideos(
        value,
        variants,
        hlsVariants,
      );
    }
  }
}

function collectImages(
  node: unknown,
  variants:
    MediaVariant[],
): void {
  if (
    !isRecord(node)
  ) {
    return;
  }

  if (
    isRecord(
      node.images,
    )
  ) {
    for (
      const [key, value]
      of Object.entries(
        node.images,
      )
    ) {
      if (
        !isRecord(value)
      ) {
        continue;
      }

      const url =
        typeof value.url ===
        "string"
          ? value.url
          : typeof value.original ===
              "string"
            ? value.original
            : undefined;

      if (!url) {
        continue;
      }

      addVariant(
        variants,
        url,
        {
          quality:
            qualityLabelFromKey(
              key,
            ),
          width:
            typeof value.width ===
            "number"
              ? value.width
              : undefined,
          height:
            typeof value.height ===
            "number"
              ? value.height
              : undefined,
        },
      );
    }
  }

  if (
    typeof node.image_large_url ===
    "string"
  ) {
    addVariant(
      variants,
      node.image_large_url,
      {
        quality:
          "Large",
      },
    );
  }

  if (
    typeof node.image_medium_url ===
    "string"
  ) {
    addVariant(
      variants,
      node.image_medium_url,
      {
        quality:
          "Medium",
      },
    );
  }

  for (
    const value of
      Object.values(node)
  ) {
    if (
      isRecord(value) ||
      Array.isArray(value)
    ) {
      collectImages(
        value,
        variants,
      );
    }
  }
}

/**
 * Normalize Pinterest URLs embedded
 * directly in raw HTML / JSON text.
 */
function normalizeRawHtmlMediaText(
  html: string,
): string {
  return html
    .replace(
      /\\u002f/gi,
      "/",
    )
    .replace(
      /\\u003a/gi,
      ":",
    )
    .replace(
      /\\u0026/gi,
      "&",
    )
    .replace(
      /\\u003d/gi,
      "=",
    )
    .replace(
      /\\u0025/gi,
      "%",
    )
    .replace(
      /\\\//g,
      "/",
    )
    .replace(
      /&amp;/g,
      "&",
    );
}

/**
 * Find width or height metadata nearest
 * to a raw MP4 URL.
 */
function findNearestNumericField(
  text: string,
  field:
    "width" |
    "height",
  urlIndex: number,
): number | undefined {
  const radius = 1800;

  const start =
    Math.max(
      0,
      urlIndex - radius,
    );

  const end =
    Math.min(
      text.length,
      urlIndex + radius,
    );

  const nearby =
    text.slice(
      start,
      end,
    );

  const urlLocalIndex =
    urlIndex - start;

  const pattern =
    new RegExp(
      `["']?${field}["']?\\s*:\\s*["']?(\\d{2,5})["']?`,
      "gi",
    );

  let bestValue:
    number | undefined;

  let bestDistance =
    Number.POSITIVE_INFINITY;

  for (
    const match of
      nearby.matchAll(
        pattern,
      )
  ) {
    const raw =
      match[1];

    if (!raw) {
      continue;
    }

    const value =
      Number(raw);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      continue;
    }

    const matchIndex =
      match.index ?? 0;

    const distance =
      Math.abs(
        matchIndex -
          urlLocalIndex,
      );

    if (
      distance <
      bestDistance
    ) {
      bestDistance =
        distance;

      bestValue =
        value;
    }
  }

  return bestValue;
}

/**
 * Extract nearby video dimensions.
 */
function extractNearbyVideoDimensions(
  normalizedHtml: string,
  urlIndex: number,
): {
  width?: number;
  height?: number;
} {
  const width =
    findNearestNumericField(
      normalizedHtml,
      "width",
      urlIndex,
    );

  const height =
    findNearestNumericField(
      normalizedHtml,
      "height",
      urlIndex,
    );

  const validWidth =
    width &&
    width >= 100
      ? width
      : undefined;

  const validHeight =
    height &&
    height >= 100
      ? height
      : undefined;

  return {
    width:
      validWidth,
    height:
      validHeight,
  };
}

/**
 * True when this exact media URL has
 * already been collected through structured
 * Pinterest JSON.
 *
 * Quality labels are deliberately ignored.
 *
 * Same URL = same actual media file.
 */
function hasVariantUrl(
  variants:
    MediaVariant[],
  url: string,
): boolean {
  return variants.some(
    (variant) =>
      variant.url === url,
  );
}

/**
 * Recover progressive Pinterest MP4 URLs
 * directly from raw page HTML.
 *
 * This runs as a fallback AFTER structured
 * Pinterest JSON extraction.
 */
function collectRawHtmlMp4Variants(
  html: string,
  variants:
    MediaVariant[],
): void {
  const normalizedHtml =
    normalizeRawHtmlMediaText(
      html,
    );

  const pattern =
    /https?:\/\/(?:[a-z0-9-]+\.)*pinimg\.com\/videos\/[^"'\\\s<>]+?\.mp4(?:\?[^"'\\\s<>]*)?/gi;

  const seen =
    new Set<string>();

  for (
    const match of
      normalizedHtml.matchAll(
        pattern,
      )
  ) {
    let rawUrl =
      match[0];

    if (!rawUrl) {
      continue;
    }

    rawUrl =
      rawUrl.replace(
        /[),;\]}]+$/g,
        "",
      );

    if (
      seen.has(rawUrl)
    ) {
      continue;
    }

    seen.add(rawUrl);

    if (
      !isAllowedMediaUrl(
        rawUrl,
      )
    ) {
      continue;
    }

    /**
     * Critical duplicate guard.
     *
     * If structured video_list already
     * supplied this exact MP4, do not add
     * another copy with a different quality
     * label.
     */
    if (
      hasVariantUrl(
        variants,
        rawUrl,
      )
    ) {
      continue;
    }

    const dimensions =
      extractNearbyVideoDimensions(
        normalizedHtml,
        match.index ?? 0,
      );

    const quality =
      dimensions.height &&
      dimensions.height > 0
        ? `${dimensions.height}p`
        : "Direct";

    addVariant(
      variants,
      rawUrl,
      {
        format:
          "MP4",
        quality,
        width:
          dimensions.width,
        height:
          dimensions.height,
      },
    );
  }
}

function getInitialReduxState(
  payload: unknown,
): Record<
  string,
  unknown
> | null {
  if (
    !isRecord(payload)
  ) {
    return null;
  }

  if (
    isRecord(
      payload.initialReduxState,
    )
  ) {
    return (
      payload.initialReduxState
    );
  }

  if (
    isRecord(payload.props) &&
    isRecord(
      payload.props
        .initialReduxState,
    )
  ) {
    return (
      payload.props
        .initialReduxState
    );
  }

  return null;
}

function collectResourcePins(
  resources:
    Record<string, unknown>,

  candidates:
    Record<string, unknown>[],
): void {
  for (
    const resourceName of [
      "PinResource",
      "StoryPinResource",
      "PinPageResource",
    ]
  ) {
    const bucket =
      resources[
        resourceName
      ];

    if (
      !isRecord(bucket)
    ) {
      continue;
    }

    for (
      const resource of
        Object.values(
          bucket,
        )
    ) {
      if (
        !isRecord(resource)
      ) {
        continue;
      }

      if (
        isRecord(
          resource.data,
        )
      ) {
        candidates.push(
          resource.data,
        );
      }
    }
  }
}

function collectPinCandidates(
  payload: unknown,
): Record<string, unknown>[] {
  const candidates:
    Record<string, unknown>[] =
      [];

  const seen =
    new Set<
      Record<
        string,
        unknown
      >
    >();

  const addCandidate = (
    pin:
      Record<
        string,
        unknown
      >,
  ) => {
    if (
      seen.has(pin)
    ) {
      return;
    }

    seen.add(pin);

    candidates.push(pin);
  };

  const redux =
    getInitialReduxState(
      payload,
    );

  if (redux) {
    if (
      isRecord(
        redux.pins,
      )
    ) {
      for (
        const pin of
          Object.values(
            redux.pins,
          )
      ) {
        if (
          isRecord(pin)
        ) {
          addCandidate(
            pin,
          );
        }
      }
    }

    if (
      isRecord(
        redux.resources,
      )
    ) {
      collectResourcePins(
        redux.resources,
        candidates,
      );
    }
  }

  const queue:
    unknown[] = [
      payload,
    ];

  while (
    queue.length > 0
  ) {
    const current =
      queue.shift();

    if (
      !isRecord(current)
    ) {
      continue;
    }

    const hasVideos =
      isRecord(
        current.videos,
      ) ||
      isRecord(
        current.video_list,
      ) ||
      isRecord(
        current.story_pin_data,
      );

    const hasImages =
      isRecord(
        current.images,
      );

    const hasId =
      typeof current.id ===
        "string" ||
      typeof current.id ===
        "number";

    if (
      (
        hasVideos ||
        hasImages
      ) &&
      hasId
    ) {
      addCandidate(
        current,
      );
    }

    for (
      const value of
        Object.values(
          current,
        )
    ) {
      if (
        isRecord(value)
      ) {
        queue.push(
          value,
        );
      } else if (
        Array.isArray(
          value,
        )
      ) {
        queue.push(
          ...value,
        );
      }
    }
  }

  return candidates;
}

function resolveTitleFromCandidates(
  candidates:
    Record<string, unknown>[],

  fallback?: string,
): string | undefined {
  if (fallback) {
    return fallback;
  }

  for (
    const pin of candidates
  ) {
    if (
      typeof pin.title ===
        "string" &&
      pin.title.trim()
    ) {
      return pin.title;
    }

    if (
      typeof pin.grid_title ===
        "string" &&
      pin.grid_title.trim()
    ) {
      return pin.grid_title;
    }
  }

  return undefined;
}

export interface ParsedPinterestPage {
  title?: string;

  thumbnail?: string;

  videoVariants:
    MediaVariant[];

  hlsVariants:
    MediaVariant[];

  imageVariants:
    MediaVariant[];

  isRestricted:
    boolean;
}

export function parsePinterestHtml(
  html: string,
): ParsedPinterestPage {
  const title =
    extractMetaContent(
      html,
      "og:title",
    );

  const ogVideo =
    extractMetaContent(
      html,
      "og:video",
    ) ??
    extractMetaContent(
      html,
      "og:video:url",
    ) ??
    extractMetaContent(
      html,
      "og:video:secure_url",
    );

  const ogImage =
    extractMetaContent(
      html,
      "og:image",
    );

  const lowerHtml =
    html.toLowerCase();

  const isRestricted =
    lowerHtml.includes(
      "login to continue",
    ) ||
    lowerHtml.includes(
      "this pin is unavailable",
    ) ||
    lowerHtml.includes(
      "page not found",
    ) ||
    lowerHtml.includes(
      "pin not found",
    ) ||
    lowerHtml.includes(
      "this content is unavailable",
    );

  const videoVariants:
    MediaVariant[] = [];

  const hlsVariants:
    MediaVariant[] = [];

  const imageVariants:
    MediaVariant[] = [];

  /**
   * Open Graph video.
   */
  if (ogVideo) {
    if (
      ogVideo.includes(
        ".m3u8",
      )
    ) {
      addHlsVariant(
        hlsVariants,
        ogVideo,
        {
          quality:
            "Original",
        },
      );
    } else {
      addVariant(
        videoVariants,
        ogVideo,
        {
          format:
            "MP4",
          quality:
            "Original",
        },
      );
    }
  }

  /**
   * Open Graph image.
   */
  if (ogImage) {
    addVariant(
      imageVariants,
      ogImage,
      {
        quality:
          "Original",
      },
    );
  }

  /**
   * Structured Pinterest state first.
   */
  const embeddedPayloads =
    extractEmbeddedJsonPayloads(
      html,
    );

  const pinCandidates:
    Record<string, unknown>[] =
      [];

  for (
    const payload of
      embeddedPayloads
  ) {
    pinCandidates.push(
      ...collectPinCandidates(
        payload,
      ),
    );
  }

  if (
    pinCandidates.length ===
      0 &&
    embeddedPayloads.length >
      0
  ) {
    for (
      const payload of
        embeddedPayloads
    ) {
      collectVideos(
        payload,
        videoVariants,
        hlsVariants,
      );

      collectImages(
        payload,
        imageVariants,
      );
    }
  } else {
    for (
      const pin of
        pinCandidates
    ) {
      collectVideos(
        pin,
        videoVariants,
        hlsVariants,
      );

      collectImages(
        pin,
        imageVariants,
      );
    }
  }

  /**
   * Raw HTML MP4 fallback LAST.
   *
   * This is intentionally after structured
   * JSON extraction.
   *
   * Existing structured MP4 URLs are skipped
   * by hasVariantUrl(), while MP4s that the
   * structured parser missed are recovered.
   */
  collectRawHtmlMp4Variants(
    html,
    videoVariants,
  );

  const pinTitle =
    resolveTitleFromCandidates(
      pinCandidates,
      title,
    );

  const thumbnail =
    ogImage ??
    imageVariants[0]?.url ??
    videoVariants[0]?.url;

  return {
    title:
      pinTitle,

    thumbnail,

    videoVariants:
      dedupeVariants(
        videoVariants,
      ),

    hlsVariants:
      dedupeVariants(
        hlsVariants,
      ),

    imageVariants:
      dedupeVariants(
        imageVariants,
      ),

    isRestricted,
  };
}