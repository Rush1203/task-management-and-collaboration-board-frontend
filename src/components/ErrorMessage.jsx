export default function ErrorMessage({ message, errors = [], onRetry }) {
  if (!message && errors.length === 0) return null;
  return (
    <div className="rounded-lg border border-high/30 bg-high/5 px-4 py-3 text-sm text-high" role="alert">
      <p className="font-medium">{message || 'Something went wrong.'}</p>
      {errors.length > 0 && (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-medium underline underline-offset-2 hover:text-high/80"
        >
          Try again
        </button>
      )}
    </div>
  );
}
