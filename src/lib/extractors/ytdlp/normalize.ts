import type { PinterestMediaResult } from "@/lib/media/types";
import { isPinterestMediaHostname } from "@/lib/url/pinterestHosts";
import {
  dedupeVariants,
  inferFormatFromUrl,
  qualityLabelFromKey,
  variantId,
} from "@/lib/media/tokenStore";
import type { YtdlpFormat, YtdlpMetadata } from "@/lib/extractors/ytdlp/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseYtdlpMetadata(json: unknown): YtdlpMetadata {
  if (!isRecord(json)) {
    return {};
  }

  return {
    title: typeof json.title === "string" ? json.title : undefined,
    thumbnail: typeof json.thumbnail === "string" ? json.thumbnail : undefined,
    webpage_url: typeof json.webpage_url === "string" ? json.webpage_url : undefined,
    formats: Array.isArray(json.formats)
      ? (json.formats.filter(isRecord) as YtdlpFormat[])
      : [],
  };
}

function isProgressiveMp4Format(format: YtdlpFormat): boolean {
  if (!format.url) return false;
  if (format.protocol && format.protocol !== "https" && format.protocol !== "http") {
    return false;
  }
  if (format.url.includes(".m3u8")) return false;
  if (format.vcodec === "none") return false;

  try {
    const hostname = new URL(format.url).hostname.toLowerCase();
    if (!isPinterestMediaHostname(hostname)) return false;
  } catch {
    return false;
  }

  const ext = format.ext?.toLowerCase() ?? inferFormatFromUrl(format.url)?.toLowerCase();
  return ext === "mp4" || format.url.toLowerCase().includes(".mp4");
}

function qualityFromFormat(format: YtdlpFormat): string | undefined {
  if (typeof format.height === "number" && format.height > 0) {
    return `${format.height}p`;
  }

  if (format.format_id) {
    return qualityLabelFromKey(format.format_id);
  }

  return format.resolution;
}

export function normalizeYtdlpVideoResult(
  metadata: YtdlpMetadata,
  sourceUrl: string,
): PinterestMediaResult | null {
  const progressiveFormats = (metadata.formats ?? [])
    .filter(isProgressiveMp4Format)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  if (progressiveFormats.length === 0) {
    return null;
  }

  const variants = dedupeVariants(
    progressiveFormats.map((format) => ({
      id: variantId(format.url!, qualityFromFormat(format)),
      url: format.url!,
      format: "MP4",
      quality: qualityFromFormat(format),
      width: format.width,
      height: format.height,
      fileSize: format.filesize ?? format.filesize_approx,
    })),
  );

  if (variants.length === 0) {
    return null;
  }

  return {
    sourceUrl,
    type: "video",
    title: metadata.title,
    thumbnail: metadata.thumbnail,
    variants,
  };
}
