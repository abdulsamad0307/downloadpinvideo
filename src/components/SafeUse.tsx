export default function SafeUse() {
    return (
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">
                Safe & Responsible Use
              </p>
  
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Use Download Pin Video with Public and Permitted Content
              </h2>
  
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Download Pin Video is designed to process supported publicly
                accessible Pinterest links without requiring your Pinterest
                username or password.
              </p>
            </div>
  
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  No Pinterest Login Required
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You do not need to provide Pinterest account credentials to
                  process a supported public Pin.
                </p>
              </div>
  
              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  Public Content Only
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Private, restricted, deleted and login-only Pinterest content
                  is not supported.
                </p>
              </div>
  
              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  Respect Creator Rights
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  A publicly visible Pin is not automatically free to reuse.
                  Download only content you own or are permitted to save and use.
                </p>
              </div>
  
              <div className="rounded-xl bg-slate-50 p-5">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  Independent Tool
                </h3>
  
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Download Pin Video is an independent third-party tool and is not
                  affiliated with or endorsed by Pinterest.
                </p>
              </div>
            </div>
  
            <p className="mt-7 text-center text-xs leading-6 text-slate-500 sm:text-sm">
              Downloading media does not give you ownership or permission to
              republish, edit or commercially use content that belongs to someone
              else.
            </p>
          </div>
        </div>
      </section>
    );
  }