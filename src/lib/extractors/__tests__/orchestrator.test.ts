import { describe, expect, it, vi, beforeEach } from "vitest";

import { ExtractionError } from "@/lib/api/errors";

vi.mock("@/lib/extractors/html", () => ({
  resolvePinterestPageUrl: vi.fn(),

  extractFromHtml: vi.fn(),

  mapFetcherError: vi.fn((error: unknown) => {
    if (error instanceof ExtractionError) {
      throw error;
    }

    throw error;
  }),
}));

vi.mock("@/lib/extractors/ytdlp/extractVideo", () => ({
  extractPinterestVideoViaYtdlp: vi.fn(),
}));

import {
  resolvePinterestPageUrl,
  extractFromHtml,
} from "@/lib/extractors/html";

import {
  extractPinterestVideoViaYtdlp,
} from "@/lib/extractors/ytdlp/extractVideo";

import {
  extractPinterestMedia,
} from "@/lib/extractors/orchestrator";

const mockResolve =
  vi.mocked(resolvePinterestPageUrl);

const mockHtml =
  vi.mocked(extractFromHtml);

const mockYtdlp =
  vi.mocked(extractPinterestVideoViaYtdlp);

describe("extractPinterestMedia orchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockResolve.mockResolvedValue(
      "https://www.pinterest.com/pin/123/",
    );
  });

  it("uses HTML image extraction when yt-dlp finds no video", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        title: "Image Pin",

        thumbnail:
          "https://i.pinimg.com/originals/ab/cd/ef.jpg",

        videoVariants: [],

        hlsVariants: [],

        imageVariants: [
          {
            id: "img1",

            url:
              "https://i.pinimg.com/originals/ab/cd/ef.jpg",

            quality: "Original",

            format: "JPEG",
          },
        ],

        isRestricted: false,
      },
    });

    mockYtdlp.mockResolvedValue(
      null,
    );

    const result =
      await extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      );

    expect(
      result.type,
    ).toBe(
      "image",
    );

    expect(
      result.variants[0]?.url,
    ).toContain(
      "/api/media?token=",
    );

    expect(
      mockYtdlp,
    ).toHaveBeenCalledOnce();
  });

  it("uses HTML video extraction without yt-dlp when variants exist", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        videoVariants: [
          {
            id: "v1",

            url:
              "https://v1.pinimg.com/videos/mc/720/abc.mp4",

            format: "MP4",

            quality: "720p",
          },
        ],

        hlsVariants: [],

        imageVariants: [],

        isRestricted: false,
      },
    });

    const result =
      await extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      );

    expect(
      result.type,
    ).toBe(
      "video",
    );

    expect(
      mockYtdlp,
    ).not.toHaveBeenCalled();
  });

  it("falls back to yt-dlp when HTML has no video variants", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        videoVariants: [],

        hlsVariants: [],

        imageVariants: [
          {
            id: "img1",

            url:
              "https://i.pinimg.com/originals/ab/cd/ef.jpg",

            quality: "Original",

            format: "JPEG",
          },
        ],

        isRestricted: false,
      },
    });

    mockYtdlp.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      type: "video",

      title: "Video Pin",

      thumbnail:
        "https://i.pinimg.com/originals/ab/cd/ef.jpg",

      variants: [
        {
          id: "v1",

          url:
            "/api/media?token=abc",

          format: "MP4",

          quality: "1024p",
        },
      ],
    });

    const result =
      await extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      );

    expect(
      mockYtdlp,
    ).toHaveBeenCalledOnce();

    expect(
      result.type,
    ).toBe(
      "video",
    );

    expect(
      result.variants[0]?.format,
    ).toBe(
      "MP4",
    );
  });

  it("returns HTML image when yt-dlp finds no progressive MP4", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        videoVariants: [],

        hlsVariants: [],

        imageVariants: [
          {
            id: "img1",

            url:
              "https://i.pinimg.com/originals/ab/cd/ef.jpg",

            quality: "Original",

            format: "JPEG",
          },
        ],

        isRestricted: false,
      },
    });

    mockYtdlp.mockResolvedValue(
      null,
    );

    const result =
      await extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      );

    expect(
      mockYtdlp,
    ).toHaveBeenCalledOnce();

    expect(
      result.type,
    ).toBe(
      "image",
    );
  });

  it("falls back to yt-dlp when HTML returns no media variants", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        videoVariants: [],

        hlsVariants: [],

        imageVariants: [],

        isRestricted: false,
      },
    });

    mockYtdlp.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      type: "video",

      title: "Video Pin",

      thumbnail:
        "https://i.pinimg.com/originals/ab/cd/ef.jpg",

      variants: [
        {
          id: "v1",

          url:
            "/api/media?token=abc",

          format: "MP4",

          quality: "1024p",
        },
      ],
    });

    const result =
      await extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      );

    expect(
      mockYtdlp,
    ).toHaveBeenCalledOnce();

    expect(
      result.type,
    ).toBe(
      "video",
    );

    expect(
      result.variants[0]?.format,
    ).toBe(
      "MP4",
    );
  });

  it("throws MEDIA_NOT_FOUND when HTML and yt-dlp both fail", async () => {
    mockHtml.mockResolvedValue({
      sourceUrl:
        "https://www.pinterest.com/pin/123/",

      parsed: {
        videoVariants: [],

        hlsVariants: [],

        imageVariants: [],

        isRestricted: false,
      },
    });

    mockYtdlp.mockResolvedValue(
      null,
    );

    await expect(
      extractPinterestMedia(
        "https://www.pinterest.com/pin/123/",
      ),
    ).rejects.toMatchObject({
      code: "MEDIA_NOT_FOUND",
    });
  });
});