import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import TaskColumn from '../components/TaskColumn';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';
import { STATUSES } from '../utils/taskMeta';
import * as boardService from '../services/boardService';
import * as taskService from '../services/taskService';

export default function BoardView() {
  const { id: boardId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const admin = isAdmin(user);

  const [board, setBoard] = useState(null);
  const [boardError, setBoardError] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalCount: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    setBoardError(null);
    try {
      const data = await boardService.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      setBoardError(err);
    } finally {
      setBoardLoading(false);
    }
  }, [boardId]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await taskService.getBoardTasks(boardId, filters);
      setTasks(data.tasks);
      setPagination({ page: data.page, limit: data.limit, totalPages: data.totalPages, totalCount: data.totalCount });
    } catch (err) {
      setTasksError(err);
    } finally {
      setTasksLoading(false);
    }
  }, [boardId, filters]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const columns = useMemo(() => {
    const grouped = { Todo: [], InProgress: [], Done: [] };
    tasks.forEach((t) => {
      if (grouped[t.status]) grouped[t.status].push(t);
    });
    return grouped;
  }, [tasks]);

  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
  };
  const handleTaskUpdated = (task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
  };
  const handleTaskDeleted = (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  if (boardLoading) {
    return (
      <Layout>
        <LoadingSpinner label="Loading board" />
      </Layout>
    );
  }

  if (boardError) {
    return (
      <Layout>
        <ErrorMessage
          message={boardError.status === 403 ? 'You do not have access to this board.' : boardError.message}
          onRetry={loadBoard}
        />
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-sm font-medium text-accent hover:text-accent/80">
          ← Back to dashboard
        </button>
      </Layout>
    );
  }

  if (!board) return null;

  return (
    <Layout>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{board.title}</h1>
          {board.description && <p className="mt-0.5 max-w-xl text-sm text-ink-soft">{board.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          New task
        </button>
      </div>

      <div className="mb-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          members={board.members || []}
          loading={tasksLoading}
        />
      </div>

      {tasksError && <ErrorMessage message={tasksError.message} onRetry={loadTasks} />}

      {!tasksError && tasksLoading && tasks.length === 0 && <LoadingSpinner label="Loading tasks" />}

      {!tasksError && (!tasksLoading || tasks.length > 0) && (
        <>
          <div className="flex gap-4 sm:overflow-x-auto sm:pb-2 flex-col sm:flex-row">
            {STATUSES.map((status) => (
              <TaskColumn key={status} status={status} tasks={columns[status]} onOpenTask={setSelectedTask} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </>
      )}

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        boardId={boardId}
        boardMembers={board.members || []}
        currentUser={user}
        isAdmin={admin}
        onCreated={handleTaskCreated}
      />

      <TaskDetailModal
        open={Boolean(selectedTask)}
        task={selectedTask}
        currentUser={user}
        isAdmin={admin}
        onClose={() => setSelectedTask(null)}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
    </Layout>
  );
}
