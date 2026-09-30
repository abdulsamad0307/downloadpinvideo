const locations = [
    {
      title: "iPhone & iPad",
      description:
        "Safari downloads usually appear in the Files app under Downloads. From there, you can move supported media to Photos if needed.",
    },
    {
      title: "Android",
      description:
        "Downloaded files usually appear in Downloads, Gallery, Google Photos or your phone's file manager depending on your browser and device.",
    },
    {
      title: "Windows PC",
      description:
        "Most browsers save downloaded Pinterest media to the Downloads folder unless you have changed the default save location.",
    },
    {
      title: "Mac",
      description:
        "Safari, Chrome and other browsers usually save downloaded files to your Downloads folder unless a different location is selected.",
    },
  ];
  
  export default function DownloadLocations() {
    return (
      <section className="border-y border-slate-100 bg-slate-50/50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
              Download Locations
            </p>
  
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Where Are Pinterest Downloads Saved?
            </h2>
  
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Your browser decides where downloaded files are stored. The exact
              location can vary slightly by device, browser and settings.
            </p>
          </div>
  
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {locations.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue"
                  aria-hidden="true"
                >
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
                      d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5.25 19.5h13.5"
                    />
                  </svg>
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
            If you cannot find a downloaded file, check your browser's download
            history first. It usually shows the file name and save location.
          </p>
        </div>
      </section>
    );
  }