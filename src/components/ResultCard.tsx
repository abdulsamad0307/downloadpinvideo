"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  formatQualityLabel,
  sortVariantsByQuality,
} from "@/lib/download/formatVariant";

import VariantDownloadRow from "./VariantDownloadRow";

type ResultCardProps = {
  result: PinterestMediaResult;
  onDownloadAnother: () => void;
};

type CoverState =
  | "idle"
  | "downloading"
  | "error";

function safeFilenamePart(
  value: string,
): string {
  const cleaned = value
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      "",
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return (
    cleaned ||
    "pinterest-cover"
  );
}

function getImageExtension(
  contentType: string,
): string {
  const type =
    contentType.toLowerCase();

  if (type.includes("png")) {
    return "png";
  }

  if (type.includes("webp")) {
    return "webp";
  }

  if (type.includes("gif")) {
    return "gif";
  }

  if (
    type.includes("avif")
  ) {
    return "avif";
  }

  return "jpg";
}

export default function ResultCard({
  result,
  onDownloadAnother,
}: ResultCardProps) {
  const variants = useMemo(
    () =>
      sortVariantsByQuality(
        result.variants,
      ),
    [result.variants],
  );

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(
    variants[0]?.id ?? "",
  );

  const [
    coverState,
    setCoverState,
  ] = useState<CoverState>(
    "idle",
  );

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.id ===
        selectedVariantId,
    ) ??
    variants[0];

  const mediaLabel =
    result.type === "video"
      ? "Pinterest Video"
      : result.type === "gif"
        ? "Pinterest GIF"
        : "Pinterest Image";

  const downloadCover =
    async () => {
      if (
        !result.thumbnail ||
        coverState ===
          "downloading"
      ) {
        return;
      }

      setCoverState(
        "downloading",
      );

      try {
        const response =
          await fetch(
            `/api/cover?url=${encodeURIComponent(
              result.thumbnail,
            )}`,
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            `Cover request failed: ${response.status}`,
          );
        }

        const contentType =
          response.headers.get(
            "content-type",
          ) ??
          "image/jpeg";

        if (
          !contentType
            .toLowerCase()
            .startsWith("image/")
        ) {
          throw new Error(
            "Invalid cover response",
          );
        }

        const buffer =
          await response.arrayBuffer();

        const blob =
          new Blob(
            [buffer],
            {
              type: contentType,
            },
          );

        const blobUrl =
          URL.createObjectURL(
            blob,
          );

        try {
          const anchor =
            document.createElement(
              "a",
            );

          const title =
            safeFilenamePart(
              result.title ||
                "pinterest",
            );

          const extension =
            getImageExtension(
              contentType,
            );

          anchor.href =
            blobUrl;

          anchor.download =
            `${title}-cover.${extension}`;

          anchor.rel =
            "noopener";

          anchor.style.display =
            "none";

          document.body.appendChild(
            anchor,
          );

          anchor.click();

          anchor.remove();
        } finally {
          window.setTimeout(
            () => {
              URL.revokeObjectURL(
                blobUrl,
              );
            },
            10_000,
          );
        }

        setCoverState(
          "idle",
        );
      } catch (error) {
        console.error(
          "[Download Pin Video cover download error]",
          error,
        );

        setCoverState(
          "error",
        );
      }
    };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Thumbnail */}
        <div className="shrink-0">
          {result.thumbnail ? (
            <img
              src={
                result.thumbnail
              }
              alt=""
              className="aspect-video w-full rounded-xl border border-slate-100 bg-slate-100 object-cover sm:w-40"
            />
          ) : (
            <div
              className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 sm:w-40"
              aria-hidden="true"
            >
              <svg
                className="h-8 w-8 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={
                  1.5
                }
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Main information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
              {result.title ||
                "Your Pin is ready"}
            </h3>

            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              {mediaLabel}
            </span>
          </div>

          {/* Show selector only when multiple real qualities exist */}
          {variants.length >
            1 && (
            <div className="mt-4">
              <label
                htmlFor="download-pin-video-quality"
                className="mb-1.5 block text-xs font-medium text-slate-500"
              >
                Quality
              </label>

              <select
                id="download-pin-video-quality"
                value={
                  selectedVariant
                    ?.id ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  setSelectedVariantId(
                    event.target
                      .value,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-accent-pink focus:ring-2 focus:ring-accent-pink/15 sm:max-w-[220px]"
              >
                {variants.map(
                  (
                    variant,
                    index,
                  ) => (
                    <option
                      key={
                        variant.id
                      }
                      value={
                        variant.id
                      }
                    >
                      {formatQualityLabel(
                        variant,
                      )}
                      {index ===
                      0
                        ? " (Best)"
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Video / image download */}
      {selectedVariant && (
        <div className="mt-4">
          <VariantDownloadRow
            result={result}
            variant={
              selectedVariant
            }
          />
        </div>
      )}

      {/* Download Cover - only useful for video */}
      {result.type ===
        "video" &&
        result.thumbnail && (
          <div className="mt-3">
            <button
              type="button"
              onClick={
                downloadCover
              }
              disabled={
                coverState ===
                "downloading"
              }
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {coverState ===
              "downloading" ? (
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

                  Downloading cover...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={
                      1.8
                    }
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
                    />
                  </svg>

                  Download Cover
                </>
              )}
            </button>

            {coverState ===
              "error" && (
              <div className="mt-2 text-center">
                <p className="text-xs text-rose-600">
                  Cover could not be downloaded.
                </p>

                <button
                  type="button"
                  onClick={
                    downloadCover
                  }
                  className="mt-1 text-xs font-semibold text-accent-pink hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

      {/* Download Another */}
      <div className="mt-4 border-t border-slate-100 pt-4 text-center">
        <button
          type="button"
          onClick={
            onDownloadAnother
          }
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent-pink/20 sm:w-auto"
        >
          Download Another
        </button>
      </div>
    </div>
  );
}