import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockRun, YtdlpProcessError } = vi.hoisted(() => {
  class YtdlpProcessError extends Error {
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

  return {
    mockRun: vi.fn(),
    YtdlpProcessError,
  };
});

vi.mock("@/lib/config/extraction", () => ({
  getExtractionConfig: () => ({
    ytdlpEnabled: true,
    ytdlpPath: "tools/yt-dlp.exe",
    ytdlpTimeoutMs: 15_000,
  }),
}));

vi.mock("@/lib/extractors/ytdlp/runner", () => ({
  runYtdlpMetadata: mockRun,
  YtdlpProcessError,
}));

import { extractPinterestVideoViaYtdlp } from "@/lib/extractors/ytdlp/extractVideo";

import { ytdlpProgressiveVideoFixture } from "@/lib/extractors/__fixtures__/ytdlpFixtures";

import { validatePinterestInputUrl } from "@/lib/url/validatePinterestUrl";

describe("extractPinterestVideoViaYtdlp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized progressive MP4 with proxy tokens", async () => {
    mockRun.mockResolvedValue({
      json: ytdlpProgressiveVideoFixture,
    });

    const result =
      await extractPinterestVideoViaYtdlp(
        "https://www.pinterest.com/pin/0000000000000001/",
      );

    expect(result).not.toBeNull();

    expect(result?.type).toBe(
      "video",
    );

    expect(result?.variants).toHaveLength(
      1,
    );

    expect(
      result?.variants[0]?.url,
    ).toMatch(
      /^\/api\/media\?token=/,
    );
  });

  it("returns prepared video when only HLS format exists", async () => {
    mockRun.mockResolvedValue({
      json: {
        title: "HLS only",
        formats: [
          {
            format_id: "V_HLSV4-330",
            url:
              "https://v1.pinimg.com/videos/iht/hls/dd/ee/ff/ddeeff_360w.m3u8",
            protocol: "m3u8_native",
            ext: "mp4",
            vcodec: "avc1",
          },
        ],
      },
    });

    const result =
      await extractPinterestVideoViaYtdlp(
        "https://www.pinterest.com/pin/0000000000000002/",
      );

    expect(result).not.toBeNull();

    expect(result?.type).toBe(
      "video",
    );

    expect(result?.variants).toHaveLength(
      1,
    );

    expect(
      result?.variants[0]?.url,
    ).toMatch(
      /^\/api\/video\?token=/,
    );

    expect(
      result?.variants[0]?.format,
    ).toBe(
      "MP4",
    );
  });

  it("maps yt-dlp timeout to TIMEOUT", async () => {
    mockRun.mockRejectedValue(
      new YtdlpProcessError(
        "yt-dlp timed out",
        "TIMEOUT",
      ),
    );

    await expect(
      extractPinterestVideoViaYtdlp(
        "https://www.pinterest.com/pin/123/",
      ),
    ).rejects.toMatchObject({
      code: "TIMEOUT",
    });
  });

  it("maps yt-dlp process failure to EXTRACTION_FAILED", async () => {
    mockRun.mockRejectedValue(
      new YtdlpProcessError(
        "process failed",
        "FAILED",
      ),
    );

    await expect(
      extractPinterestVideoViaYtdlp(
        "https://www.pinterest.com/pin/123/",
      ),
    ).rejects.toMatchObject({
      code: "EXTRACTION_FAILED",
    });
  });

  it("returns null when binary is missing", async () => {
    mockRun.mockRejectedValue(
      new YtdlpProcessError(
        "yt-dlp binary not available",
        "BINARY_MISSING",
      ),
    );

    const result =
      await extractPinterestVideoViaYtdlp(
        "https://www.pinterest.com/pin/123/",
      );

    expect(result).toBeNull();
  });
});

describe("invalid Pinterest URL rejection", () => {
  it("rejects unrelated domains before extraction", () => {
    expect(
      validatePinterestInputUrl(
        "https://google.com",
      ).valid,
    ).toBe(
      false,
    );
  });
});