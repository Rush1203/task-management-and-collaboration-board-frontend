import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import BoardForm from '../components/BoardForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import * as userService from '../services/userService';
import * as boardService from '../services/boardService';

export default function CreateBoard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    userService
      .getUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async ({ title, description, members }) => {
    // The owner is never sent from the client — the backend sets it from
    // the authenticated admin automatically.
    const board = await boardService.createBoard({ title, description, members });
    navigate(`/boards/${board._id}`);
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <h1 className="mb-1 text-xl font-semibold text-ink">New board</h1>
          <p className="mb-5 text-sm text-ink-soft">Pick who should have access. You can change this later.</p>

          {loading && <LoadingSpinner label="Loading users" />}
          {!loading && error && <ErrorMessage message={error.message} />}
          {!loading && !error && (
            <BoardForm users={users} submitLabel="Create board" onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </Layout>
  );
}
