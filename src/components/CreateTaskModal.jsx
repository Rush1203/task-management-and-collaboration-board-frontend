import { useEffect, useMemo, useState } from 'react';
import { PRIORITIES } from '../utils/taskMeta';
import * as taskService from '../services/taskService';
import * as aiService from '../services/aiService';
import * as userService from '../services/userService';
import ErrorMessage from './ErrorMessage';

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
  assignedTo: '',
};

// Used by both regular users (assignee limited to the current board's
// members) and admins (assignee can be any registered user, per the
// backend's task-creation rule). `boardMembers` always comes from the
// board already loaded in BoardView; admins additionally get the full
// user list loaded here since they're allowed to assign beyond the board.
export default function CreateTaskModal({ open, onClose, boardId, boardMembers, currentUser, isAdmin, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [assignees, setAssignees] = useState(boardMembers || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError(null);
    setAiOpen(false);
    setAiSuggestions(null);
    setAiError(null);
    setAiTitle('');
    setAiDescription('');

    if (isAdmin) {
      // Admins may assign to any registered user, not just board members.
      userService
        .getUsers()
        .then(setAssignees)
        .catch(() => setAssignees(boardMembers || []));
    } else {
      setAssignees(boardMembers || []);
    }
  }, [open, isAdmin, boardMembers]);

  const assigneeOptions = useMemo(() => {
    // Always guarantee "assign to myself" is available even if the members
    // list hasn't loaded yet.
    const hasSelf = assignees.some((u) => u._id === currentUser?.id);
    return hasSelf || !currentUser ? assignees : [{ _id: currentUser.id, name: `${currentUser.name} (you)` }, ...assignees];
  }, [assignees, currentUser]);

  if (!open) return null;

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError({ message: 'A task title is required.' });
      return;
    }
    if (!form.assignedTo) {
      setError({ message: 'Please choose who this task is assigned to.' });
      return;
    }

    setSubmitting(true);
    try {
      const task = await taskService.createTask(boardId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo,
      });
      onCreated(task);
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const runAiAssistant = async () => {
    if (!aiTitle.trim()) {
      setAiError({ message: 'Enter a task title first so the assistant has something to work with.' });
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions(null);
    try {
      const suggestions = await aiService.getTaskSuggestions({
        title: aiTitle.trim(),
        description: aiDescription.trim() || undefined,
      });
      setAiSuggestions(suggestions);
    } catch (err) {
      setAiError({ message: 'Unable to generate AI suggestions. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  const applyDescription = () => {
    if (!aiSuggestions) return;
    setForm((f) => ({ ...f, description: aiSuggestions.suggestedDescription }));
  };

  const applyPriority = () => {
    if (!aiSuggestions) return;
    setForm((f) => ({ ...f, priority: aiSuggestions.suggestedPriority }));
  };

  const applyAll = () => {
    if (!aiSuggestions) return;
    const subtaskLines = aiSuggestions.subtasks?.length
      ? `\n\nSuggested subtasks:\n${aiSuggestions.subtasks.map((s) => `- ${s}`).join('\n')}`
      : '';
    setForm((f) => ({
      ...f,
      title: f.title.trim() || aiTitle.trim(),
      description: `${aiSuggestions.suggestedDescription}${subtaskLines}`,
      priority: aiSuggestions.suggestedPriority,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">New task</h2>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {error && <ErrorMessage message={error.message} errors={error.errors} />}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Title</label>
            <input
              value={form.title}
              onChange={handleChange('title')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="e.g. Set up CI pipeline"
              maxLength={150}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="Optional details…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Priority</label>
              <select
                value={form.priority}
                onChange={handleChange('priority')}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={handleChange('dueDate')}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Assigned to</label>
            <select
              value={form.assignedTo}
              onChange={handleChange('assignedTo')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
            >
              <option value="">Select a person…</option>
              {assigneeOptions.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-line bg-paper/60 p-3.5">
            <button
              type="button"
              onClick={() => setAiOpen((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-medium text-accent"
            >
              <span>AI Assistant</span>
              <span className="text-ink-soft">{aiOpen ? '−' : '+'}</span>
            </button>

            {aiOpen && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-ink-soft">
                  Describe the task and get a suggested description, priority, and subtasks. Nothing is created
                  automatically — you decide what to use.
                </p>
                <input
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  placeholder="Task title for the assistant"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
                />
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
                />
                <button
                  type="button"
                  onClick={runAiAssistant}
                  disabled={aiLoading}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
                >
                  {aiLoading ? 'Generating suggestions…' : 'Get AI suggestions'}
                </button>

                {aiError && <ErrorMessage message={aiError.message} />}

                {aiSuggestions && (
                  <div className="space-y-2.5 rounded-lg border border-accent/20 bg-accent-dim/60 p-3">
                    <div>
                      <p className="text-xs font-medium text-accent-ink">Suggested description</p>
                      <p className="mt-0.5 text-sm text-ink">{aiSuggestions.suggestedDescription}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent-ink">Suggested priority</p>
                      <p className="mt-0.5 text-sm text-ink">{aiSuggestions.suggestedPriority}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent-ink">Suggested subtasks</p>
                      <ul className="mt-0.5 list-disc space-y-0.5 pl-4 text-sm text-ink">
                        {aiSuggestions.subtasks.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button type="button" onClick={applyDescription} className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-accent-ink shadow-card hover:bg-white/70">
                        Use description
                      </button>
                      <button type="button" onClick={applyPriority} className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-accent-ink shadow-card hover:bg-white/70">
                        Use priority
                      </button>
                      <button type="button" onClick={applyAll} className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent/90">
                        Use all suggestions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-paper">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
