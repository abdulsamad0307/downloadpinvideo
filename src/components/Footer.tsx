import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },

  { href: "/#hero", label: "Video Downloader" },

  { href: "/pinterest-image-downloader", label: "Image Downloader" },

  { href: "/#hero", label: "GIF Downloader" },

  { href: "/blog", label: "Blog" },
];

const companyLinks = [
  { href: "/#about", label: "About Us" },

  { href: "#disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-pink text-xs font-bold text-white"
                aria-hidden="true"
              >
                D
              </div>

              <h2 className="text-lg font-semibold text-white">
                Download Pin Video
              </h2>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Download Pin Video is an independent Pinterest downloader for
              public videos, images and GIFs. Simple, browser-based and free to
              use.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              Company / Legal
            </h3>

            <ul className="mt-5 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div id="disclaimer">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300">
              Disclaimer
            </h3>

            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Download Pin Video is an independent third-party tool and is not
              affiliated with Pinterest. Users are responsible for respecting
              applicable copyright, platform terms and content permissions.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800/80 pt-7 text-center text-sm text-slate-500">
          &copy; 2026 Download Pin Video. All rights reserved.
        </div>
      </div>
    </footer>
  );
}