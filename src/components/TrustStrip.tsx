const items = [
  {
    title: "Fast Processing",
    description: "Quick link-to-download flow",
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
    title: "No Pinterest Login",
    description: "Public Pins only",
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
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },

  {
    title: "Works Across Devices",
    description: "iPhone, Android, PC & Mac",
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
          d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    ),
  },

  {
    title: "No Registration",
    description: "No account required",
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
];

export default function TrustStrip() {
  return (
    <section
      aria-label="Key Download Pin Video benefits"
      className="border-y border-slate-100 bg-white/70"
    >
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:flex-col sm:items-center sm:p-4 sm:text-center"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor} sm:h-10 sm:w-10`}
                aria-hidden="true"
              >
                {item.icon}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>

                <p className="mt-0.5 text-xs leading-snug text-slate-500 sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}