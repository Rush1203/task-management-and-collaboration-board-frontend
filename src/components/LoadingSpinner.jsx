export default function LoadingSpinner({ label = 'Loading', size = 'md' }) {
  const dims = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-9 w-9 border-[3px]' : 'h-6 w-6 border-2';
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-ink-soft" role="status" aria-live="polite">
      <span className={`inline-block ${dims} animate-spin rounded-full border-line border-t-accent`} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
