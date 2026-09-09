import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

// Shared by /admin/boards/create and /admin/boards/:id/edit. `users` is the
// full registered-user list (admin-only endpoint) used to pick members —
// the backend determines the board owner automatically from the
// authenticated admin, so there's no owner field here at all.
export default function BoardForm({ initialValues, users, submitLabel, onSubmit }) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [memberIds, setMemberIds] = useState(initialValues?.memberIds || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleMember = (id) => {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError({ message: 'A board title is required.' });
      return;
    }
    if (title.trim().length > 100) {
      setError({ message: 'Board title cannot exceed 100 characters.' });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), members: memberIds });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {error && <ErrorMessage message={error.message} errors={error.errors} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
          placeholder="e.g. Product Launch Q3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
          placeholder="Optional context for this board…"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Members</label>
        <div className="scrollbar-thin max-h-56 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
          {users.length === 0 ? (
            <p className="px-2 py-3 text-sm text-ink-soft">No users available.</p>
          ) : (
            users.map((u) => (
              <label key={u._id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-paper">
                <input
                  type="checkbox"
                  checked={memberIds.includes(u._id)}
                  onChange={() => toggleMember(u._id)}
                  className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                />
                <span className="text-sm text-ink">{u.name}</span>
                <span className="text-xs text-ink-soft">{u.email}</span>
              </label>
            ))
          )}
        </div>
        <p className="mt-1 text-xs text-ink-soft">{memberIds.length} selected</p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
