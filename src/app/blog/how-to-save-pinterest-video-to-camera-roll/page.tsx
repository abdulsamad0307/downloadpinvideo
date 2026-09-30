import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How to Save a Pinterest Video to Camera Roll (iPhone & Android)",
  description:
    "Learn how to save a Pinterest video to Camera Roll on iPhone or Android, find downloaded files, and move videos to Photos or Gallery.",
  alternates: {
    canonical: "/blog/how-to-save-pinterest-video-to-camera-roll",
  },
  openGraph: {
    title: "How to Save a Pinterest Video to Camera Roll (iPhone & Android)",
    description:
      "Learn how to save a Pinterest video to Camera Roll on iPhone or Android, find downloaded files, and move videos to Photos or Gallery.",
    url: "/blog/how-to-save-pinterest-video-to-camera-roll",
    type: "article",
  },
};

const faqs = [
  {
    question:
      "Why did my Pinterest video download to Files instead of Camera Roll?",
    answer:
      "On iPhone, Safari and other browsers may save downloaded files to the Files app first. Open Files, go to Downloads, open the video, tap Share, and choose Save Video when available.",
  },
  {
    question: "Where do downloaded Pinterest videos go on Android?",
    answer:
      "They commonly appear in the Downloads folder and may also show automatically in Gallery or Google Photos, depending on your phone and browser.",
  },
  {
    question: "Can I save Pinterest videos without installing an app?",
    answer:
      "Yes. You can use a browser-based Pinterest video downloader in Safari, Chrome, or another modern browser without installing a separate downloader app.",
  },
  {
    question: "Can I save Pinterest videos without the Pinterest app?",
    answer:
      "Yes. If you already have the public Pinterest Pin link, you can process it in a supported browser-based downloader without having the Pinterest app installed on that device.",
  },
];

