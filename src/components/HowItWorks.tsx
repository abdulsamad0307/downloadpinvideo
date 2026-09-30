const steps = [
  {
    number: "1",
    title: "Copy the Pinterest Link",
    description:
      "Open the Pinterest Pin you want to save. On mobile, use Share and choose Copy Link. On desktop, copy the Pin URL from your browser.",
    iconBg: "bg-accent-pink/10",
    iconColor: "text-accent-pink",
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
          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 1.927-.184"
        />
      </svg>
    ),
  },

  {
    number: "2",
    title: "Paste & Process",
    description:
      "Paste the public Pinterest Pin URL or supported pin.it link into Download Pin Video and let the downloader check what media is available.",
    iconBg: "bg-accent-purple/10",
    iconColor: "text-accent-purple",
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
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
        />
      </svg>
    ),
  },

  {
    number: "3",
    title: "Review & Download",
    description:
      "Review the available media and source quality, then tap or click Download. Your browser saves the file to your device.",
    iconBg: "bg-accent-green/10",
    iconColor: "text-accent-green",
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
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
];

function StepArrow() {
  return (
    <div
      className="hidden shrink-0 items-center justify-center self-center px-1 lg:flex"
      aria-hidden="true"
    >
      <svg
        className="h-5 w-5 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
        />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            How to Download Pinterest Videos with Download Pin Video
          </h2>

          <p className="mt-2 text-slate-600">
            Copy a public Pinterest Pin link, paste it into the downloader and
            save the available media in three simple steps.
          </p>
        </div>

        <ol className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map((step, index) => (
            <li key={step.number} className="contents">
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg} ${step.iconColor}`}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </div>

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-400 ring-1 ring-slate-200">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && <StepArrow />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}