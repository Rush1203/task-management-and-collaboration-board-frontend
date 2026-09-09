import { memo } from 'react';
import { PRIORITY_DOT, initials, formatDate } from '../utils/taskMeta';

// Memoized so re-renders of a task's board don't force every unrelated
// card to re-render.
function TaskCard({ task, onOpen }) {
  const dueDate = formatDate(task.dueDate);
  const assignee = task.assignedTo;

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="flex w-full flex-col gap-2.5 rounded-lg border border-line bg-white p-3.5 text-left shadow-card transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} title={`${task.priority} priority`} />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>{dueDate || 'No due date'}</span>
        {assignee && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-dim text-[10px] font-semibold text-accent-ink"
            title={assignee.name}
          >
            {initials(assignee.name)}
          </span>
        )}
      </div>
    </button>
  );
}

export default memo(TaskCard);