export default function SavePinterestVideoToCameraRollPage() {
  return (
    <>
      <Header />

      <main className="bg-white">
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-10 border-b border-slate-200 pb-8">
            <Link
              href="/blog"
              className="text-sm font-semibold text-accent-pink hover:underline"
            >
              ← Back to Guides
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent-pink">
              Pinterest Video Guide
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How to Save a Pinterest Video to Camera Roll
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              Pinterest makes it easy to save Pins to your account, but saving
              the actual video file to your phone is a different process. The
              easiest method is to copy the video link, download the file, and
              then save it to Photos, Camera Roll, or Gallery.
            </p>
          </div>

          {/* Main Blog Infographic */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image
              src="/blog/how-to-save-pinterest-video-to-camera-roll.png"
              alt="How to save a Pinterest video to Camera Roll on iPhone and Android"
              width={1200}
              height={1200}
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>

          <div className="space-y-8 text-[15px] leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                Can You Save a Pinterest Video Directly to Camera Roll?
              </h2>

              <p>
                Pinterest&apos;s Save button normally saves a Pin to your
                Pinterest account or board. It does not always save the actual
                video file directly to your phone&apos;s Camera Roll or Gallery.
              </p>

              <p className="mt-4">
                If you want an offline copy of a public Pinterest video, copy its
                Pin link and use the{" "}
                <Link
                  href="/"
                  className="font-semibold text-accent-pink hover:underline"
                >
                  Pinterest Video Downloader
                </Link>{" "}
                to process the available video.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                How to Save a Pinterest Video to Camera Roll
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    1. Open the Pinterest Video Pin
                  </h3>

                  <p className="mt-2">
                    Open Pinterest and select the video you want to save. Make
                    sure you are viewing the individual video Pin rather than a
                    board, profile, or feed page.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    2. Copy the Pinterest Video Link
                  </h3>

                  <p className="mt-2">
                    Tap the Share button and choose <strong>Copy Link</strong>.
                    Pinterest links may use a regular pinterest.com address or a
                    shorter pin.it link.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    3. Download the Video
                  </h3>

                  <p className="mt-2">
                    Paste the copied link into Download Pin Video and process the
                    Pin. Choose the available video option and let your browser
                    download the file.
                  </p>

                  <p className="mt-2">
                    If you need a broader explanation of the download process,
                    read our guide on{" "}
                    <Link
                      href="/blog/how-to-download-pinterest-videos"
                      className="font-semibold text-accent-pink hover:underline"
                    >
                      how to download Pinterest videos
                    </Link>
                    .
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    4. Save the File to Photos or Gallery
                  </h3>

                  <p className="mt-2">
                    After the download finishes, locate the file on your device.
                    On iPhone, it may first appear in Files. On Android, it
                    commonly appears in Downloads or your file manager.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                How to Save a Pinterest Video to Camera Roll on iPhone
              </h2>

              <p>
                On iPhone, downloaded videos may first go to the{" "}
                <strong>Files</strong> app rather than directly into Photos.
              </p>

              <ol className="mt-4 list-decimal space-y-2 pl-6">
                <li>Open the Files app.</li>
                <li>Tap Browse and open Downloads.</li>
                <li>Find and open the downloaded Pinterest video.</li>
                <li>Tap the Share icon.</li>
                <li>Choose Save Video when the option is available.</li>
              </ol>

              <p className="mt-4">
                The video should then appear in the Photos app, commonly under
                Recents. If you used Safari, you can also use Safari&apos;s
                download button to locate recently downloaded files.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                How to Save a Pinterest Video to Gallery on Android
              </h2>

              <p>
                Android devices usually save downloaded videos in the{" "}
                <strong>Downloads</strong> folder.
              </p>

              <ol className="mt-4 list-decimal space-y-2 pl-6">
                <li>
                  Open your browser&apos;s Downloads section or file manager.
                </li>
                <li>Open the Downloads folder.</li>
                <li>Find the Pinterest video.</li>
                <li>Open it to confirm that the file plays correctly.</li>
                <li>Check Gallery or Google Photos.</li>
              </ol>

              <p className="mt-4">
                Many Android phones detect downloaded videos automatically. If
                the video does not appear in Gallery, you can move it from
                Downloads to a video or media folder.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                Pinterest Video Downloaded but Not Showing in Camera Roll?
              </h2>

              <p>
                If the download completed successfully but the video is missing
                from Camera Roll or Gallery, check the Downloads folder first.
              </p>

              <p className="mt-4">
                On iPhone, open the file through Files and use{" "}
                <strong>Share → Save Video</strong>. On Android, use your file
                manager to confirm the video is stored in a location that
                Gallery or Google Photos can access.
              </p>

              <p className="mt-4">
                Also make sure the download completed fully. An incomplete or
                unsupported file may not appear or play correctly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                Where Are Downloaded Pinterest Videos Saved?
              </h2>

              <p>
                On iPhone, downloaded files commonly appear in{" "}
                <strong>Files → Downloads</strong>.
              </p>

              <p className="mt-4">
                On Android, they commonly appear in{" "}
                <strong>Files or File Manager → Downloads</strong>. Some browsers
                also provide their own Downloads section where you can open
                recently downloaded files directly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                Can You Save Pinterest Videos Without Installing an App?
              </h2>

              <p>
                Yes. A browser-based downloader works from Safari, Chrome, or
                another modern browser, so you do not need to install a separate
                downloader app.
              </p>

              <p className="mt-4">
                You only need the public Pinterest video link and an internet
                connection.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900">
                Want to Save Pinterest Photos Too?
              </h2>

              <p>
                Saving images is different from downloading video files. If you
                also want to keep Pinterest images on your phone, read our guide
                on{" "}
                <Link
                  href="/blog/how-to-save-pinterest-photos-to-camera-roll"
                  className="font-semibold text-accent-pink hover:underline"
                >
                  how to save Pinterest photos to Camera Roll
                </Link>
                .
              </p>
            </section>

            <section id="faq">
              <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group border-b border-slate-100 last:border-b-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-semibold text-slate-900 sm:px-6">
                      <span>{faq.question}</span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-500 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <div className="px-5 pb-5 sm:px-6">
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <p className="text-sm leading-7 text-slate-500">
              Download or reuse Pinterest videos only when you have permission
              or the content is your own.
            </p>

            <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-6 text-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Save a Pinterest Video to Your Phone
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Paste a supported public Pinterest Pin into Download Pin Video
                and check the available video.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent-pink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Open Pinterest Video Downloader
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}