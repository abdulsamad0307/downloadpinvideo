const benefits = [
  {
    title: "Available Source Quality",
    description:
      "Review the resolution and source quality Pinterest provides before downloading.",
    iconBg: "bg-accent-pink/10",
    iconColor: "text-accent-pink",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
        />
      </svg>
    ),
  },

  {
    title: "Fast Processing",
    description:
      "Paste a supported Pinterest Pin link and let Download Pin Video quickly check the available media.",
    iconBg: "bg-accent-purple/10",
    iconColor: "text-accent-purple",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },

  {
    title: "Simple Browser Flow",
    description:
      "No complicated setup — copy the Pin link, paste it into the downloader and save the available media through your browser.",
    iconBg: "bg-accent-blue/10",
    iconColor: "text-accent-blue",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },

  {
    title: "No Account Required",
    description:
      "Use Download Pin Video without creating an account or providing Pinterest login credentials.",
    iconBg: "bg-accent-green/10",
    iconColor: "text-accent-green",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },

  {
    title: "Works Across Devices",
    description:
      "Use the downloader in modern browsers on iPhone, Android, tablets, Windows PCs and Macs.",
    iconBg: "bg-accent-orange/10",
    iconColor: "text-accent-orange",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.75}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Why Choose Download Pin Video
          </h2>

          <p className="mt-2 text-slate-600">
            A simple Pinterest downloader focused on clear results, available
            source quality and easy browser-based downloads.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-white p-4 shadow-sm"
            >
              <div
                className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${benefit.iconBg} ${benefit.iconColor}`}
                aria-hidden="true"
              >
                {benefit.icon}
              </div>

              <h3 className="text-sm font-semibold leading-snug text-slate-900">
                {benefit.title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}