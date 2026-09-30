import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pinterest Download Guides | Download Pin Video",

  description:
    "Explore practical Pinterest download guides for videos, images, GIFs, live wallpapers, MP4 files, mobile devices and common Pinterest download problems.",

  alternates: {
    canonical: "/blog",
  },

  openGraph: {
    title: "Pinterest Download Guides | Download Pin Video",

    description:
      "Explore practical guides for downloading Pinterest videos, images, GIFs and live wallpapers, saving media on different devices and solving common download issues.",

    url: "/blog",

    type: "website",
  },
};

const posts = [
  {
    title:
      "How to Download Live Wallpaper from Pinterest on iPhone, Android & PC",

    description:
      "Learn how to download live wallpaper from Pinterest, save the available video and use it as an animated wallpaper on iPhone, Android and PC.",

    href: "/blog/how-to-download-live-wallpaper-from-pinterest",

    label: "Pinterest Wallpaper Guide",

    image: "/blog/how-to-download-live-wallpaper-from-pinterest.webp",

    alt: "How to download live wallpaper from Pinterest on iPhone Android and PC",
  },

  {
    title: "Pinterest Video Download HD: Save Videos in 1080p & 4K",

    description:
      "Learn how to download Pinterest videos in HD, Full HD 1080p and 4K when available, and how to save the highest available video quality.",

    href: "/blog/pinterest-video-download-hd",

    label: "Pinterest Video Guide",

    image: "/blog/pinterest-video-download-hd.png",

    alt: "Pinterest Video Download HD guide for 1080p and 4K",
  },

  {
    title: "How to Download a Pinterest Board: Save All Pins & Images",

    description:
      "Learn how to download a Pinterest board, save board images and Pins, and understand the safest ways to save an entire Pinterest board.",

    href: "/blog/how-to-download-a-pinterest-board",

    label: "Pinterest Board Guide",

    image: "/blog/how-to-download-a-pinterest-board.webp",

    alt: "How to download a Pinterest board and save all Pins and images",
  },

  {
    title: "How to Save a Pinterest Video to Camera Roll",

    description:
      "Learn how to save a Pinterest video to Camera Roll on iPhone or Android, find downloaded files, and move videos to Photos or Gallery.",

    href: "/blog/how-to-save-pinterest-video-to-camera-roll",

    label: "Pinterest Video Guide",

    image: "/blog/how-to-save-pinterest-video-to-camera-roll.png",

    alt: "How to save a Pinterest video to Camera Roll on iPhone and Android",
  },

  {
    title: "Pinterest Video Downloader Reddit: What Actually Works in 2026",

    description:
      "See what Reddit discussions reveal about Pinterest video downloaders, why links sometimes fail, and what to check before choosing a tool.",

    href: "/blog/pinterest-video-downloader-reddit",

    label: "Pinterest Video Guide",

    image: "/blog/pinterest-video-downloader-reddit.png",

    alt: "Pinterest Video Downloader Reddit guide",
  },

  {
    title: "Pinterest to MP4: How to Download Pinterest Videos as MP4",

    description:
      "Learn how to save publicly available Pinterest videos as MP4 files while keeping the available source quality.",

    href: "/blog/pinterest-to-mp4",

    label: "Pinterest Video Guide",

    image: "/blog/pinterest-to-mp4.webp",

    alt: "Pinterest to MP4 download guide",
  },

  {
    title: "How to Save Pinterest Photos to Camera Roll",

    description:
      "Learn how to save Pinterest photos to your camera roll on iPhone, iPad and other devices with simple step-by-step instructions.",

    href: "/blog/how-to-save-pinterest-photos-to-camera-roll",

    label: "Pinterest Image Guide",

    image: "/blog/how-to-save-pinterest-photos-to-camera-roll.webp",

    alt: "Save Pinterest photos to camera roll guide",
  },

  {
    title: "How to Download Pinterest Videos",

    description:
      "Learn how to download Pinterest videos on iPhone, Android, PC and Mac, plus where saved videos go and what to check if a Pin does not work.",

    href: "/blog/how-to-download-pinterest-videos",

    label: "Pinterest Video Guide",

    image: "/blog/how-to-download-pinterest-videos.webp",

    alt: "How to download Pinterest videos guide",
  },

  {
    title: "How to Save GIFs from Pinterest on iPhone, Android and PC",

    description:
      "Learn how to save Pinterest GIFs on iPhone, Android, PC and Mac, find downloaded files and fix common GIF saving problems.",

    href: "/blog/how-to-save-gifs-from-pinterest",

    label: "Pinterest GIF Guide",

    image: "/blog/how-to-save-gifs-from-pinterest.webp",

    alt: "How to save GIFs from Pinterest guide",
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
              Download Pin Video Blog
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Pinterest Download Guides
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Practical guides to help you download Pinterest videos, images,
              GIFs and live wallpapers, save media on different devices and
              solve common Pinterest download problems.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.href}>
                  <Link
                    href={post.href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/30"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={post.image}
                        alt={post.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <span className="inline-flex w-fit rounded-full bg-accent-pink/10 px-2.5 py-1 text-xs font-semibold text-accent-pink">
                        {post.label}
                      </span>

                      <h2 className="mt-4 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-accent-pink">
                        {post.title}
                      </h2>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                        {post.description}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-pink transition-all group-hover:gap-2.5">
                        Read Guide
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-7 text-center sm:px-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Need to Download Pinterest Media?
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600">
                Open Download Pin Video, paste a supported public Pinterest
                link and download the available video, image or GIF through
                your browser.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent-pink px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/30"
              >
                Open Pinterest Downloader
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}