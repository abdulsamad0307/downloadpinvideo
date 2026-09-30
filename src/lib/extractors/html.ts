import { ExtractionError } from "@/lib/api/errors";

import {
  fetchWithTimeout,
  FetchTimeoutError,
} from "@/lib/http/fetchWithTimeout";

import {
  resolvePinterestShortUrl,
  ShortUrlResolutionError,
} from "@/lib/url/resolveShortUrl";

import { assertSafePinterestPageUrl } from "@/lib/security/ssrf";

import {
  parsePinterestHtml,
  type ParsedPinterestPage,
} from "@/lib/extractors/parsePinterestPage";

const FETCH_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

  "Accept-Language":
    "en-US,en;q=0.9",

  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
};

export interface HtmlExtractionResult {
  sourceUrl: string;
  parsed: ParsedPinterestPage;
}

export async function resolvePinterestPageUrl(
  inputUrl: string,
): Promise<string> {
  assertSafePinterestPageUrl(inputUrl);

  const parsedInput =
    new URL(inputUrl);

  const hostname =
    parsedInput.hostname
      .toLowerCase()
      .replace(/\.$/, "");

  if (hostname === "pin.it") {
    const resolved =
      await resolvePinterestShortUrl(
        inputUrl,
      );

    // Final URL must be a safe Pinterest page.
    assertSafePinterestPageUrl(
      resolved,
    );

    return resolved;
  }

  return inputUrl;
}

export async function extractFromHtml(
  resolvedUrl: string,
): Promise<HtmlExtractionResult> {
  // Never make the extraction request before
  // validating the final destination.
  assertSafePinterestPageUrl(
    resolvedUrl,
  );

  const response =
    await fetchWithTimeout(
      resolvedUrl,
      {
        timeoutMs: 12_000,
        headers: FETCH_HEADERS,
        redirect: "follow",
      },
    );

  if (response.status === 404) {
    throw new ExtractionError(
      "MEDIA_NOT_FOUND",
      "Pin not found",
    );
  }

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    throw new ExtractionError(
      "PRIVATE_OR_RESTRICTED",
      "Pin is not publicly accessible",
    );
  }

  if (!response.ok) {
    throw new ExtractionError(
      "EXTRACTION_FAILED",
      `Pinterest returned ${response.status}`,
    );
  }

  const html =
    await response.text();

  console.log(
    "[Download Pin Video HTML DEBUG]",
    {
      length: html.length,

      hasVideoList:
        html.includes(
          "video_list",
        ),

      hasM3u8:
        html.includes(
          ".m3u8",
        ),

      hasMp4:
        html.includes(
          ".mp4",
        ),

      hasPinimgVideo:
        html.includes(
          "pinimg.com/videos",
        ),

      hasStoryPin:
        html.includes(
          "story_pin_data",
        ),

      hasContentUrl:
        html.includes(
          "contentUrl",
        ),
    },
  );

  const parsed =
    parsePinterestHtml(
      html,
    );

  if (parsed.isRestricted) {
    throw new ExtractionError(
      "PRIVATE_OR_RESTRICTED",
      "Pin appears restricted or unavailable",
    );
  }

  return {
    sourceUrl:
      resolvedUrl,

    parsed,
  };
}

export function mapFetcherError(
  error: unknown,
): never {
  if (
    error instanceof
    ExtractionError
  ) {
    throw error;
  }

  if (
    error instanceof
    FetchTimeoutError
  ) {
    throw new ExtractionError(
      "TIMEOUT",
      error.message,
    );
  }

  if (
    error instanceof
    ShortUrlResolutionError
  ) {
    throw new ExtractionError(
      "INVALID_URL",
      error.message,
    );
  }

  if (error instanceof Error) {
    if (
      error.message ===
        "not_pinterest" ||
      error.message ===
        "invalid_pinterest_host" ||
      error.message ===
        "blocked_host"
    ) {
      throw new ExtractionError(
        "INVALID_URL",
        error.message,
      );
    }
  }

  throw new ExtractionError(
    "EXTRACTION_FAILED",
    error instanceof Error
      ? error.message
      : "Unknown extraction error",
  );
}