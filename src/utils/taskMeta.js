// Status and priority values exactly as defined in the backend's Task
// model enums — used to drive dropdown options and visual treatment.
export const STATUSES = ['Todo', 'InProgress', 'Done'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUS_LABELS = {
  Todo: 'To do',
  InProgress: 'In progress',
  Done: 'Done',
};

export const STATUS_ACCENT = {
  Todo: 'bg-todo',
  InProgress: 'bg-progress',
  Done: 'bg-done',
};

export const PRIORITY_STYLES = {
  Low: 'text-low bg-low/10 border-low/20',
  Medium: 'text-medium bg-medium/10 border-medium/20',
  High: 'text-high bg-high/10 border-high/20',
};

export const PRIORITY_DOT = {
  Low: 'bg-low',
  Medium: 'bg-medium',
  High: 'bg-high',
};

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
