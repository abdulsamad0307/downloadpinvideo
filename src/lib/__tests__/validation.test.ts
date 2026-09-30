import { describe, expect, it } from "vitest";
import {
  isValidPinterestUrl,
  validatePinterestInputUrl,
} from "@/lib/url/validatePinterestUrl";
import { isPinterestPageHostname } from "@/lib/url/pinterestHosts";
import { parsePinterestHtml } from "@/lib/extractors/parsePinterestPage";

describe("isPinterestPageHostname", () => {
  it("accepts official Pinterest hosts", () => {
    expect(isPinterestPageHostname("www.pinterest.com")).toBe(true);
    expect(isPinterestPageHostname("pinterest.com")).toBe(true);
    expect(isPinterestPageHostname("pin.it")).toBe(true);
    expect(isPinterestPageHostname("uk.pinterest.com")).toBe(true);
  });

  it("rejects lookalike hosts", () => {
    expect(isPinterestPageHostname("pinterest.com.evil.com")).toBe(false);
    expect(isPinterestPageHostname("evilpinterest.com")).toBe(false);
  });
});

describe("validatePinterestInputUrl", () => {
  it("accepts valid Pinterest URLs", () => {
    expect(
      validatePinterestInputUrl(
        "https://www.pinterest.com/pin/123456789012345678/",
      ).valid,
    ).toBe(true);
    expect(
      validatePinterestInputUrl("https://pinterest.com/pin/abc123/").valid,
    ).toBe(true);
    expect(validatePinterestInputUrl("https://pin.it/abcdEF").valid).toBe(true);
    expect(
      validatePinterestInputUrl("https://uk.pinterest.com/pin/abc123/").valid,
    ).toBe(true);
  });

  it("rejects invalid or unsafe URLs", () => {
    expect(validatePinterestInputUrl("https://google.com").valid).toBe(false);
    expect(
      validatePinterestInputUrl("https://pinterest.com.evil.com/pin/1").valid,
    ).toBe(false);
    expect(validatePinterestInputUrl("http://localhost/pin/1").valid).toBe(
      false,
    );
    expect(validatePinterestInputUrl("http://127.0.0.1/pin/1").valid).toBe(
      false,
    );
    expect(validatePinterestInputUrl("javascript:alert(1)").valid).toBe(false);
    expect(validatePinterestInputUrl("not-a-url").valid).toBe(false);
    expect(
      validatePinterestInputUrl("https://user:pass@www.pinterest.com/pin/1")
        .valid,
    ).toBe(false);
  });

  it("exports convenience helper", () => {
    expect(isValidPinterestUrl("https://pin.it/abc123")).toBe(true);
    expect(isValidPinterestUrl("https://example.com")).toBe(false);
  });
});

describe("parsePinterestHtml", () => {
  it("extracts og video and image metadata", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Sample Pin" />
          <meta property="og:image" content="https://i.pinimg.com/originals/ab/cd/ef.jpg" />
          <meta property="og:video" content="https://v1.pinimg.com/videos/mc/hLS/123.mp4" />
        </head>
      </html>
    `;

    const parsed = parsePinterestHtml(html);
    expect(parsed.title).toBe("Sample Pin");
    expect(parsed.videoVariants.length).toBeGreaterThan(0);
    expect(parsed.imageVariants.length).toBeGreaterThan(0);
  });

  it("parses embedded PWS JSON video_list", () => {
    const html = `
      <script id="__PWS_DATA__" type="application/json">
        {"props":{"initialReduxState":{"pins":{"1":{"id":"1","title":"Video Pin","videos":{"video_list":{"V_720P":{"url":"https://v1.pinimg.com/videos/mc/720/abc.mp4","width":720,"height":1280}}}}}}}}
      </script>
    `;

    const parsed = parsePinterestHtml(html);
    expect(parsed.videoVariants.some((v) => v.url.includes("abc.mp4"))).toBe(
      true,
    );
  });
});

describe("API error shape", () => {
  it("matches expected failure envelope", () => {
    const failure = {
      success: false as const,
      error: {
        code: "INVALID_URL" as const,
        message: "This doesn't look like a valid Pinterest link.",
      },
    };

    expect(failure.success).toBe(false);
    expect(failure.error.code).toBe("INVALID_URL");
    expect(typeof failure.error.message).toBe("string");
  });
});
