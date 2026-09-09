import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/roles';

const linkClasses = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent-dim text-accent-ink' : 'text-ink-soft hover:bg-paper hover:text-ink'
  }`;

export default function Navbar() {
  const { logout, user } = useAuth();
  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper px-4 sm:px-6">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4">
        <nav className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClasses}>
            Dashboard
          </NavLink>
          {admin && (
            <>
              <NavLink to="/admin/users" className={linkClasses}>
                Users
              </NavLink>
              <NavLink to="/admin/boards" className={linkClasses}>
                Boards
              </NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-white hover:text-ink"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
