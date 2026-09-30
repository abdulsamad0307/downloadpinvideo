type LogCategory =
  | "request_start"
  | "hostname"
  | "extraction_success"
  | "extraction_failure"
  | "duration";

interface LogPayload {
  category: LogCategory;
  message: string;
  durationMs?: number;
  hostname?: string;
  errorCode?: string;
}

export function devLog(payload: LogPayload): void {
  if (process.env.NODE_ENV === "production") {
    // Conservative production logging — only failures without sensitive data
    if (payload.category === "extraction_failure") {
      console.warn(
        `[Download Pin Video] extraction_failure code=${payload.errorCode ?? "unknown"}`,
      );
    }

    return;
  }

  const parts = [
    `[Download Pin Video] ${payload.category}`,
    payload.hostname ? `host=${payload.hostname}` : "",
    payload.durationMs !== undefined
      ? `duration=${payload.durationMs}ms`
      : "",
    payload.errorCode ? `code=${payload.errorCode}` : "",
    payload.message,
  ].filter(Boolean);

  console.info(parts.join(" | "));
}

export function logRequestStart(urlHostname: string): void {
  devLog({
    category: "request_start",
    message: "download request",
    hostname: urlHostname,
  });
}

export function logExtractionMethod(
  method: "html" | "ytdlp",
  mediaType: "video" | "image" | "gif",
): void {
  devLog({
    category: "extraction_success",
    message: `extracted via ${method}`,
    hostname: mediaType,
  });
}

export function logExtractionResult(
  hostname: string,
  success: boolean,
  durationMs: number,
  errorCode?: string,
): void {
  devLog({
    category: success
      ? "extraction_success"
      : "extraction_failure",
    message: success
      ? "media extracted"
      : "extraction failed",
    hostname,
    durationMs,
    errorCode,
  });
}