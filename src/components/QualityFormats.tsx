const qualityItems = [
    {
      title: "Source Quality",
      description:
        "Download Pin Video shows the video quality Pinterest makes available for that specific Pin.",
    },
  
    {
      title: "MP4 Video",
      description:
        "When Pinterest provides a supported MP4 source, the downloader can offer that video for download.",
    },
  
    {
      title: "Images & GIFs",
      description:
        "Supported image and GIF media can also be detected when they are available on the public Pin.",
    },
  
    {
      title: "No Artificial Upscaling",
      description:
        "Download Pin Video does not label lower-quality media as HD, 2K or 4K when the source does not provide it.",
    },
  ];
  
  export default function QualityFormats() {
    return (
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
              Quality & Formats
            </p>
  
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Download the Quality Pinterest Actually Provides
            </h2>
  
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Available quality and format depend on the original Pinterest Pin.
              Download Pin Video keeps the process transparent instead of
              promising a resolution that is not present in the source.
            </p>
          </div>
  
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {qualityItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-white p-5 shadow-sm"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-pink/10 text-accent-pink"
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Z"
                    />
  
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 9.75 6 2.25-6 2.25v-4.5Z"
                    />
                  </svg>
                </div>
  
                <h3 className="mt-4 text-sm font-semibold text-slate-900 sm:text-base">
                  {item.title}
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
  
          <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-6 text-slate-500 sm:text-sm">
            If a Pin does not provide a higher-resolution source, the downloader
            does not create or upscale one.
          </p>
        </div>
      </section>
    );
  }