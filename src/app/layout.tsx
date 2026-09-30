import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://downloadpinvideo.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title:
    "Pinterest Video Downloader – Free Online Video Download | Download Pin Video",

  description:
    "Download Pin Video is a free online Pinterest video downloader for public Pins. Save available Pinterest videos quickly on iPhone, Android, Windows and Mac.",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    other: {
      "p:domain_verify": "5ea269a8745b13bfd949c7a841afc0c6",
    },
  },

  openGraph: {
    title:
      "Pinterest Video Downloader – Free Online Tool | Download Pin Video",

    description:
      "Use Download Pin Video to save available Pinterest videos from public Pins. Simple, browser-based and easy to use on mobile and desktop.",

    url: "/",
    siteName: "Download Pin Video",
    type: "website",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Pinterest Video Downloader – Free Online Tool | Download Pin Video",

    description:
      "Use Download Pin Video to save available Pinterest videos from public Pins on mobile and desktop.",
  },
};

const structuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,

      name: "Download Pin Video",

      url: siteUrl,

      description:
        "Download Pin Video is an independent online Pinterest downloader for publicly accessible video, image and GIF content.",

      sameAs: [
        "https://www.instagram.com/downloadpinvideo/",
        "https://www.pinterest.com/downloadpinvideo/",
        "https://x.com/downloadpinvideo",
        "https://www.youtube.com/@downloadpinvideo",
        "https://www.tiktok.com/@downloadpinvideo",
        "https://www.linkedin.com/company/downloadpinvideo/",
        "https://www.threads.com/@downloadpinvideo",
        "https://www.reddit.com/user/downloadpinvideo/",
        "https://www.quora.com/profile/Download-Pinvideo",
      ],
    },

    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,

      name: "Download Pin Video",

      url: siteUrl,

      publisher: {
        "@id": `${siteUrl}/#organization`,
      },

      description:
        "Download Pin Video helps users download publicly accessible Pinterest videos online in the available source quality.",

      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9791276952981956"
          crossOrigin="anonymous"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>

      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}