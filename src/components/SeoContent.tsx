export default function SeoContent() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-t border-slate-100 bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-accent-pink/[0.03] via-white to-white p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-pink">
            About Download Pin Video
          </p>

          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Online Pinterest Video Downloader for Simple Browser Downloads
          </h2>

          <div className="mt-6 space-y-5 text-sm leading-[1.75] text-slate-600 sm:text-[15px]">
            <p>
              Download Pin Video is a free online Pinterest Video Downloader
              designed for users who want a simple way to save media from
              supported public Pinterest Pins. Copy a Pinterest Pin URL or
              supported{" "}
              <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm text-slate-700">
                pin.it
              </code>{" "}
              link, paste it into the downloader and save the available media
              through your browser.
            </p>

            <p>
              The tool focuses on Pinterest videos and can provide MP4 video
              when a supported MP4 source is available. It can also detect
              compatible Pinterest images, GIFs and animated media from
              supported public Pins. The exact media type, format and quality
              depend on what the original Pinterest source makes available.
            </p>

            <p>
              Download Pin Video works in modern browsers on iPhone, iPad,
              Android, Windows, Mac, tablets and desktop computers without
              requiring a separate app or Pinterest account login. The goal is
              to keep the download process clear, simple and easy to use across
              devices.
            </p>

            <p>
              Download Pin Video is an independent third-party tool and is not
              affiliated with or endorsed by Pinterest. Downloading media does
              not give permission to reuse or republish content, so always
              respect copyright, creator rights, platform terms and any
              permissions that apply.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}