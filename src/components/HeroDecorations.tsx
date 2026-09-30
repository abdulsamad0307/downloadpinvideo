export default function HeroDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft pink/purple glow */}
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[min(100%,520px)] -translate-x-1/2 -translate-y-[55%] rounded-full bg-gradient-to-br from-accent-pink/[0.07] via-accent-purple/[0.05] to-transparent blur-3xl" />

      {/* Decorative media icons */}
      <svg
        className="absolute left-[6%] top-[18%] h-8 w-8 text-accent-pink/20 sm:left-[10%] sm:h-10 sm:w-10"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.25}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
        />
      </svg>

      <svg
        className="absolute right-[6%] top-[22%] h-7 w-7 text-accent-green/25 sm:right-[12%] sm:h-9 sm:w-9"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.25}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H5.25A2.25 2.25 0 0 0 3 5.25v13.5A2.25 2.25 0 0 0 5.25 21Z"
        />
      </svg>

      <svg
        className="absolute bottom-[20%] left-[12%] hidden h-8 w-8 text-accent-purple/20 sm:block"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.25}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
        />
      </svg>

      <svg
        className="absolute bottom-[24%] right-[8%] h-6 w-6 text-accent-blue/25 sm:right-[14%] sm:h-8 sm:w-8"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.25}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    </div>
  );
}
