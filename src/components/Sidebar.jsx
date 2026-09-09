import { NavLink } from 'react-router-dom';

// Secondary navigation scoped to the admin section (Navbar already carries
// the primary top-level links). Keeps admin pages easy to move between
// without repeating full Navbar links inside every page body.
export default function Sidebar() {
  const linkClasses = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-accent-dim text-accent-ink' : 'text-ink-soft hover:bg-paper hover:text-ink'
    }`;

  return (
    <aside className="w-44 shrink-0 space-y-1 pr-2">
      <NavLink to="/admin/users" className={linkClasses}>
        All users
      </NavLink>
      <NavLink to="/admin/boards" className={linkClasses}>
        All boards
      </NavLink>
      <NavLink to="/admin/boards/create" className={linkClasses}>
        New board
      </NavLink>
    </aside>
  );
}
