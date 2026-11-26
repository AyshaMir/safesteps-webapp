import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Call1122Bar from './Call1122Bar';
import { BookIcon, ClipboardCheckIcon, HomeIcon } from './icons';

const TABS = [
  { to: '/', label: 'Home', end: true, Icon: HomeIcon },
  { to: '/learn', label: 'Learn', Icon: BookIcon },
  { to: '/prepare', label: 'Prepare', Icon: ClipboardCheckIcon },
];

// Calm layout: header, centred content column, tab bar (phone) and Call 1122 bar.
export default function Layout({ children, tabs = true }) {
  const { user } = useAuth();
  return (
    <div className={`calm ${tabs ? 'calm--tabs' : ''}`}>
      <header className="calm-header">
        <Link to="/" className="calm-header__brand">
          SafeSteps
        </Link>
        <nav className="calm-header__links" aria-label="Main">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end}>
              {t.label}
            </NavLink>
          ))}
        </nav>
        {user ? (
          <Link to="/profile" className="account-spot" aria-label={`Your account, ${user.name}`}>
            <span className="account-spot__avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="account-spot__name">{user.name.split(' ')[0]}</span>
          </Link>
        ) : (
          <Link to="/login" className="account-spot account-spot--signin">
            Sign in
          </Link>
        )}
      </header>

      <main className="calm-main">{children}</main>

      <div className="calm-bottom">
        <Call1122Bar />
        {tabs && (
          <nav className="tab-bar" aria-label="Main">
            {TABS.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end} className="tab-bar__tab">
                <span className="tab-bar__pill">
                  <t.Icon size={22} />
                </span>
                {t.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
