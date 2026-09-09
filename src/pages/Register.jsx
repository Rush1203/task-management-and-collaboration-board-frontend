import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

// Client-side validation mirrors the backend's actual rules (see
// validators/authValidator.js): name required, valid email, password
// minimum 8 characters. Registration always creates a regular user —
// there is no way to request admin from this form, matching the backend.
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errors = [];
    if (!form.name.trim()) errors.push('Name is required.');
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errors.push('A valid email is required.');
    if (form.password.length < 8) errors.push('Password must be at least 8 characters long.');
    if (form.password !== form.confirmPassword) errors.push('Passwords do not match.');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const clientErrors = validate();
    if (clientErrors.length) {
      setError({ message: 'Please fix the following:', errors: clientErrors });
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold tracking-tight text-ink">Boardwork</p>
          <p className="mt-1 text-sm text-ink-soft">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-white p-6 shadow-card">
          {error && <ErrorMessage message={error.message} errors={error.errors} />}
          {success && (
            <p className="rounded-lg border border-done/30 bg-done/5 px-3 py-2 text-sm text-done">
              Account created. Redirecting you to sign in…
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Name</label>
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent"
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
