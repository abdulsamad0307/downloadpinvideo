export const videoPinInitialPropsFixture = {
  initialReduxState: {
    pins: {},
    resources: {
      PinResource: {
        "9999999999999999": {
          data: {
            id: "9999999999999999",
            title: "Sample Video Pin",
            videos: {
              video_list: {
                V_720P: {
                  url: "https://v1.pinimg.com/videos/mc/720/sample-video-720.mp4",
                  width: 720,
                  height: 1280,
                },
                V_EXP7: {
                  url: "https://v1.pinimg.com/videos/mc/exp7/sample-video-exp7.mp4",
                  width: 1080,
                  height: 1920,
                },
              },
            },
            images: {
              orig: {
                url: "https://i.pinimg.com/originals/aa/bb/cc/aabbccdd.jpg",
                width: 1080,
                height: 1920,
              },
            },
          },
        },
      },
    },
  },
};

export const storyPinVideoFixture = {
  initialReduxState: {
    pins: {
      "8888888888888888": {
        id: "8888888888888888",
        title: "Story Pin Video",
        story_pin_data: {
          pages: [
            {
              blocks: [
                {
                  video: {
                    video_list: {
                      V_720P: {
                        url: "https://v1.pinimg.com/videos/mc/720/story-video.mp4",
                        width: 720,
                        height: 1280,
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
};

export const emptyPinShellFixture = {
  initialReduxState: {
    pins: {},
    resources: {},
  },
};
