export default function Pagination({ page, totalPages, totalCount, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 py-3 text-sm text-ink-soft">
      <span>
        Page {page} of {totalPages} · {totalCount} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-paper"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-line px-3 py-1.5 font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-paper"
        >
          Next
        </button>
      </div>
    </div>
  );
}
