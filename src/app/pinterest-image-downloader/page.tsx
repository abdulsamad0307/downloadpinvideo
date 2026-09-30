import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import HeroDecorations from "@/components/HeroDecorations";
import DownloaderTool from "@/components/DownloaderTool";
import TrustStrip from "@/components/TrustStrip";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title:
    "Pinterest Image Downloader – Free Online Image Download | Download Pin Video",
  description:
    "Download Pinterest images online with Download Pin Video. Paste a public Pinterest image URL and save the available source image quickly on mobile or desktop.",
  alternates: {
    canonical: "/pinterest-image-downloader",
  },
  openGraph: {
    title:
      "Pinterest Image Downloader – Free Online Image Download | Download Pin Video",
    description:
      "Download Pinterest images online from public Pin links with Download Pin Video. Simple, free and easy to use on mobile or desktop.",
    url: "/pinterest-image-downloader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Pinterest Image Downloader | Download Pin Video",
    description:
      "Download Pinterest images online from public Pinterest Pin links.",
  },
};

const faqs = [
  {
    question: "How do I download an image from Pinterest?",
    answer:
      "Open the Pinterest Pin containing the image, copy its link, paste the URL into Download Pin Video and use the available download option when the Pin is ready.",
  },

  {
    question: "Is Download Pin Video a free Pinterest image downloader?",
    answer:
      "Yes. Download Pin Video works online in your browser and does not require registration to process supported public Pinterest Pins.",
  },

  {
    question: "Can I download Pinterest images on iPhone or Android?",
    answer:
      "Yes. The downloader works in modern mobile browsers on iPhone, iPad and Android devices.",
  },

  {
    question: "Can I use the Pinterest image downloader on PC or Mac?",
    answer:
      "Yes. You can paste a supported Pinterest Pin link into the downloader from a modern browser on Windows or Mac.",
  },

  {
    question: "Do I need a Chrome extension to download Pinterest images?",
    answer:
      "No. Download Pin Video is browser-based, so you do not need to install a Pinterest image downloader Chrome extension or separate app.",
  },

  {
    question: "Does Download Pin Video download Pinterest images in high quality?",
    answer:
      "Download Pin Video uses the image available from the Pinterest source. It does not artificially upscale an image or promise a fixed resolution that the source does not provide.",
  },
];

export default function PinterestImageDownloaderPage() {
  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section
          id="hero"
          className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8"
        >
          <HeroDecorations />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              Fast &bull; Free &bull; No Registration
            </span>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="text-accent-pink">Pinterest</span> Image
              Downloader
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Download Pinterest images online in their available source
              quality. Paste a public Pinterest image URL and save the available
              image quickly on mobile or desktop.
            </p>

            <div className="mt-8 flex w-full justify-center">
              <DownloaderTool />
            </div>
          </div>
        </section>

        <TrustStrip />

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-slate-100 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
                How It Works
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                How to Download Pinterest Images
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Download an available Pinterest image in three simple steps.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pink/10 text-sm font-bold text-accent-pink">
                  1
                </span>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Copy the Pinterest Link
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Open the Pinterest Pin containing the image you want to save
                  and copy the Pin URL.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pink/10 text-sm font-bold text-accent-pink">
                  2
                </span>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Paste the Image URL
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Paste the copied Pinterest link into Download Pin Video and
                  start processing the public Pin.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-pink/10 text-sm font-bold text-accent-pink">
                  3
                </span>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Download the Image
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  When the Pin is ready, use the available download option to
                  save the image to your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="border-t border-slate-100 bg-slate-50/60 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
                Simple &amp; Convenient
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Online Pinterest Image Downloader
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Use Download Pin Video directly in your browser without
                installing extra software.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Available Quality
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Download the image available from the Pinterest source without
                  artificial upscaling.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Online Tool
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Use the Pinterest image downloader directly from a modern web
                  browser.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  No Extension Needed
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  No Chrome extension or separate image downloader application
                  is required.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  Mobile Friendly
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Use the downloader on iPhone, iPad, Android, Windows or Mac.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO CONTENT */}
        <section
          id="about"
          className="scroll-mt-24 border-t border-slate-100 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Free Pinterest Image Downloader Online
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                Download Pin Video is an online Pinterest image downloader for
                saving images available from publicly accessible Pinterest Pins.
                Copy the Pinterest image link, paste it into the downloader and
                use the available download option when the Pin has been
                processed.
              </p>

              <p>
                Because the tool works through your browser, you do not need to
                install a Pinterest image downloader app, Chrome extension or
                desktop program. The same simple process works on mobile phones,
                tablets and computers.
              </p>

              <p>
                Image quality depends on the media Pinterest makes available for
                the individual Pin. Download Pin Video uses the available source
                image rather than artificially converting a lower-resolution
                image into HD, 1080p or 4K.
              </p>

              <p>
                The downloader also supports other compatible Pinterest media.
                If you want to save a video, use the{" "}
                <Link
                  href="/"
                  className="font-semibold text-accent-pink hover:underline"
                >
                  Pinterest Video Downloader
                </Link>
                .
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-pink-100 bg-pink-50/50 p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Want to Save Pinterest Photos to Your Camera Roll?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Read our step-by-step guide for saving Pinterest photos on
                iPhone, iPad and other devices.
              </p>

              <Link
                href="/blog/how-to-save-pinterest-photos-to-camera-roll"
                className="mt-4 inline-flex text-sm font-semibold text-accent-pink hover:underline"
              >
                Read the Pinterest photo guide →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50/60 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
                Common Questions
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Pinterest Image Downloader FAQ
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Quick answers about downloading Pinterest images with Download
                Pin Video.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}