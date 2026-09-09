import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import UserTable from '../components/UserTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await userService.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <Layout>
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <h1 className="mb-1 text-xl font-semibold text-ink">Users</h1>
          <p className="mb-5 text-sm text-ink-soft">Everyone registered in the workspace.</p>

          {loading && <LoadingSpinner label="Loading users" />}
          {!loading && error && <ErrorMessage message={error.message} onRetry={load} />}
          {!loading && !error && users.length === 0 && <EmptyState title="No users found." />}
          {!loading && !error && users.length > 0 && (
            <UserTable users={users} currentUserId={currentUser?.id} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </Layout>
  );
}
