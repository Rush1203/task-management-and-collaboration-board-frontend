import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import BoardForm from '../components/BoardForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import * as userService from '../services/userService';
import * as boardService from '../services/boardService';

export default function EditBoard() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([boardService.getBoard(boardId), userService.getUsers()])
      .then(([boardData, usersData]) => {
        setBoard(boardData);
        setUsers(usersData);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [boardId]);

  const handleSubmit = async ({ title, description, members: newMemberIds }) => {
    // Title/description go through the board update endpoint.
    await boardService.updateBoard(boardId, { title, description });

    // Membership changes go through the dedicated member endpoints so
    // each change is a discrete, backend-verified operation rather than a
    // silent local diff — matching how the backend actually models it.
    const currentIds = (board.members || []).map((m) => m._id);
    const toAdd = newMemberIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !newMemberIds.includes(id));

    for (const userId of toAdd) {
      await boardService.addMember(boardId, userId); // eslint-disable-line no-await-in-loop
    }
    for (const userId of toRemove) {
      await boardService.removeMember(boardId, userId); // eslint-disable-line no-await-in-loop
    }

    setSuccess(true);
    setTimeout(() => navigate('/admin/boards'), 900);
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <h1 className="mb-1 text-xl font-semibold text-ink">Edit board</h1>
          <p className="mb-5 text-sm text-ink-soft">Update board details and membership.</p>

          {loading && <LoadingSpinner label="Loading board" />}
          {!loading && error && <ErrorMessage message={error.message} />}
          {success && (
            <p className="mb-4 rounded-lg border border-done/30 bg-done/5 px-3 py-2 text-sm text-done">
              Board updated. Taking you back to all boards…
            </p>
          )}
          {!loading && !error && board && (
            <BoardForm
              initialValues={{
                title: board.title,
                description: board.description,
                memberIds: (board.members || []).map((m) => m._id),
              }}
              users={users}
              submitLabel="Save changes"
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
