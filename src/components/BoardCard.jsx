import { Link } from 'react-router-dom';
import { Users, ListChecks } from 'lucide-react';
import { boardTabColor, TAB_BG_CLASS } from '../utils/boardTab';

// A board's tab color is derived from its id, not chosen randomly — so
// the same board always reads the same color across visits, giving each
// board a stable identity in a list rather than looking interchangeable.
export default function BoardCard({ board, taskCount }) {
  const memberCount = board.members?.length ?? 0;
  const tab = boardTabColor(board._id);

  return (
    <Link
      to={`/boards/${board._id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${TAB_BG_CLASS[tab]}`} aria-hidden="true" />

      <div className="flex flex-1 flex-col gap-3 py-4 pl-5 pr-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">
            {board.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {board.description || 'No description yet.'}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-line pt-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
            {memberCount}
          </span>
          {typeof taskCount === 'number' && (
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" strokeWidth={1.75} />
              {taskCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
