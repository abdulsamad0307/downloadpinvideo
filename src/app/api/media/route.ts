import { NextResponse } from "next/server";

import {
  resolveMediaToken,
} from "@/lib/media/tokenStore";

import {
  assertSafePinterestMediaUrl,
} from "@/lib/security/ssrf";

import {
  FetchTimeoutError,
} from "@/lib/http/fetchWithTimeout";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const MEDIA_PROXY_TIMEOUT_MS =
  60_000;

/**
 * Resolve response content type.
 *
 * MP4 deliberately stays generic binary.
 * This does NOT modify or convert the video.
 * Only the HTTP response MIME is changed.
 */
function resolveProxyContentType(
  format?: string,
  upstreamType?: string | null,
): string {
  if (
    format?.toUpperCase() === "MP4"
  ) {
    return "application/x-download-pin-video-binary";
  }

  switch (
    format?.toUpperCase()
  ) {
    case "GIF":
      return "image/gif";

    case "JPEG":
    case "JPG":
      return "image/jpeg";

    case "PNG":
      return "image/png";

    case "WEBP":
      return "image/webp";

    default:
      break;
  }

  if (upstreamType) {
    return (
      upstreamType
        .split(";")[0]
        ?.trim() ||
      "application/octet-stream"
    );
  }

  return "application/octet-stream";
}

/**
 * Check whether current media is MP4.
 */
function isVideoFormat(
  format?: string,
): boolean {
  return (
    format?.toUpperCase() ===
    "MP4"
  );
}

/**
 * Filename for non-video media.
 *
 * MP4 does not receive Content-Disposition
 * from this API route.
 */
function resolveProxyFilename(
  format?: string,
): string {
  switch (
    format?.toUpperCase()
  ) {
    case "GIF":
      return "pinterest-image.gif";

    case "JPEG":
    case "JPG":
      return "pinterest-image.jpg";

    case "PNG":
      return "pinterest-image.png";

    case "WEBP":
      return "pinterest-image.webp";

    default:
      return "pinterest-download.bin";
  }
}

/**
 * Build headers returned to browser.
 *
 * Important:
 * Content-Length
 * Content-Range
 * Accept-Ranges
 *
 * are preserved from Pinterest CDN
 * whenever available.
 */
function buildProxyHeaders(
  format: string | undefined,
  upstream: Response,
): Headers {
  const headers =
    new Headers();

  headers.set(
    "Content-Type",
    resolveProxyContentType(
      format,
      upstream.headers.get(
        "content-type",
      ),
    ),
  );

  /**
   * Images / GIFs stay normal attachments.
   *
   * MP4 intentionally has no
   * Content-Disposition.
   *
   * Client-side anchor controls the
   * video filename.
   */
  if (
    !isVideoFormat(format)
  ) {
    headers.set(
      "Content-Disposition",
      `attachment; filename="${resolveProxyFilename(
        format,
      )}"`,
    );
  }

  headers.set(
    "Cache-Control",
    "private, no-store, max-age=0",
  );

  headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  /**
   * Preserve original file/chunk length.
   *
   * This is metadata only.
   * Video bytes remain unchanged.
   */
  const contentLength =
    upstream.headers.get(
      "content-length",
    );

  if (contentLength) {
    headers.set(
      "Content-Length",
      contentLength,
    );
  }

  /**
   * Enable browser Range support.
   *
   * This allows normal HTTP byte-range
   * behavior for direct MP4 downloads.
   */
  const acceptRanges =
    upstream.headers.get(
      "accept-ranges",
    );

  if (acceptRanges) {
    headers.set(
      "Accept-Ranges",
      acceptRanges,
    );
  } else if (
    isVideoFormat(format)
  ) {
    /**
     * Our proxy understands and forwards
     * Range requests for direct MP4.
     */
    headers.set(
      "Accept-Ranges",
      "bytes",
    );
  }

  /**
   * Required for 206 Partial Content.
   */
  const contentRange =
    upstream.headers.get(
      "content-range",
    );

  if (contentRange) {
    headers.set(
      "Content-Range",
      contentRange,
    );
  }

  /**
   * Useful CDN metadata when available.
   */
  const lastModified =
    upstream.headers.get(
      "last-modified",
    );

  if (lastModified) {
    headers.set(
      "Last-Modified",
      lastModified,
    );
  }

  const etag =
    upstream.headers.get(
      "etag",
    );

  if (etag) {
    headers.set(
      "ETag",
      etag,
    );
  }

  return headers;
}

