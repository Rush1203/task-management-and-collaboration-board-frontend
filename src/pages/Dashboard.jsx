import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, ListChecks } from 'lucide-react';
import Layout from '../components/Layout';
import BoardCard from '../components/BoardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';
import * as boardService from '../services/boardService';
import * as taskService from '../services/taskService';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// GET /api/boards already returns the right scope from the backend:
// admins see every board, regular users see only boards where they're a
// member — so this page doesn't need any client-side filtering logic.
export default function Dashboard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [assignedToMe, setAssignedToMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getBoards();
      setBoards(data);

      // Real per-board task counts, derived from the existing task list
      // endpoint's totalCount (limit=1 keeps each request light) — never
      // fabricated client-side.
      const counts = {};
      let myTotal = 0;
      await Promise.all(
        data.map(async (b) => {
          try {
            const result = await taskService.getBoardTasks(b._id, { limit: 1, page: 1 });
            counts[b._id] = result.totalCount;

            const mine = await taskService.getBoardTasks(b._id, { assignedTo: user.id, limit: 1, page: 1 });
            myTotal += mine.totalCount;
          } catch {
            counts[b._id] = null;
          }
        })
      );
      setTaskCounts(counts);
      setAssignedToMe(myTotal);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalTasks = useMemo(
    () => Object.values(taskCounts).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0),
    [taskCounts]
  );

  const firstName = user?.name?.split(' ')[0];

  return (
    <Layout>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isAdmin(user)
              ? 'Here\u2019s everything moving across the workspace.'
              : 'Here\u2019s what\u2019s moving across your boards.'}
          </p>
        </div>

        {!loading && !error && boards.length > 0 && (
          <div className="flex gap-6">
            <div>
              <p className="flex items-baseline gap-1.5 text-2xl font-semibold tabular-nums text-ink">
                <LayoutGrid className="mb-0.5 h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                {boards.length}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">{isAdmin(user) ? 'boards' : 'your boards'}</p>
            </div>
            <div>
              <p className="flex items-baseline gap-1.5 text-2xl font-semibold tabular-nums text-ink">
                <ListChecks className="mb-0.5 h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                {totalTasks}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">total tasks</p>
            </div>
            {assignedToMe !== null && (
              <div>
                <p className="text-2xl font-semibold tabular-nums text-accent">{assignedToMe}</p>
                <p className="mt-0.5 text-xs text-ink-soft">assigned to you</p>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner label="Loading boards" />}

      {!loading && error && <ErrorMessage message={error.message} onRetry={load} />}

      {!loading && !error && boards.length === 0 && (
        <EmptyState
          title="No boards available."
          description={isAdmin(user) ? 'Create a board to get your team started.' : 'Ask an admin to add you to a board.'}
        />
      )}

      {!loading && !error && boards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board._id} board={board} taskCount={taskCounts[board._id]} />
          ))}
        </div>
      )}
    </Layout>
  );
}
