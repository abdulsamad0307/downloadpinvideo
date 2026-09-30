/** Pinterest page hosts allowed for extraction requests. */
export const PINTEREST_PAGE_HOSTS = new Set([
  "pinterest.com",
  "www.pinterest.com",
  "pin.it",
]);

/** Country / regional Pinterest subdomains, e.g. uk.pinterest.com */
const PINTEREST_SUBDOMAIN_PATTERN =
  /^[a-z]{2}(?:-[a-z]{2})?\.pinterest\.com$/i;

export function isPinterestPageHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  if (PINTEREST_PAGE_HOSTS.has(host)) {
    return true;
  }

  if (PINTEREST_SUBDOMAIN_PATTERN.test(host)) {
    return true;
  }

  return false;
}

/** Pinterest CDN hosts for extracted media download/proxy. */
const PINTEREST_MEDIA_HOSTS = new Set([
  "pinimg.com",
  "pinterest.com",
  "pin.it",
]);

const PINTEREST_MEDIA_SUBDOMAIN_PATTERN =
  /^[a-z0-9-]+\.(pinimg\.com|pinterest\.com)$/i;

export function isPinterestMediaHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  if (PINTEREST_MEDIA_HOSTS.has(host)) {
    return true;
  }

  if (PINTEREST_MEDIA_SUBDOMAIN_PATTERN.test(host)) {
    return true;
  }

  return isPinterestPageHostname(host);
}

export function getPinterestHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}
