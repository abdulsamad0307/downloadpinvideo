"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Can I convert any Pinterest video to MP4?",
    answer:
      "Not every Pin can be downloaded. The Pinterest video must be publicly accessible and contain supported video media.",
  },

  {
    question: "Does Download Pin Video reduce Pinterest video quality?",
    answer:
      "Download Pin Video aims to provide the available source quality. The final quality depends on what is available for that specific Pinterest Pin.",
  },

  {
    question: "Can I download Pinterest videos without installing software?",
    answer:
      "Yes. The downloader works directly in a modern browser, so no separate desktop software or mobile app is required.",
  },

  {
    question: "Can I download a pin.it link?",
    answer:
      "Supported pin.it links can be processed when they resolve to a publicly accessible Pinterest Pin containing supported media.",
  },

  {
    question: "Where does the downloaded MP4 file go?",
    answer:
      "On desktop, it usually appears in your browser's Downloads folder. On mobile devices, the save location depends on your browser and operating system.",
  },
];

export default function BlogFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.question}
            className="border-b border-slate-100 last:border-b-0"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-slate-900">
                {faq.question}
              </span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-500">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 sm:px-6">
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}