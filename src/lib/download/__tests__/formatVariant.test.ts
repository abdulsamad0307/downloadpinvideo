import { describe, expect, it } from "vitest";

import {
  buildDownloadFilename,
  extractPinId,
  formatFileSize,
  formatQualityLabel,
  sortVariantsByQuality,
} from "@/lib/download/formatVariant";

describe("formatVariant helpers", () => {
  it("extracts pin id from source url", () => {
    expect(
      extractPinId(
        "https://www.pinterest.com/pin/480688960248029286/",
      ),
    ).toBe(
      "480688960248029286",
    );
  });

  it("formats known and unknown file sizes", () => {
    expect(
      formatFileSize(4873263),
    ).toBe(
      "4.6 MB",
    );

    expect(
      formatFileSize(undefined),
    ).toBe(
      "Size unavailable",
    );
  });

  it("sorts variants by height descending", () => {
    const sorted =
      sortVariantsByQuality([
        {
          id: "a",
          url: "/a",
          height: 720,
        },
        {
          id: "b",
          url: "/b",
          height: 1280,
        },
      ]);

    expect(
      sorted[0]?.height,
    ).toBe(
      1280,
    );
  });

  it("builds branded mp4 filename", () => {
    const name =
      buildDownloadFilename(
        {
          sourceUrl:
            "https://www.pinterest.com/pin/123/",
          type: "video",
          variants: [],
        },
        {
          id: "v",
          url: "/api/media?token=x",
          quality: "720p",
          height: 720,
        },
      );

    expect(
      name,
    ).toBe(
      "download-pin-video-720p-123.mp4",
    );
  });

  it("uses height for quality label when quality missing", () => {
    expect(
      formatQualityLabel({
        id: "v",
        url: "/x",
        height: 1024,
      }),
    ).toBe(
      "1024p",
    );
  });
});