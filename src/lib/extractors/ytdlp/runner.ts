export class YtdlpProcessError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "TIMEOUT"
      | "FAILED"
      | "INVALID_OUTPUT"
      | "BINARY_MISSING",
  ) {
    super(message);
    this.name = "YtdlpProcessError";
  }
}

export interface YtdlpRunResult {
  json: unknown;
}

export interface YtdlpDownloadResult {
  filePath: string;
  tempDir: string;
}

const MAX_STDOUT_BYTES =
  5 * 1024 * 1024;

export async function runYtdlpMetadata(
  binaryPath: string,
  url: string,
  timeoutMs: number,
): Promise<YtdlpRunResult> {
  const { spawn } =
    await import("child_process");

  const { access } =
    await import("fs/promises");

  try {
    await access(binaryPath);
  } catch {
    throw new YtdlpProcessError(
      "yt-dlp binary not available",
      "BINARY_MISSING",
    );
  }

  return new Promise(
    (resolve, reject) => {
      const child = spawn(
        binaryPath,
        [
          "--dump-single-json",
          "--no-download",
          "--no-playlist",
          "--no-warnings",
          url,
        ],
        {
          shell: false,
          windowsHide: true,
          stdio: [
            "ignore",
            "pipe",
            "pipe",
          ],
        },
      );

      let stdout = "";
      let stderr = "";
      let stdoutBytes = 0;
      let settled = false;

      let killTimer:
        | ReturnType<
            typeof setTimeout
          >
        | undefined;

      const finish = (
        fn: () => void,
      ) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timer);
        fn();
      };

      const timer =
        setTimeout(() => {
          child.kill("SIGTERM");

          killTimer =
            setTimeout(() => {
              child.kill(
                "SIGKILL",
              );
            }, 2000);

          finish(() => {
            reject(
              new YtdlpProcessError(
                "yt-dlp timed out",
                "TIMEOUT",
              ),
            );
          });
        }, timeoutMs);

      child.stdout?.on(
        "data",
        (chunk: Buffer) => {
          stdoutBytes +=
            chunk.length;

          if (
            stdoutBytes >
            MAX_STDOUT_BYTES
          ) {
            child.kill(
              "SIGKILL",
            );

            finish(() => {
              reject(
                new YtdlpProcessError(
                  "yt-dlp output too large",
                  "FAILED",
                ),
              );
            });

            return;
          }

          stdout +=
            chunk.toString(
              "utf8",
            );
        },
      );

      child.stderr?.on(
        "data",
        (chunk: Buffer) => {
          stderr +=
            chunk.toString(
              "utf8",
            );
        },
      );

      child.on(
        "error",
        (error) => {
          finish(() => {
            reject(
              new YtdlpProcessError(
                error.message,
                "FAILED",
              ),
            );
          });
        },
      );

      child.on(
        "close",
        (code) => {
          if (killTimer) {
            clearTimeout(
              killTimer,
            );
          }

          finish(() => {
            if (code !== 0) {
              reject(
                new YtdlpProcessError(
                  stderr.trim() ||
                    `yt-dlp exited with code ${code}`,
                  "FAILED",
                ),
              );

              return;
            }

            const trimmed =
              stdout.trim();

            if (
              !trimmed ||
              trimmed === "null"
            ) {
              reject(
                new YtdlpProcessError(
                  "yt-dlp returned empty metadata",
                  "INVALID_OUTPUT",
                ),
              );

              return;
            }

            try {
              resolve({
                json:
                  JSON.parse(
                    trimmed,
                  ),
              });
            } catch {
              reject(
                new YtdlpProcessError(
                  "yt-dlp returned invalid JSON",
                  "INVALID_OUTPUT",
                ),
              );
            }
          });
        },
      );
    },
  );
}

