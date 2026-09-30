/**
 * Download helper for Download Pin Video.
 *
 * Two stable paths:
 *
 * 1. Direct media via /api/media
 *    Browser receives the same-origin streaming URL directly.
 *
 * 2. Prepared HLS video via /api/video
 *    The completed MP4 is fetched as a Blob before download.
 */

const preparedVideoDownloads =
  new Map<
    string,
    Promise<Blob>
  >();

/**
 * Only /api/video uses the prepared-video
 * Blob flow.
 */
function isPreparedVideoUrl(
  mediaUrl: string,
): boolean {
  return mediaUrl.startsWith(
    "/api/video",
  );
}

/**
 * Trigger a normal browser download.
 *
 * /api/media is same-origin, so Chrome can
 * honor the download attribute reliably.
 */
function triggerBrowserDownload(
  mediaUrl: string,
  filename: string,
): void {
  const anchor =
    document.createElement(
      "a",
    );

  anchor.href =
    mediaUrl;

  anchor.download =
    filename;

  anchor.rel =
    "noopener";

  anchor.style.display =
    "none";

  document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();
}

/**
 * Fetch a prepared /api/video response.
 *
 * This path is only for HLS cases where
 * HLS provides better quality than the
 * direct Pinterest MP4.
 */
async function fetchPreparedVideo(
  mediaUrl: string,
): Promise<Blob> {
  const response =
    await fetch(
      mediaUrl,
      {
        method:
          "GET",

        credentials:
          "same-origin",

        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    let message =
      "Video download could not be prepared.";

    try {
      const payload =
        await response.json();

      if (
        payload &&
        typeof payload ===
          "object" &&
        "error" in payload &&
        typeof payload.error ===
          "string"
      ) {
        message =
          payload.error;
      }
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const data =
    await response.arrayBuffer();

  if (
    data.byteLength === 0
  ) {
    throw new Error(
      "Downloaded video is empty.",
    );
  }

  return new Blob(
    [
      data,
    ],
    {
      type:
        "video/mp4",
    },
  );
}

/**
 * Reuse an existing in-flight prepared
 * video request when possible.
 */
function getPreparedVideo(
  mediaUrl: string,
): Promise<Blob> {
  const existing =
    preparedVideoDownloads.get(
      mediaUrl,
    );

  if (existing) {
    return existing;
  }

  const request =
    fetchPreparedVideo(
      mediaUrl,
    );

  preparedVideoDownloads.set(
    mediaUrl,
    request,
  );

  request.catch(
    () => {
      preparedVideoDownloads.delete(
        mediaUrl,
      );
    },
  );

  return request;
}

/**
 * Begin preparing only /api/video
 * in the background.
 *
 * Direct /api/media downloads are streamed
 * normally and should not be prefetched
 * into JavaScript memory.
 */
export function prepareSecureDownload(
  mediaUrl: string,
): void {
  if (
    !isPreparedVideoUrl(
      mediaUrl,
    )
  ) {
    return;
  }

  void getPreparedVideo(
    mediaUrl,
  ).catch(
    () => {
      /**
       * Silent background-preload failure.
       *
       * If the user clicks later, the normal
       * click flow will expose the failure.
       */
    },
  );
}

/**
 * Start the final user download.
 */
export async function triggerSecureDownload(
  mediaUrl: string,
  filename: string,
): Promise<void> {
  /**
   * DIRECT /api/media FAST PATH
   *
   * Hand the streaming same-origin URL
   * directly to the browser.
   *
   * No:
   * - arrayBuffer
   * - Blob
   * - FFmpeg
   * - yt-dlp
   * - full-file wait
   *
   * Browser can begin receiving bytes
   * as /api/media streams them.
   */
  if (
    !isPreparedVideoUrl(
      mediaUrl,
    )
  ) {
    triggerBrowserDownload(
      mediaUrl,
      filename,
    );

    return;
  }

  /**
   * PREPARED HLS /api/video PATH
   */
  let videoBlob:
    Blob;

  try {
    videoBlob =
      await getPreparedVideo(
        mediaUrl,
      );
  } catch (error) {
    preparedVideoDownloads.delete(
      mediaUrl,
    );

    throw error;
  }

  const objectUrl =
    URL.createObjectURL(
      videoBlob,
    );

  try {
    triggerBrowserDownload(
      objectUrl,
      filename,
    );
  } finally {
    /**
     * Give the browser enough time to
     * adopt the Blob before releasing it.
     */
    setTimeout(
      () => {
        URL.revokeObjectURL(
          objectUrl,
        );
      },
      1000,
    );
  }
}

/**
 * Existing UI timing exports.
 *
 * Keep these because other components
 * may already import them.
 */
export const PREPARING_MIN_MS =
  400;

export const DOWNLOAD_FALLBACK_MS =
  2500;