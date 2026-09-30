import { isPinterestPageHostname } from "@/lib/url/pinterestHosts";
import { assertSafeOutboundUrl } from "@/lib/security/ssrf";
import {
  fetchWithTimeout,
  FetchTimeoutError,
} from "@/lib/http/fetchWithTimeout";

const MAX_REDIRECTS = 6;

const PINTEREST_SHORT_REDIRECT_HOSTS = new Set([
  "pin.it",
  "api.pinterest.com",
]);

const DEFAULT_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language":
    "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
};

function isAllowedPinterestRedirectHost(
  hostname: string,
): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/\.$/, "");

  return (
    PINTEREST_SHORT_REDIRECT_HOSTS.has(host) ||
    isPinterestPageHostname(host)
  );
}

export class ShortUrlResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShortUrlResolutionError";
  }
}

export async function resolvePinterestShortUrl(
  url: string,
  timeoutMs = 12_000,
): Promise<string> {
  assertSafeOutboundUrl(url);

  let currentUrl = url;

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const parsed =
      assertSafeOutboundUrl(currentUrl);

    const hostname =
      parsed.hostname
        .toLowerCase()
        .replace(/\.$/, "");

    // Final Pinterest page reached.
    if (
      !PINTEREST_SHORT_REDIRECT_HOSTS.has(
        hostname,
      )
    ) {
      if (
        !isPinterestPageHostname(hostname)
      ) {
        throw new ShortUrlResolutionError(
          "redirect_to_non_pinterest",
        );
      }

      return currentUrl;
    }

    const response =
      await fetchWithTimeout(
        currentUrl,
        {
          method: "GET",
          redirect: "manual",
          timeoutMs,
          headers: DEFAULT_HEADERS,
        },
      );

    if (
      response.status >= 300 &&
      response.status < 400
    ) {
      const location =
        response.headers.get("location");

      if (!location) {
        throw new ShortUrlResolutionError(
          "missing_redirect_location",
        );
      }

      const nextUrl =
        new URL(
          location,
          currentUrl,
        ).toString();

      // SSRF protection on every redirect hop.
      const safeNext =
        assertSafeOutboundUrl(nextUrl);

      const nextHost =
        safeNext.hostname
          .toLowerCase()
          .replace(/\.$/, "");

      if (
        !isAllowedPinterestRedirectHost(
          nextHost,
        )
      ) {
        throw new ShortUrlResolutionError(
          "redirect_to_non_pinterest",
        );
      }

      currentUrl = nextUrl;
      continue;
    }

    if (!response.ok) {
      throw new ShortUrlResolutionError(
        `short_url_fetch_${response.status}`,
      );
    }

    // A shortener URL returning 200 instead of another redirect
    // is not yet a resolved Pinterest Pin page.
    if (
      PINTEREST_SHORT_REDIRECT_HOSTS.has(
        hostname,
      )
    ) {
      throw new ShortUrlResolutionError(
        "short_url_not_resolved",
      );
    }

    return currentUrl;
  }

  throw new ShortUrlResolutionError(
    "too_many_redirects",
  );
}

export { FetchTimeoutError };