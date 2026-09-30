export const ytdlpProgressiveVideoFixture = {
  title: "Sample video tutorial",
  thumbnail: "https://i.pinimg.com/originals/aa/bb/cc/aabbccdd.jpg",
  webpage_url: "https://www.pinterest.com/pin/0000000000000001/",
  formats: [
    {
      format_id: "V_HLSV4-556",
      url: "https://v1.pinimg.com/videos/iht/hls/aa/bb/cc/aabbccdd_640w.m3u8",
      ext: "mp4",
      protocol: "m3u8_native",
      width: 576,
      height: 1024,
      vcodec: "avc1.64001F",
    },
    {
      format_id: "V_720P",
      url: "https://v1.pinimg.com/videos/mc/720p/aa/bb/cc/aabbccdd.mp4",
      ext: "mp4",
      protocol: "https",
      width: 576,
      height: 1024,
      vcodec: "avc1",
    },
    {
      format_id: "V_HLSV4-audio1-1",
      url: "https://v1.pinimg.com/videos/iht/hls/aa/bb/cc/aabbccdd_audio.m3u8",
      ext: "mp4",
      protocol: "m3u8_native",
      vcodec: "none",
    },
  ],
};

export const ytdlpHlsOnlyFixture = {
  title: "HLS only sample",
  thumbnail: "https://i.pinimg.com/originals/dd/ee/ff/ddeeff.jpg",
  formats: [
    {
      format_id: "V_HLSV4-330",
      url: "https://v1.pinimg.com/videos/iht/hls/dd/ee/ff/ddeeff_360w.m3u8",
      ext: "mp4",
      protocol: "m3u8_native",
      width: 360,
      height: 640,
      vcodec: "avc1.64001E",
    },
  ],
};