/**
 * GET /api/media?token=...
 *
 * Direct Pinterest media streaming proxy.
 *
 * Important:
 * - no transcoding
 * - no FFmpeg
 * - no yt-dlp
 * - no arrayBuffer
 * - no video recompression
 *
 * Pinterest CDN bytes are forwarded
 * directly to the browser.
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
          "Missing token",
      },
      {
        status:
          400,
      },
    );
  }

  /**
   * Resolve short-lived internal token.
   */
  const entry =
    await resolveMediaToken(
      token,
    );

  if (!entry) {
    return NextResponse.json(
      {
        error:
          "Invalid or expired token",
      },
      {
        status:
          404,
      },
    );
  }

  try {
    /**
     * SSRF protection before request.
     */
    assertSafePinterestMediaUrl(
      entry.mediaUrl,
    );

    const videoRequest =
      isVideoFormat(
        entry.format,
      );

    /**
     * Browser may request only part
     * of the video:
     *
     * Range: bytes=...
     *
     * Forward it directly to Pinterest CDN.
     */
    const rangeHeader =
      request.headers.get(
        "range",
      );

    /**
     * Browser-like request headers
     * for Pinterest media CDN.
     */
    const upstreamHeaders:
      Record<string, string> = {
        Accept:
          videoRequest
            ? "video/avc,video/mp4,video/*;q=0.9,*/*;q=0.8"
            : "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",

        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",

        "Accept-Language":
          "en-US,en;q=0.9",

        Referer:
          "https://www.pinterest.com/",
      };

    /**
     * FAST MP4 RANGE PATH
     *
     * Previously Range requests were
     * deliberately blocked for videos.
     *
     * Now they are forwarded unchanged.
     */
    if (rangeHeader) {
      upstreamHeaders.Range =
        rangeHeader;
    }

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () => {
          controller.abort();
        },
        MEDIA_PROXY_TIMEOUT_MS,
      );

    let upstream: Response;

    try {
      /**
       * Important:
       *
       * fetch() gives us Pinterest's
       * response stream.
       *
       * We do NOT load the entire video
       * into server memory.
       */
      upstream =
        await fetch(
          entry.mediaUrl,
          {
            method:
              "GET",

            headers:
              upstreamHeaders,

            redirect:
              "follow",

            signal:
              controller.signal,

            cache:
              "no-store",
          },
        );
    } finally {
      clearTimeout(
        timeoutId,
      );
    }

    /**
     * Validate final Pinterest CDN URL
     * after any redirects.
     */
    assertSafePinterestMediaUrl(
      upstream.url,
    );

    /**
     * Allow both:
     *
     * 200 OK
     * 206 Partial Content
     */
    if (
      !upstream.ok &&
      upstream.status !== 206
    ) {
      return NextResponse.json(
        {
          error:
            "Media unavailable",
        },
        {
          status:
            upstream.status ===
            404
              ? 404
              : 502,
        },
      );
    }

    if (!upstream.body) {
      return NextResponse.json(
        {
          error:
            "Media unavailable",
        },
        {
          status:
            502,
        },
      );
    }

    /**
     * DIRECT BYTE STREAM
     *
     * Pinterest CDN
     *      ↓
     * /api/media
     *      ↓
     * Browser
     *
     * No decoding.
     * No encoding.
     * No compression.
     * No quality modification.
     */
    return new NextResponse(
      upstream.body,
      {
        /**
         * Preserve Pinterest's real HTTP
         * status.
         *
         * 200 = normal response
         * 206 = byte-range response
         */
        status:
          upstream.status,

        headers:
          buildProxyHeaders(
            entry.format,
            upstream,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
        FetchTimeoutError ||
      (
        error instanceof Error &&
        error.name ===
          "AbortError"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Media request timed out",
        },
        {
          status:
            504,
        },
      );
    }

    console.error(
      "[Download Pin Video media proxy error]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to fetch media",
      },
      {
        status:
          502,
      },
    );
  }
}