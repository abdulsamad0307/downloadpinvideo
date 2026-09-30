import type { MediaVariant, PinterestMediaResult } from "@/lib/media/types";

export function extractPinId(sourceUrl: string): string {
  const match = sourceUrl.match(/\/pin\/(\d+)/);

  return match?.[1] ?? "download";
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes <= 0) {
    return "Size unavailable";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatQualityLabel(variant: MediaVariant): string {
  if (variant.quality) {
    return variant.quality;
  }

  if (variant.height) {
    return `${variant.height}p`;
  }

  if (variant.width && variant.height) {
    return `${variant.width}×${variant.height}`;
  }

  return "Original";
}

export function sortVariantsByQuality(
  variants: MediaVariant[],
): MediaVariant[] {
  return [...variants].sort((a, b) => {
    const heightA =
      a.height ?? parseHeightFromQuality(a.quality) ?? 0;

    const heightB =
      b.height ?? parseHeightFromQuality(b.quality) ?? 0;

    return heightB - heightA;
  });
}

function parseHeightFromQuality(
  quality?: string,
): number | null {
  if (!quality) {
    return null;
  }

  const match =
    quality.match(/(\d{3,4})p/i);

  return match
    ? Number(match[1])
    : null;
}

export function buildDownloadFilename(
  result: PinterestMediaResult,
  variant: MediaVariant,
): string {
  const pinId =
    extractPinId(result.sourceUrl);

  const quality =
    formatQualityLabel(variant)
      .toLowerCase()
      .replace(/[^\w]+/g, "");

  switch (result.type) {
    case "gif":
      return `download-pin-video-${quality}-${pinId}.gif`;

    case "image":
      return `download-pin-video-${quality}-${pinId}.jpg`;

    default:
      return `download-pin-video-${quality}-${pinId}.mp4`;
  }
}

export function downloadButtonLabel(): string {
  return "Download";
}

export function formatLabel(
  type: PinterestMediaResult["type"],
): string {
  switch (type) {
    case "gif":
      return "GIF";

    case "image":
      return variantImageFormat();

    default:
      return "MP4";
  }
}

function variantImageFormat(): string {
  return "Image";
}

export function variantFormatLabel(
  type: PinterestMediaResult["type"],
  variant: MediaVariant,
): string {
  if (type === "video") {
    return "MP4";
  }

  if (variant.format) {
    return variant.format;
  }

  return formatLabel(type);
}