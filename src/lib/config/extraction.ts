import path from "path";

export interface ExtractionConfig {
  ytdlpEnabled: boolean;
  ytdlpPath: string;
  ffmpegPath: string;
  ytdlpTimeoutMs: number;
  videoDownloadTimeoutMs: number;
}

function defaultYtdlpPath(): string {
  return path.join(process.cwd(), "tools", "yt-dlp.exe");
}

function defaultFfmpegPath(): string {
  return process.env.FFMPEG_PATH?.trim() || "ffmpeg";
}

export function getExtractionConfig(): ExtractionConfig {
  const ytdlpPath =
    process.env.YTDLP_PATH?.trim() || defaultYtdlpPath();

  return {
    ytdlpEnabled: process.env.YTDLP_ENABLED !== "false",
    ytdlpPath,
    ffmpegPath: defaultFfmpegPath(),
    ytdlpTimeoutMs: Number(
      process.env.YTDLP_TIMEOUT_MS ?? 15_000,
    ),
    videoDownloadTimeoutMs: Number(
      process.env.VIDEO_DOWNLOAD_TIMEOUT_MS ?? 120_000,
    ),
  };
}