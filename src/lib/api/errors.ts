import type { ApiErrorCode } from "@/lib/media/types";

export const USER_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_URL:
    "This doesn't look like a valid Pinterest link. Copy the link from Pinterest and try again.",

  PRIVATE_OR_RESTRICTED:
    "This Pin isn't publicly accessible. Download Pin Video can only process public Pinterest content.",

  MEDIA_NOT_FOUND:
    "We couldn't find downloadable media on this Pin.",

  UNSUPPORTED_MEDIA:
    "This Pin contains media that Download Pin Video cannot process yet.",

  EXTRACTION_FAILED:
    "We couldn't process this Pin right now. Please try another public Pinterest link.",

  TIMEOUT:
    "Pinterest took too long to respond. Please try again.",

  RATE_LIMITED:
    "Too many requests. Please wait a moment and try again.",

  SERVER_ERROR:
    "Something went wrong. Please try again in a moment.",
};

export function getUserErrorMessage(
  code: ApiErrorCode,
): string {
  return (
    USER_ERROR_MESSAGES[code] ??
    USER_ERROR_MESSAGES.SERVER_ERROR
  );
}

export class ExtractionError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);

    this.name = "ExtractionError";
  }
}