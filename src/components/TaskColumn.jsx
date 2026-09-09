import { memo } from 'react';
import TaskCard from './TaskCard';
import { STATUS_LABELS, STATUS_ACCENT } from '../utils/taskMeta';

function TaskColumn({ status, tasks, onOpenTask }) {
  return (
    <div className="flex w-full flex-col rounded-xl bg-white/60 sm:min-w-[260px] sm:flex-1">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
        <span className={`h-2 w-2 rounded-full ${STATUS_ACCENT[status]}`} />
        <h3 className="text-sm font-semibold text-ink">{STATUS_LABELS[status]}</h3>
        <span className="ml-auto text-xs text-ink-soft">{tasks.length}</span>
      </div>

      <div className="scrollbar-thin flex flex-col gap-2.5 p-3 sm:max-h-[70vh] sm:overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-ink-soft">Nothing here</p>
        ) : (
          tasks.map((task) => <TaskCard key={task._id} task={task} onOpen={onOpenTask} />)
        )}
      </div>
    </div>
  );
}

export default memo(TaskColumn);