export async function runYtdlpVideoDownload(
  binaryPath: string,
  url: string,
  timeoutMs: number,
): Promise<YtdlpDownloadResult> {
  const { spawn } =
    await import("child_process");

  const {
    access,
    mkdtemp,
    readdir,
    rm,
  } = await import(
    "fs/promises"
  );

  const { tmpdir } =
    await import("os");

  const path =
    await import("path");

  try {
    await access(binaryPath);
  } catch {
    throw new YtdlpProcessError(
      "yt-dlp binary not available",
      "BINARY_MISSING",
    );
  }

  const tempDir =
    await mkdtemp(
      path.join(
        tmpdir(),
        "download-pin-video-",
      ),
    );

  const outputTemplate =
    path.join(
      tempDir,
      "video.%(ext)s",
    );

  const startedAt =
    Date.now();

  console.log(
    "[Download Pin Video YTDLP] START",
  );

  try {
    await new Promise<void>(
      (resolve, reject) => {
        const child = spawn(
          binaryPath,
          [
            "--no-playlist",
            "--no-warnings",

            /**
             * Faster HLS fragment fetching.
             *
             * 8 proved more stable for our
             * Pinterest download flow than
             * the previous 16-fragment test.
             */
            "--concurrent-fragments",
            "8",

            /**
             * Prefer the best video and audio
             * streams and merge them.
             *
             * If a combined stream exists,
             * /b provides the fallback.
             */
            "-f",
            "bv*+ba/b",

            "--merge-output-format",
            "mp4",

            "-o",
            outputTemplate,

            url,
          ],
          {
            shell: false,
            windowsHide: true,
            stdio: [
              "ignore",
              "ignore",
              "pipe",
            ],
          },
        );

        let stderr = "";
        let settled = false;

        let killTimer:
          | ReturnType<
              typeof setTimeout
            >
          | undefined;

        const finish = (
          fn: () => void,
        ) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timer);
          fn();
        };

        const timer =
          setTimeout(() => {
            child.kill(
              "SIGTERM",
            );

            killTimer =
              setTimeout(() => {
                child.kill(
                  "SIGKILL",
                );
              }, 2000);

            finish(() => {
              reject(
                new YtdlpProcessError(
                  "Video preparation timed out",
                  "TIMEOUT",
                ),
              );
            });
          }, timeoutMs);

        child.stderr?.on(
          "data",
          (
            chunk: Buffer,
          ) => {
            stderr +=
              chunk.toString(
                "utf8",
              );
          },
        );

        child.on(
          "error",
          (error) => {
            finish(() => {
              reject(
                new YtdlpProcessError(
                  error.message,
                  "FAILED",
                ),
              );
            });
          },
        );

        child.on(
          "close",
          (code) => {
            if (killTimer) {
              clearTimeout(
                killTimer,
              );
            }

            finish(() => {
              if (code !== 0) {
                reject(
                  new YtdlpProcessError(
                    stderr.trim() ||
                      `yt-dlp exited with code ${code}`,
                    "FAILED",
                  ),
                );

                return;
              }

              resolve();
            });
          },
        );
      },
    );

    const files =
      await readdir(
        tempDir,
      );

    const mp4File =
      files.find(
        (file) =>
          file
            .toLowerCase()
            .endsWith(
              ".mp4",
            ),
      );

    if (!mp4File) {
      throw new YtdlpProcessError(
        "yt-dlp did not create an MP4 file",
        "INVALID_OUTPUT",
      );
    }

    const elapsedMs =
      Date.now() -
      startedAt;

    console.log(
      `[Download Pin Video YTDLP] DONE ${elapsedMs}ms`,
    );

    return {
      filePath:
        path.join(
          tempDir,
          mp4File,
        ),
      tempDir,
    };
  } catch (error) {
    const elapsedMs =
      Date.now() -
      startedAt;

    console.error(
      `[Download Pin Video YTDLP] FAILED ${elapsedMs}ms`,
      error,
    );

    await rm(
      tempDir,
      {
        recursive: true,
        force: true,
      },
    );

    throw error;
  }
}