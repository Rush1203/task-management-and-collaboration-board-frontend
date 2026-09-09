import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="text-sm font-medium text-ink-soft">404</p>
      <h1 className="mt-1 text-xl font-semibold text-ink">Page not found</h1>
      <Link to="/dashboard" className="mt-4 text-sm font-medium text-accent hover:text-accent/80">
        Back to dashboard
      </Link>
    </div>
  );
}
