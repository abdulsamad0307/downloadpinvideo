import { NextResponse } from "next/server";

import {
  assertSafePinterestMediaUrl,
} from "@/lib/security/ssrf";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const COVER_TIMEOUT_MS = 30_000;

export async function GET(
  request: Request,
) {
  const { searchParams } =
    new URL(request.url);

  const url =
    searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      {
        error: "Missing cover URL",
      },
      {
        status: 400,
      },
    );
  }

  try {
    assertSafePinterestMediaUrl(
      url,
    );

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(
        () => {
          controller.abort();
        },
        COVER_TIMEOUT_MS,
      );

    let upstream: Response;

    try {
      upstream = await fetch(
        url,
        {
          method: "GET",
          redirect: "follow",
          headers: {
            Accept:
              "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
            "User-Agent":
              "DownloadPinVideo/1.0 (+https://downloadpinvideo.com; Pinterest cover downloader)",
          },
          signal:
            controller.signal,
        },
      );
    } finally {
      clearTimeout(
        timeoutId,
      );
    }

    /**
     * Verify final URL after redirects too.
     */
    assertSafePinterestMediaUrl(
      upstream.url,
    );

    if (
      !upstream.ok ||
      !upstream.body
    ) {
      return NextResponse.json(
        {
          error:
            "Cover unavailable",
        },
        {
          status: 502,
        },
      );
    }

    const contentType =
      upstream.headers.get(
        "content-type",
      ) ??
      "image/jpeg";

    /**
     * Only allow actual images.
     */
    if (
      !contentType
        .toLowerCase()
        .startsWith("image/")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid cover file",
        },
        {
          status: 422,
        },
      );
    }

    const headers =
      new Headers();

    headers.set(
      "Content-Type",
      contentType,
    );

    headers.set(
      "Cache-Control",
      "private, no-store, max-age=0",
    );

    headers.set(
      "X-Content-Type-Options",
      "nosniff",
    );

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

    return new Response(
      upstream.body,
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      return NextResponse.json(
        {
          error:
            "Cover request timed out",
        },
        {
          status: 504,
        },
      );
    }

    console.error(
      "[Download Pin Video cover error]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to download cover",
      },
      {
        status: 502,
      },
    );
  }
}