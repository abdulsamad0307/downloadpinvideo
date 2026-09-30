import {
  isPinterestMediaHostname,
  isPinterestPageHostname,
} from "@/lib/url/pinterestHosts";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function isIpv4(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function isIpv6(hostname: string): boolean {
  return hostname.includes(":");
}

export function isPrivateOrLocalIp(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "0.0.0.0"
  ) {
    return true;
  }

  if (host === "::1" || host === "::") {
    return true;
  }

  // Unique local / link-local IPv6
  if (
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80:")
  ) {
    return true;
  }

  if (!isIpv4(host) && !isIpv6(host)) {
    return false;
  }

  if (isIpv4(host)) {
    const parts = host.split(".").map(Number);
    if (parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [a, b] = parts;
    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
  }

  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (isPrivateOrLocalIp(host)) {
    return true;
  }

  // Metadata / cloud metadata endpoints
  if (host === "metadata.google.internal" || host === "169.254.169.254") {
    return true;
  }

  return false;
}

export function assertSafeOutboundUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("invalid_url");
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error("unsupported_protocol");
  }

  if (parsed.username || parsed.password) {
    throw new Error("embedded_credentials");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isBlockedHostname(hostname)) {
    throw new Error("blocked_host");
  }

  return parsed;
}

export function assertSafePinterestPageUrl(url: string): URL {
  const parsed = assertSafeOutboundUrl(url);

  if (!isPinterestPageHostname(parsed.hostname.toLowerCase())) {
    throw new Error("not_pinterest");
  }

  return parsed;
}

export function assertSafePinterestMediaUrl(url: string): URL {
  const parsed = assertSafeOutboundUrl(url);
  const hostname = parsed.hostname.toLowerCase();

  if (isBlockedHostname(hostname)) {
    throw new Error("blocked_host");
  }

  if (!isPinterestMediaHostname(hostname)) {
    throw new Error("not_pinterest_media");
  }

  return parsed;
}
