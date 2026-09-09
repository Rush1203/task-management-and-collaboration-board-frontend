import { STATUSES, PRIORITIES, STATUS_LABELS } from '../utils/taskMeta';

// Only exposes the filters the backend actually supports on task list
// endpoints: status, priority, assignedTo (plus board, on the admin list).
export default function FilterBar({ filters, onChange, members = [], loading, showBoardFilter = false, boards = [] }) {
  const update = (key, value) => onChange({ ...filters, [key]: value || undefined, page: 1 });

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.assignedTo || filters.board);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select
        value={filters.status || ''}
        onChange={(e) => update('status', e.target.value)}
        className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => update('priority', e.target.value)}
        className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {members.length > 0 && (
        <select
          value={filters.assignedTo || ''}
          onChange={(e) => update('assignedTo', e.target.value)}
          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
        >
          <option value="">Anyone assigned</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      )}

      {showBoardFilter && (
        <select
          value={filters.board || ''}
          onChange={(e) => update('board', e.target.value)}
          className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink"
        >
          <option value="">All boards</option>
          {boards.map((b) => (
            <option key={b._id} value={b._id}>
              {b.title}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ page: 1 })}
          className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-accent hover:bg-accent-dim"
        >
          Clear filters
        </button>
      )}

      {loading && <span className="text-xs text-ink-soft">Updating…</span>}
    </div>
  );
}
