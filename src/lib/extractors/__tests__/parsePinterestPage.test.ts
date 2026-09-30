import { describe, expect, it } from "vitest";
import { parsePinterestHtml } from "@/lib/extractors/parsePinterestPage";
import {
  emptyPinShellFixture,
  storyPinVideoFixture,
  videoPinInitialPropsFixture,
} from "@/lib/extractors/__fixtures__/pinterestVideoFixtures";

function wrapInitialProps(json: unknown): string {
  return `<html><head></head><body><script id="__PWS_INITIAL_PROPS__" type="application/json">${JSON.stringify(json)}</script></body></html>`;
}

function wrapPwsData(json: unknown): string {
  return `<html><head></head><body><script id="__PWS_DATA__" type="application/json">${JSON.stringify(json)}</script></body></html>`;
}

describe("parsePinterestHtml video extraction", () => {
  it("extracts video_list from PinResource in __PWS_INITIAL_PROPS__", () => {
    const html = wrapInitialProps(videoPinInitialPropsFixture);
    const parsed = parsePinterestHtml(html);

    expect(parsed.videoVariants).toHaveLength(2);
    expect(parsed.videoVariants.map((v) => v.quality)).toEqual(
      expect.arrayContaining(["720p", "EXP7"]),
    );
    expect(parsed.videoVariants.every((v) => v.url.includes("pinimg.com/videos"))).toBe(
      true,
    );
    expect(parsed.title).toBe("Sample Video Pin");
  });

  it("extracts story pin block videos", () => {
    const html = wrapInitialProps(storyPinVideoFixture);
    const parsed = parsePinterestHtml(html);

    expect(parsed.videoVariants).toHaveLength(1);
    expect(parsed.videoVariants[0]?.quality).toBe("720p");
    expect(parsed.videoVariants[0]?.format).toBe("MP4");
  });

  it("extracts nested videos.video_list from __PWS_DATA__ props shape", () => {
    const html = wrapPwsData({
      props: {
        initialReduxState: {
          pins: {
            "1": {
              id: "1",
              title: "Legacy Video Pin",
              videos: {
                video_list: {
                  V_720P: {
                    url: "https://v1.pinimg.com/videos/mc/720/legacy.mp4",
                    width: 720,
                    height: 1280,
                  },
                },
              },
            },
          },
        },
      },
    });

    const parsed = parsePinterestHtml(html);
    expect(parsed.videoVariants).toHaveLength(1);
    expect(parsed.videoVariants[0]?.url).toContain("legacy.mp4");
  });

  it("returns no video variants for empty pin shell payloads", () => {
    const html = wrapInitialProps(emptyPinShellFixture);
    const parsed = parsePinterestHtml(html);

    expect(parsed.videoVariants).toHaveLength(0);
    expect(parsed.imageVariants).toHaveLength(0);
  });

  it("still extracts og:image for image pins without embedded pin data", () => {
    const html = `<html><head><meta property="og:image" content="https://i.pinimg.com/736x/aa/bb/cc/aabbcc.jpg" /><meta property="og:title" content="Image Pin" /></head><body><script id="__PWS_INITIAL_PROPS__" type="application/json">${JSON.stringify(emptyPinShellFixture)}</script></body></html>`;

    const parsed = parsePinterestHtml(html);
    expect(parsed.imageVariants).toHaveLength(1);
    expect(parsed.videoVariants).toHaveLength(0);
  });

  it("skips HLS manifest entries", () => {
    const html = wrapInitialProps({
      initialReduxState: {
        pins: {
          "1": {
            id: "1",
            videos: {
              video_list: {
                V_HLSV4: {
                  url: "https://v1.pinimg.com/videos/mc/hls/sample.m3u8",
                },
                V_720P: {
                  url: "https://v1.pinimg.com/videos/mc/720/valid.mp4",
                },
              },
            },
          },
        },
      },
    });

    const parsed = parsePinterestHtml(html);
    expect(parsed.videoVariants).toHaveLength(1);
    expect(parsed.videoVariants[0]?.url).toContain("valid.mp4");
  });
});
