"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PinterestMediaResult,
} from "@/lib/media/types";

import {
  isValidPinterestUrl,
} from "@/lib/validatePinterestUrl";

import {
  mapApiErrorToMessage,
  requestDownload,
} from "@/lib/api/client";

import ErrorMessage from "./ErrorMessage";
import ResultCard from "./ResultCard";

type ToolState =
  | "idle"
  | "validating"
  | "loading"
  | "success"
  | "error";

type DownloaderToolProps = {
  initialUrl?: string;
  autoProcess?: boolean;
};

export default function DownloaderTool({
  initialUrl = "",
  autoProcess = false,
}: DownloaderToolProps) {
  const [url, setUrl] =
    useState(initialUrl);

  const [state, setState] =
    useState<ToolState>(
      autoProcess && initialUrl
        ? "loading"
        : "idle",
    );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    showHelp,
    setShowHelp,
  ] = useState(false);

  const [
    result,
    setResult,
  ] =
    useState<PinterestMediaResult | null>(
      null,
    );

  const submittingRef =
    useRef(false);

  const processedInitialUrlRef =
    useRef<string | null>(null);

  const resultRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  /*
   * Keep the input synced when a URL
   * is supplied by the extension page.
   */
  useEffect(() => {
    if (!initialUrl) {
      return;
    }

    setUrl(initialUrl);
  }, [initialUrl]);

  /*
   * Shared processing function.
   *
   * Homepage uses this after a manual
   * form submit.
   *
   * Extension page can call it
   * automatically.
   */
  const processPinterestUrl =
    useCallback(
      async (value: string) => {
        const trimmedUrl =
          value.trim();

        if (
          submittingRef.current
        ) {
          return;
        }

        setShowHelp(false);

        if (!trimmedUrl) {
          setErrorMessage(
            "Please paste a Pinterest link to continue.",
          );

          setState("error");

          return;
        }

        setState("validating");

        if (
          !isValidPinterestUrl(
            trimmedUrl,
          )
        ) {
          setErrorMessage(
            "This doesn't look like a valid Pinterest link. Copy the link from Pinterest and try again.",
          );

          setState("error");

          return;
        }

        submittingRef.current =
          true;

        setState("loading");

        setErrorMessage("");

        setResult(null);

        try {
          const response =
            await requestDownload(
              trimmedUrl,
              autoProcess,
            );

          if (!response.success) {
            setErrorMessage(
              mapApiErrorToMessage(
                response.error.code,
              ),
            );

            setState("error");

            return;
          }

          setResult(response.data);

          setState("success");
        } catch {
          setErrorMessage(
            "Something went wrong. Please check your connection and try again.",
          );

          setState("error");
        } finally {
          submittingRef.current =
            false;
        }
      },
      [],
    );

  /*
   * Extension-only auto processing.
   *
   * This DOES NOT run on the homepage
   * because autoProcess defaults to false.
   *
   * The ref also prevents React Strict Mode
   * from firing the same request twice.
   */
  useEffect(() => {
    if (
      !autoProcess ||
      !initialUrl
    ) {
      return;
    }

    if (
      processedInitialUrlRef.current ===
      initialUrl
    ) {
      return;
    }

    processedInitialUrlRef.current =
      initialUrl;

    void processPinterestUrl(
      initialUrl,
    );
  }, [
    autoProcess,
    initialUrl,
    processPinterestUrl,
  ]);

  /*
   * Mobile UX:
   * When a Pin finishes fetching,
   * automatically move the user to
   * the ready/download section.
   */
  useEffect(() => {
    if (
      state !== "success" ||
      !result ||
      !resultRef.current
    ) {
      return;
    }

    const isMobile =
      window.matchMedia(
        "(max-width: 639px)",
      ).matches;

    if (!isMobile) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    resultRef.current.scrollIntoView({
      behavior:
        prefersReducedMotion
          ? "auto"
          : "smooth",
      block: "start",
    });
  }, [state, result]);

  const reset = () => {
    setUrl("");
    setState("idle");
    setErrorMessage("");
    setShowHelp(false);
    setResult(null);

    submittingRef.current =
      false;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    await processPinterestUrl(url);
  };

  const isProcessing =
    state === "loading" ||
    state === "validating";

  /*
   * On the normal homepage we show the
   * standard paste/download form.
   *
   * On the extension route, the URL has
   * already been supplied, so we hide
   * that redundant form unless an error
   * occurs.
   */
  const showInputForm =
    !autoProcess ||
    state === "error";

  return (
    <div className="w-full max-w-3xl">
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-3 -z-10 rounded-[32px] bg-gradient-to-r from-rose-100/70 via-white to-pink-100/70 blur-2xl"
          aria-hidden="true"
        />

        <div className="rounded-[26px] border border-rose-100 bg-white p-5 shadow-[0_20px_60px_-24px_rgba(225,29,72,0.30),0_10px_30px_-18px_rgba(15,23,42,0.20)] sm:p-7">

          {showInputForm && (
            <>
              <div className="mb-4 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Paste your Pinterest link below
                </span>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2 shadow-inner sm:p-2.5">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <label
                        htmlFor="pinterest-url"
                        className="sr-only"
                      >
                        Pinterest link
                      </label>

                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.7}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                          />
                        </svg>
                      </span>

                      <input
                        id="pinterest-url"
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        placeholder="Paste Pinterest URL here..."
                        value={url}
                        onChange={(event) => {
                          setUrl(
                            event.target.value,
                          );

                          if (
                            state ===
                            "error"
                          ) {
                            setState(
                              "idle",
                            );
                          }
                        }}
                        disabled={
                          isProcessing
                        }
                        className="h-14 w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-[15px] font-medium text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isProcessing
                      }
                      className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-pink px-7 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(225,29,72,0.75)] transition hover:-translate-y-0.5 hover:bg-accent-pink-dark hover:shadow-[0_14px_28px_-10px_rgba(225,29,72,0.80)] focus:outline-none focus:ring-4 focus:ring-accent-pink/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 sm:min-w-[165px]"
                    >
                      {isProcessing ? (
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

                          Processing...
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

                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-400">
                  <span>
                    Supported:
                  </span>

                  <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-500">
                    https://pin.it/...
                  </code>

                  <span>or</span>

                  <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-500">
                    https://www.pinterest.com/pin/...
                  </code>
                </div>
              </form>
            </>
          )}

          {/* Extension auto-processing state */}
          {autoProcess &&
            isProcessing && (
              <div
                className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white px-5 py-5 shadow-sm"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <svg
                      className="h-5 w-5 animate-spin text-accent-pink"
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
                    <p className="font-bold text-slate-900">
                      Preparing your download...
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Fetching the available Pinterest media.
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rose-100">
                  <div className="h-full w-2/5 animate-pulse rounded-full bg-accent-pink" />
                </div>
              </div>
            )}

          {/* Normal homepage loading */}
          {!autoProcess &&
            state === "loading" && (
              <div
                className="mt-5 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white px-4 py-4 shadow-sm"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <svg
                      className="h-5 w-5 animate-spin text-accent-pink"
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

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      Fetching your Pin...
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Please wait a few seconds.
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rose-100">
                  <div className="h-full w-2/5 animate-pulse rounded-full bg-accent-pink" />
                </div>
              </div>
            )}

          {/* Error */}
          {state === "error" &&
            errorMessage && (
              <div className="mt-5">
                <ErrorMessage
                  message={
                    errorMessage
                  }
                  onHelpClick={() =>
                    setShowHelp(
                      (help) =>
                        !help,
                    )
                  }
                />
              </div>
            )}

          {/* Help */}
          {showHelp && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                How to copy a link
              </p>

              <ol className="mt-2 list-decimal space-y-1 pl-4">
                <li>
                  Open the Pin on Pinterest.
                </li>

                <li>
                  Tap or click Share, then Copy link.
                </li>

                <li>
                  Paste the link into the field above.
                </li>
              </ol>
            </div>
          )}

          {/* Success / Result */}
          {state === "success" &&
            result && (
              <div
                ref={resultRef}
                className={
                  autoProcess
                    ? "scroll-mt-20"
                    : "mt-5 scroll-mt-20"
                }
              >
                <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-900">
                      Ready to download!
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Your Pinterest{" "}
                      {result.type ===
                      "video"
                        ? "video"
                        : result.type ===
                            "gif"
                          ? "GIF"
                          : "image"}{" "}
                      is ready.
                    </p>
                  </div>
                </div>

                <ResultCard
                  result={result}
                  onDownloadAnother={
                    reset
                  }
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}