import { describe, expect, it } from "vitest";
import {
  normalizeYtdlpVideoResult,
  parseYtdlpMetadata,
} from "@/lib/extractors/ytdlp/normalize";
import {
  ytdlpHlsOnlyFixture,
  ytdlpProgressiveVideoFixture,
} from "@/lib/extractors/__fixtures__/ytdlpFixtures";

describe("normalizeYtdlpVideoResult", () => {
  it("returns progressive MP4 variants and ignores HLS manifests", () => {
    const metadata = parseYtdlpMetadata(ytdlpProgressiveVideoFixture);
    const result = normalizeYtdlpVideoResult(
      metadata,
      "https://www.pinterest.com/pin/0000000000000001/",
    );

    expect(result).not.toBeNull();
    expect(result?.type).toBe("video");
    expect(result?.title).toBe("Sample video tutorial");
    expect(result?.variants).toHaveLength(1);
    expect(result?.variants[0]?.format).toBe("MP4");
    expect(result?.variants[0]?.quality).toBe("1024p");
    expect(result?.variants[0]?.url).toContain(".mp4");
    expect(result?.variants[0]?.url).not.toContain(".m3u8");
  });

  it("returns null when only HLS formats are available", () => {
    const metadata = parseYtdlpMetadata(ytdlpHlsOnlyFixture);
    const result = normalizeYtdlpVideoResult(
      metadata,
      "https://www.pinterest.com/pin/0000000000000002/",
    );

    expect(result).toBeNull();
  });
});
