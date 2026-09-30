import Header from "@/components/Header";
import HeroDecorations from "@/components/HeroDecorations";
import DownloaderTool from "@/components/DownloaderTool";
import TrustStrip from "@/components/TrustStrip";
import HowItWorks from "@/components/HowItWorks";
import DownloadTypes from "@/components/DownloadTypes";
import Benefits from "@/components/Benefits";
import SupportedLinks from "@/components/SupportedLinks";
import QualityFormats from "@/components/QualityFormats";
import DownloadLocations from "@/components/DownloadLocations";
import SeoContent from "@/components/SeoContent";
import SafeUse from "@/components/SafeUse";
import BlogSection from "@/components/BlogSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section
          id="hero"
          className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8"
        >
          <HeroDecorations />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              Free &bull; Browser-Based &bull; No Registration
            </span>

            <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="text-accent-pink">Pinterest</span> Video
              Downloader
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Download supported Pinterest videos from public Pins in the
              available source quality. Paste a Pinterest Pin URL or supported
              pin.it link and save the available video through your browser.
            </p>

            <div className="mt-8 flex w-full justify-center">
              <DownloaderTool />
            </div>
          </div>
        </section>

        <TrustStrip />
        <HowItWorks />
        <DownloadTypes />
        <Benefits />
        <SupportedLinks />
        <QualityFormats />
        <DownloadLocations />
        <SeoContent />
        <SafeUse />
        <BlogSection />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}