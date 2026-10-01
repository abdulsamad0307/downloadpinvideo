import type { Metadata } from "next";
import { Suspense } from "react";

import Header from "@/components/Header";
import ExtensionDownloader from "./ExtensionDownloader";

export const metadata: Metadata = {
  title: "Pinterest Download | Download Pin Video",
  description:
    "Download supported Pinterest media from a public Pin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ExtensionDownloadPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto flex max-w-4xl flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Download Your Pinterest Pin
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Your Pinterest link has been passed from the browser extension.
              Review it below and continue to download the available media.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-sm text-slate-500">
                Preparing your download...
              </div>
            }
          >
            <ExtensionDownloader />
          </Suspense>
        </section>
      </main>
    </>
  );
}