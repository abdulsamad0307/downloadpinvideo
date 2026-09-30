type ErrorMessageProps = {
  message: string;
  onHelpClick?: () => void;
};

export default function ErrorMessage({
  message,
  onHelpClick,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onHelpClick}
        className="mt-2 text-sm font-medium text-accent-pink underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-accent-pink/30"
      >
        How to copy a Pinterest link
      </button>
    </div>
  );
}
