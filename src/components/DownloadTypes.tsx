const types = [
  {
    id: "video-downloader",

    title: "Pinterest Videos",

    description:
      "Download supported Pinterest videos in the available resolution and source quality.",

    button: "Download Video",

    href: "#hero",

    accent: "border-t-accent-pink",

    iconColor: "text-accent-pink",

    iconBg: "bg-accent-pink/10",

    cardBg: "from-accent-pink/[0.03] to-white",

    btnClass:
      "bg-accent-pink/10 text-accent-pink group-hover:bg-accent-pink/15 group-active:bg-accent-pink/20",

    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>
    ),
  },

  {
    id: "image-downloader",

    title: "Pinterest Images",

    description:
      "Download supported Pinterest images from public Pins in the quality provided by the source.",

    button: "Download Image",

    href: "/pinterest-image-downloader",

    accent: "border-t-accent-green",

    iconColor: "text-accent-green",

    iconBg: "bg-accent-green/10",

    cardBg: "from-accent-green/[0.03] to-white",

    btnClass:
      "bg-accent-green/10 text-accent-green group-hover:bg-accent-green/15 group-active:bg-accent-green/20",

    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H5.25A2.25 2.25 0 0 0 3 5.25v13.5A2.25 2.25 0 0 0 5.25 21Z"
        />
      </svg>
    ),
  },

  {
    id: "gif-downloader",

    title: "Pinterest GIFs",

    description:
      "Download supported Pinterest GIFs or animated media when they are available on a public Pin.",

    button: "Download GIF",

    href: "#hero",

    accent: "border-t-accent-purple",

    iconColor: "text-accent-purple",

    iconBg: "bg-accent-purple/10",

    cardBg: "from-accent-purple/[0.03] to-white",

    btnClass:
      "bg-accent-purple/10 text-accent-purple group-hover:bg-accent-purple/15 group-active:bg-accent-purple/20",

    icon: (
      <span className="text-[10px] font-bold tracking-wide">
        GIF
      </span>
    ),
  },
];

export default function DownloadTypes() {
  return (
    <section className="bg-slate-50/80 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Download Pinterest Videos, Images & GIFs
          </h2>

          <p className="mt-2 text-slate-600">
            Download Pin Video focuses on Pinterest video downloads while also
            supporting compatible images and GIFs when they are available on a
            public Pin.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {types.map((type) => (
            <a
              key={type.id}
              href={type.href}
              id={type.id}
              className={`group block cursor-pointer rounded-2xl border border-slate-200/80 border-t-[3px] bg-gradient-to-b ${type.cardBg} p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.995] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-pink/30 sm:p-6 ${type.accent}`}
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${type.iconBg} ${type.iconColor}`}
                aria-hidden="true"
              >
                {type.icon}
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {type.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {type.description}
              </p>

              <div
                className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 group-active:scale-[0.98] ${type.btnClass}`}
              >
                {type.button}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}