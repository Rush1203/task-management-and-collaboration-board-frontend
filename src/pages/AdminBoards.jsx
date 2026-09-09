import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import * as boardService from '../services/boardService';
import * as taskService from '../services/taskService';

export default function AdminBoards() {
  const [boards, setBoards] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await boardService.getBoards();
      setBoards(data);

      // The board object itself doesn't carry a task count, so we ask the
      // real task-list endpoint for each board's totalCount (limit=1 keeps
      // the payload minimal) rather than inventing a number client-side.
      const counts = {};
      await Promise.all(
        data.map(async (b) => {
          try {
            const result = await taskService.getBoardTasks(b._id, { limit: 1, page: 1 });
            counts[b._id] = result.totalCount;
          } catch {
            counts[b._id] = null;
          }
        })
      );
      setTaskCounts(counts);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await boardService.deleteBoard(pendingDelete._id);
      setBoards((prev) => prev.filter((b) => b._id !== pendingDelete._id));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-ink">Boards</h1>
              <p className="text-sm text-ink-soft">Every board across the workspace.</p>
            </div>
            <Link
              to="/admin/boards/create"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              New board
            </Link>
          </div>

          {loading && <LoadingSpinner label="Loading boards" />}
          {!loading && error && <ErrorMessage message={error.message} onRetry={load} />}
          {!loading && !error && boards.length === 0 && <EmptyState title="No boards available." />}

          {!loading && !error && boards.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-soft">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Members</th>
                    <th className="px-4 py-3 font-medium">Tasks</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map((b) => (
                    <tr key={b._id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">
                        <Link to={`/boards/${b._id}`} className="font-medium text-ink hover:text-accent">
                          {b.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{b.owner?.name}</td>
                      <td className="px-4 py-3 text-ink-soft">{b.members?.length ?? 0}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {taskCounts[b._id] ?? <span className="text-ink-soft/60">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <Link to={`/admin/boards/${b._id}/edit`} className="text-sm font-medium text-accent hover:text-accent/80">
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(b)}
                            className="text-sm font-medium text-high hover:text-high/80"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This also deletes every task on this board. This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Layout>
  );
}
