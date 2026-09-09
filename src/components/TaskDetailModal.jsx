import { useEffect, useState } from 'react';
import { STATUSES, STATUS_LABELS, PRIORITIES, formatDate } from '../utils/taskMeta';
import * as taskService from '../services/taskService';
import ErrorMessage from './ErrorMessage';
import ConfirmDialog from './ConfirmDialog';

// Admins can edit every field. Regular users may only change status, and
// only when they are the task's assignee — mirrored here for UX, but the
// backend is the actual enforcement point (see updateTask controller).
export default function TaskDetailModal({ open, task, currentUser, isAdmin, onClose, onUpdated, onDeleted }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
      setError(null);
    }
  }, [task]);

  if (!open || !task || !form) return null;

  const isAssignee = task.assignedTo?._id === currentUser?.id;
  const canEditAllFields = isAdmin;
  const canEditStatus = isAdmin || isAssignee;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = canEditAllFields
        ? {
            title: form.title.trim(),
            description: form.description.trim(),
            status: form.status,
            priority: form.priority,
            dueDate: form.dueDate || undefined,
          }
        : { status: form.status }; // regular users may only ever send status

      const updated = await taskService.updateTask(task._id, payload);
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskService.deleteTask(task._id);
      onDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">Task details</h2>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 px-5 py-4">
          {error && <ErrorMessage message={error.message} errors={error.errors} />}

          {!canEditAllFields && (
            <p className="rounded-lg bg-paper px-3 py-2 text-xs text-ink-soft">
              {isAssignee
                ? 'You can update this task\u2019s status. Other fields are managed by an admin.'
                : 'This task is read-only for you \u2014 only the assigned person or an admin can update it.'}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Title</label>
            <input
              value={form.title}
              onChange={handleChange('title')}
              disabled={!canEditAllFields}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-paper disabled:text-ink-soft focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              disabled={!canEditAllFields}
              rows={4}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-paper disabled:text-ink-soft focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Status</label>
              <select
                value={form.status}
                onChange={handleChange('status')}
                disabled={!canEditStatus}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-paper disabled:text-ink-soft focus:border-accent"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Priority</label>
              <select
                value={form.priority}
                onChange={handleChange('priority')}
                disabled={!canEditAllFields}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-paper disabled:text-ink-soft focus:border-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={handleChange('dueDate')}
              disabled={!canEditAllFields}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-paper disabled:text-ink-soft focus:border-accent"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-paper px-3.5 py-3 text-xs text-ink-soft">
            <div>
              <dt className="font-medium text-ink">Board</dt>
              <dd>{task.board?.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Assigned to</dt>
              <dd>{task.assignedTo?.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Created by</dt>
              <dd>{task.createdBy?.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Created</dt>
              <dd>{formatDate(task.createdAt)}</dd>
            </div>
            {task.updatedAt && (
              <div>
                <dt className="font-medium text-ink">Last updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            )}
          </dl>

          <div className="flex items-center justify-between pt-1">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium text-high hover:text-high/80"
              >
                Delete task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper">
                Close
              </button>
              {canEditStatus && (
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this task?"
        description="This can't be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
