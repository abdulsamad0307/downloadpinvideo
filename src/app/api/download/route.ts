import { NextResponse } from "next/server";

import type {
  ApiDownloadResponse,
} from "@/lib/media/types";

import {
  ExtractionError,
  getUserErrorMessage,
} from "@/lib/api/errors";

import {
  extractPinterestMedia,
} from "@/lib/extractors/pinterest";

import {
  describePinterestHostname,
  validatePinterestInputUrl,
} from "@/lib/url/validatePinterestUrl";

import {
  getClientIp,
} from "@/lib/rateLimit/memory";

import {
  downloadRateLimiter,
} from "@/lib/rateLimit/hybrid";

import {
  logExtractionResult,
  logRequestStart,
} from "@/lib/logging/devLogger";

export const runtime = "nodejs";

interface DownloadRequestBody {
  url?: unknown;
  fastMode?: unknown;
}

function errorResponse(
  code: Parameters<
    typeof getUserErrorMessage
  >[0],
  status: number,
  headers?: HeadersInit,
): NextResponse<ApiDownloadResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message:
          getUserErrorMessage(code),
      },
    },
    {
      status,
      headers,
    },
  );
}

export async function POST(
  request: Request,
) {
  const startedAt = Date.now();

  let hostname = "unknown";

  try {
    /**
     * RATE LIMIT
     */
    const ip =
      getClientIp(request);

    const rateLimit =
      await downloadRateLimiter.check(
        ip,
      );

    if (!rateLimit.allowed) {
      const retryAfterSeconds =
        Math.max(
          1,
          Math.ceil(
            (rateLimit.retryAfterMs ??
              60_000) / 1000,
          ),
        );

      return errorResponse(
        "RATE_LIMITED",
        429,
        {
          "Retry-After":
            String(
              retryAfterSeconds,
            ),
          "X-RateLimit-Remaining":
            "0",
        },
      );
    }

    /**
     * REQUEST BODY
     */
    let body:
      DownloadRequestBody;

    try {
      body =
        (await request.json()) as
          DownloadRequestBody;
    } catch {
      return errorResponse(
        "INVALID_URL",
        400,
      );
    }

    if (
      typeof body.url !== "string"
    ) {
      return errorResponse(
        "INVALID_URL",
        400,
      );
    }

    /**
     * EXTENSION FAST MODE
     *
     * Only true when explicitly sent
     * by the extension flow.
     *
     * Homepage requests remain false.
     */
    const fastMode =
      body.fastMode === true;

    /**
     * PINTEREST URL VALIDATION
     */
    const validation =
      validatePinterestInputUrl(
        body.url,
      );

    if (
      !validation.valid ||
      !validation.normalized
    ) {
      return errorResponse(
        "INVALID_URL",
        400,
      );
    }

    hostname =
      describePinterestHostname(
        validation.normalized,
      );

    logRequestStart(
      hostname,
    );

    /**
     * MEDIA EXTRACTION
     */
    const data =
      await extractPinterestMedia(
        validation.normalized,
        {
          fastMode,
        },
      );

    logExtractionResult(
      hostname,
      true,
      Date.now() - startedAt,
    );

    /**
     * SUCCESS
     */
    return NextResponse.json(
      {
        success: true,
        data,
      } satisfies ApiDownloadResponse,
      {
        headers: {
          "X-RateLimit-Remaining":
            String(
              Math.max(
                0,
                rateLimit.remaining ?? 0,
              ),
            ),
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    /**
     * KNOWN APPLICATION ERROR
     */
    if (
      error instanceof
      ExtractionError
    ) {
      logExtractionResult(
        hostname,
        false,
        Date.now() - startedAt,
        error.code,
      );

      const status =
        error.code ===
        "RATE_LIMITED"
          ? 429
          : error.code ===
              "INVALID_URL"
            ? 400
            : error.code ===
                "TIMEOUT"
              ? 504
              : 422;

      return errorResponse(
        error.code,
        status,
      );
    }

    /**
     * UNKNOWN SERVER ERROR
     */
    logExtractionResult(
      hostname,
      false,
      Date.now() - startedAt,
      "SERVER_ERROR",
    );

    console.error(
      "[Download Pin Video download API error]",
      error,
    );

    return errorResponse(
      "SERVER_ERROR",
      500,
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "SERVER_ERROR",
        message:
          "Method not allowed",
      },
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    },
  );
}