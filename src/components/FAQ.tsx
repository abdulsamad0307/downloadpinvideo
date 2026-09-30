const faqs = [
  {
    question: "Is Download Pin Video free to use?",
    answer:
      "Yes. Download Pin Video is a free online Pinterest downloader for supported publicly accessible Pins. No payment, subscription or account is required.",
  },

  {
    question: "Do I need to create an account or install an app?",
    answer:
      "No. The downloader works directly in a modern web browser without registration or software installation. Copy a supported Pinterest Pin link, paste it into the tool and process the Pin.",
  },

  {
    question: "What Pinterest links are supported?",
    answer:
      "Download Pin Video supports publicly accessible Pinterest Pin URLs, including standard pinterest.com/pin/... links and supported pin.it short links that resolve to an available public Pin.",
  },

  {
    question: "Can I download private Pinterest Pins?",
    answer:
      "No. The tool only processes publicly accessible Pinterest Pins. Private, login-only, deleted, hidden or restricted content cannot be accessed or downloaded.",
  },

  {
    question: "What video quality can I download?",
    answer:
      "The available resolution and video quality depend on what Pinterest provides for that specific Pin. The downloader shows the available source quality instead of artificially increasing or relabeling the resolution.",
  },

  {
    question: "Can I download Pinterest videos in HD, 1080p or 4K?",
    answer:
      "Only when that quality is available from the original Pinterest source. Download Pin Video does not create HD, 1080p, 2K or 4K versions when the Pin does not provide them.",
  },

  {
    question: "Can I download Pinterest videos as MP4?",
    answer:
      "When a supported MP4 video source is available for the Pin, the downloader can provide it as a downloadable video file. The exact media format depends on what the Pinterest source provides.",
  },

  {
    question: "Can Download Pin Video download Pinterest images and GIFs too?",
    answer:
      "Yes. The tool can also detect and download supported Pinterest images, GIFs and animated media when they are available on a publicly accessible Pin.",
  },

  {
    question: "Does Download Pin Video work on iPhone and Android?",
    answer:
      "Yes. Download Pin Video works in modern browsers on iPhone, iPad and Android devices, as well as Windows PCs, Macs, tablets and desktop computers.",
  },

  {
    question: "Where are Pinterest downloads saved?",
    answer:
      "The save location depends on your device and browser. On iPhone and iPad, check the Files app and Downloads folder. On Android, check Downloads, Gallery, Google Photos or your file manager. On Windows and Mac, files are usually saved in the browser's Downloads folder.",
  },

  {
    question: "Why is my Pinterest video link not working?",
    answer:
      "The link may be incomplete, the Pin may be private, deleted or restricted, or the Pin may not contain supported downloadable media. Check that the Pinterest Pin opens publicly in your browser and try the complete Pin URL again.",
  },

  {
    question: "Is it safe to use Download Pin Video?",
    answer:
      "Download Pin Video does not require your Pinterest username or password to process supported public Pins. You should never need to provide Pinterest account credentials just to use the downloader.",
  },

  {
    question: "Can I reuse downloaded Pinterest content?",
    answer:
      "Downloading media does not automatically give you ownership or permission to reuse it. Respect creator rights, copyright, platform terms and any permissions required before reposting, editing or using downloaded content commercially.",
  },

  {
    question: "Is Download Pin Video affiliated with Pinterest?",
    answer:
      "No. Download Pin Video is an independent third-party tool and is not affiliated with, endorsed by or officially connected to Pinterest.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-slate-50/80 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-2 text-slate-600">
            Quick answers about Pinterest downloads, supported links, quality
            and using Download Pin Video.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className={`group px-5 sm:px-6 ${
                index > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-sm font-medium text-slate-900 transition-colors marker:content-none hover:text-accent-pink focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-pink/25 sm:py-5 sm:text-base">
                {faq.question}

                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all group-open:rotate-45 group-open:bg-accent-pink/10 group-open:text-accent-pink"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>

              <p className="pb-4 pr-10 text-sm leading-relaxed text-slate-600 sm:pb-5">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}