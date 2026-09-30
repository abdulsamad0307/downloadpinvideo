const supportedItems = [
    {
      title: "Public Pinterest Pins",
      description:
        "Download Pin Video can process supported publicly accessible Pinterest Pin URLs.",
      supported: true,
    },
  
    {
      title: "Short pin.it Links",
      description:
        "Pinterest short share links such as pin.it URLs are supported when they resolve to an available public Pin.",
      supported: true,
    },
  
    {
      title: "Videos, Images & GIFs",
      description:
        "The downloader checks the public Pin and shows supported video, image or GIF media when available.",
      supported: true,
    },
  
    {
      title: "Private or Login-Only Pins",
      description:
        "Private, restricted or login-only Pinterest content cannot be processed.",
      supported: false,
    },
  
    {
      title: "Deleted or Unavailable Pins",
      description:
        "Pins that have been removed, deleted or are no longer publicly available cannot be downloaded.",
      supported: false,
    },
  
    {
      title: "Restricted Content",
      description:
        "Download Pin Video does not bypass Pinterest access controls, account restrictions or content permissions.",
      supported: false,
    },
  ];
  
  export default function SupportedLinks() {
    return (
      <section className="border-y border-slate-100 bg-slate-50/50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
              Supported Pinterest Links
            </p>
  
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              What Download Pin Video Can and Cannot Process
            </h2>
  
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Download Pin Video is designed for supported publicly accessible
              Pinterest Pins. Media availability depends on what the original Pin
              provides.
            </p>
          </div>
  
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supportedItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    item.supported
                      ? "bg-accent-green/10 text-accent-green"
                      : "bg-slate-100 text-slate-500"
                  }`}
                  aria-hidden="true"
                >
                  {item.supported ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  ) : (
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
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
  
                <h3 className="mt-4 text-sm font-semibold text-slate-900 sm:text-base">
                  {item.title}
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
  
          <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-6 text-slate-500 sm:text-sm">
            Download Pin Video does not require access to your Pinterest account
            and does not provide a way to bypass private or restricted content.
          </p>
        </div>
      </section>
    );
  }