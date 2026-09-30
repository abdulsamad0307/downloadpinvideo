"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  MediaVariant,
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  buildDownloadFilename,
} from "@/lib/download/formatVariant";

import {
  prepareSecureDownload,
  triggerSecureDownload,
} from "@/lib/download/triggerDownload";

type VariantDownloadRowProps = {
  result: PinterestMediaResult;
  variant: MediaVariant;
};

type RowState =
  | "idle"
  | "preparing"
  | "fallback";

/**
 * Small minimum feedback time.
 *
 * This does NOT delay the actual download.
 * It only keeps the visible loading state
 * on screen long enough for the user to
 * notice that their click was accepted.
 */
const MIN_FEEDBACK_TIME_MS =
  700;

function wait(
  milliseconds: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

export default function VariantDownloadRow({
  result,
  variant,
}: VariantDownloadRowProps) {
  const [
    state,
    setState,
  ] =
    useState<RowState>(
      "idle",
    );

  /**
   * Prepare only /api/video HLS downloads
   * in the background.
   *
   * /api/media direct downloads should
   * remain normal streaming downloads.
   */
  useEffect(() => {
    if (
      result.type === "video" &&
      variant.url.startsWith(
        "/api/video?",
      )
    ) {
      prepareSecureDownload(
        variant.url,
      );
    }
  }, [
    result.type,
    variant.url,
  ]);

  const startDownload =
    async () => {
      if (
        state === "preparing"
      ) {
        return;
      }

      setState(
        "preparing",
      );

      const startedAt =
        Date.now();

      try {
        /**
         * Actual download begins immediately.
         *
         * The visual feedback timer below
         * does not postpone this call.
         */
        await triggerSecureDownload(
          variant.url,
          buildDownloadFilename(
            result,
            variant,
          ),
        );

        /**
         * Keep a short professional
         * feedback state visible.
         *
         * If the download action itself
         * already took longer than 700ms,
         * there is no extra wait.
         */
        const elapsed =
          Date.now() -
          startedAt;

        const remaining =
          Math.max(
            0,
            MIN_FEEDBACK_TIME_MS -
              elapsed,
          );

        if (
          remaining > 0
        ) {
          await wait(
            remaining,
          );
        }

        setState(
          "idle",
        );
      } catch (error) {
        console.error(
          "[Download Pin Video download error]",
          error,
        );

        setState(
          "fallback",
        );
      }
    };

  const buttonLabel =
    result.type === "video"
      ? "Download Video"
      : result.type === "gif"
        ? "Download GIF"
        : "Download Image";

  return (
    <div>
      <button
        type="button"
        onClick={
          startDownload
        }
        disabled={
          state === "preparing"
        }
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-pink px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(225,29,72,0.75)] transition hover:-translate-y-0.5 hover:bg-accent-pink-dark hover:shadow-[0_14px_28px_-12px_rgba(225,29,72,0.80)] focus:outline-none focus:ring-4 focus:ring-accent-pink/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
      >
        {state ===
        "preparing" ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>

            Preparing download...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
              />
            </svg>

            {buttonLabel}
          </>
        )}
      </button>

      {state ===
        "preparing" && (
        <div
          className="mt-3 rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <svg
                className="h-4 w-4 animate-spin text-accent-pink"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Preparing download...
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Your download is starting...
              </p>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full w-2/5 animate-pulse rounded-full bg-accent-pink" />
          </div>
        </div>
      )}

      {state ===
        "fallback" && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm text-slate-700">
            Download could not be completed. Please try again.
          </p>

          <button
            type="button"
            onClick={
              startDownload
            }
            className="mt-2 cursor-pointer text-sm font-semibold text-accent-pink underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-accent-pink/20"
          >
            Download Again
          </button>
        </div>
      )}
    </div>
  );
}