"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const isHomePage = pathname === "/";

  const isImageDownloaderPage =
    pathname === "/pinterest-image-downloader";

  const isBlogArticle =
    pathname.startsWith("/blog/") && pathname !== "/blog/";

  const navLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href:
        isHomePage || isImageDownloaderPage
          ? "#how-it-works"
          : "/#how-it-works",
      label: "How It Works",
    },
    {
      href:
        isHomePage || isImageDownloaderPage || isBlogArticle
          ? "#faq"
          : "/#faq",
      label: "FAQ",
    },
    {
      href: "/blog",
      label: "Blog",
    },
    {
      href:
        isHomePage || isImageDownloaderPage
          ? "#about"
          : "/#about",
      label: "About Us",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-pink text-sm font-bold text-white shadow-sm"
            aria-hidden="true"
          >
            D
          </div>

          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">
              Download Pin Video
            </div>

            <div className="truncate text-xs text-slate-500">
              Pinterest Downloader
            </div>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(event) => {
                if (link.href.startsWith("#")) {
                  event.preventDefault();

                  const section = document.getElementById(
                    link.href.slice(1),
                  );

                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }
              }}
              className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="sr-only">
            Language
          </label>

          <select
            id="language-select"
            defaultValue="en"
            className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-pink/20 sm:block"
          >
            <option value="en">English</option>
          </select>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent-pink/20 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                onClick={(event) => {
                  if (link.href.startsWith("#")) {
                    event.preventDefault();

                    const section = document.getElementById(
                      link.href.slice(1),
                    );

                    if (section) {
                      section.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }

                  setMenuOpen(false);
                }}
              >
                {link.label}
              </Link>
            ))}

            <label htmlFor="language-select-mobile" className="sr-only">
              Language
            </label>

            <select
              id="language-select-mobile"
              defaultValue="en"
              className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-pink/20"
            >
              <option value="en">English</option>
            </select>
          </div>
        </nav>
      )}
    </header>
  );
}