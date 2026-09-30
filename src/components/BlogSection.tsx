import Image from "next/image";
import Link from "next/link";

const posts = [
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
    title: "How to Save GIFs from Pinterest on iPhone, Android and PC",
    description:
      "Learn how to save Pinterest GIFs on iPhone, Android, PC and Mac, find downloaded files and fix common GIF saving problems.",
    href: "/blog/how-to-save-gifs-from-pinterest",
    label: "Pinterest GIF Guide",
    image: "/blog/how-to-save-gifs-from-pinterest.webp",
    alt: "How to save GIFs from Pinterest guide",
  },
];

export default function BlogSection() {
  return (
    <section
      id="blog"
      className="scroll-mt-24 border-t border-slate-100 bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
            Helpful Guides
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Pinterest Download Guides
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Simple guides to help you download Pinterest videos, images and
            GIFs, solve common issues and use Download Pin Video on different
            devices.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
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
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <span className="inline-flex w-fit rounded-full bg-accent-pink/10 px-2.5 py-1 text-xs font-semibold text-accent-pink">
                    {post.label}
                  </span>

                  <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-accent-pink">
                    {post.title}
                  </h3>

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
      </div>
    </section>
  );
}