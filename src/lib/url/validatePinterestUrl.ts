import {
  getPinterestHostname,
  isPinterestPageHostname,
} from "@/lib/url/pinterestHosts";
import { isBlockedHostname, isPrivateOrLocalIp } from "@/lib/security/ssrf";

export interface UrlValidationResult {
  valid: boolean;
  normalized?: string;
  reason?: string;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function hasEmbeddedCredentials(url: URL): boolean {
  return Boolean(url.username || url.password);
}

function isSuspiciousPinterestHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  // Reject lookalikes such as pinterest.com.evil.com or evilpinterest.com
  if (host.includes("pinterest") && !isPinterestPageHostname(host)) {
    return true;
  }

  return false;
}

export function validatePinterestInputUrl(raw: string): UrlValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, reason: "empty" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { valid: false, reason: "unsupported_protocol" };
  }

  if (hasEmbeddedCredentials(parsed)) {
    return { valid: false, reason: "embedded_credentials" };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isBlockedHostname(hostname) || isPrivateOrLocalIp(hostname)) {
    return { valid: false, reason: "blocked_host" };
  }

  if (isSuspiciousPinterestHostname(hostname)) {
    return { valid: false, reason: "invalid_pinterest_host" };
  }

  if (!isPinterestPageHostname(hostname)) {
    return { valid: false, reason: "not_pinterest" };
  }

  // Normalize: drop hash, trim trailing slash on pathname root only
  parsed.hash = "";
  const normalized = parsed.toString();

  return { valid: true, normalized };
}

export function isValidPinterestUrl(raw: string): boolean {
  return validatePinterestInputUrl(raw).valid;
}

export function assertValidPinterestUrl(raw: string): string {
  const result = validatePinterestInputUrl(raw);
  if (!result.valid || !result.normalized) {
    throw new Error(result.reason ?? "invalid");
  }
  return result.normalized;
}

export function describePinterestHostname(raw: string): string {
  return getPinterestHostname(raw) ?? "unknown";
}
