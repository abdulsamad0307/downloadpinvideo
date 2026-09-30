import type {
  ApiDownloadResponse,
  ApiErrorCode,
} from "@/lib/media/types";

import {
  getUserErrorMessage,
} from "@/lib/api/errors";

export async function requestDownload(
  url: string,
  fastMode = false,
): Promise<ApiDownloadResponse> {
  const response = await fetch(
    "/api/download",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        url,
        fastMode,
      }),
    },
  );

  const payload =
    (await response.json()) as
      ApiDownloadResponse;

  return payload;
}

export function mapApiErrorToMessage(
  code: ApiErrorCode,
): string {
  return getUserErrorMessage(code);
}