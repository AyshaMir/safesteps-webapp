import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

// STAND-IN for Person 2's admin dashboard shell (PLAN.md §3 hand-off).
// Admin header + sidebar (Guides · Checklist Items). No Call 1122 bar on admin pages.
export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="admin-header__brand">SafeSteps Admin</span>
        <span className="admin-header__who">
          Signed in as {user.name} ·{' '}
          <button type="button" className="text-btn" onClick={signOut}>
            Sign out
          </button>
        </span>
        <Link to="/" className="admin-header__back">
          ‹ Back to SafeSteps
        </Link>
      </header>
      <div className="admin-body">
        <nav className="admin-sidebar" aria-label="Admin">
          <NavLink to="/admin" end>
            Guides
          </NavLink>
          <NavLink to="/admin/checklist">Checklist Items</NavLink>
        </nav>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
