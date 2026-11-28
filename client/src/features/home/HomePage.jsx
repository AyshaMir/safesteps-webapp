import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  HeartPulseIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '../../components/icons';
import { api } from '../../api/api';
import { useAuth } from '../../context/useAuth';
import CallSomeoneSheet from './CallSomeoneSheet';

// Home (SCREENS.md §1), from "SafeSteps — Screens (Home + Ibad)".
export default function HomePage() {
  const { user } = useAuth();
  const prep = usePrepareSummary(user);

  return (
    <Layout>
      <div className="home">
        {user ? (
          <header className="home__greeting">
            <h1 className="h1 home__title">Hi, {user.name.trim().split(' ')[0]}</h1>
            <p className="home__sub">Welcome back. Help is one tap away.</p>
          </header>
        ) : (
          <header className="home__greeting">
            <h1 className="h1 home__title">Welcome to SafeSteps</h1>
            <p className="home__sub">Learn · Prepare · Respond. Help is one tap away.</p>
          </header>
        )}

        <div className="help-now">
          <Link to="/emergency" className="help-now__button">
            <HeartPulseIcon size={44} strokeWidth={2.2} />
            <span className="help-now__label">
              I need
              <br />
              help now
            </span>
            <span className="help-now__sub">Step-by-step help</span>
          </Link>
        </div>

        {user ? (
          <>
            <div className="home__links">
              <Link to="/learn" className="home-card home-card--link">
                <span className="home-card__icon home-card__icon--learn">
                  <BookIcon />
                </span>
                <span className="home-card__title">Learn</span>
                <span className="home-card__sub">8 guides to read calmly</span>
              </Link>
              <Link to="/prepare" className="home-card home-card--link">
                <span className="home-card__icon home-card__icon--prepare">
                  <ClipboardCheckIcon />
                </span>
                <span className="home-card__title">Prepare</span>
                <span className="home-card__sub">Plan, kit and contacts</span>
              </Link>
            </div>
            {prep && <ReadinessCard score={prep.score} />}
            {prep?.contacts?.length > 0 && <CallSomeoneCard contacts={prep.contacts} />}
          </>
        ) : (
          <section className="home-signin">
            <div className="home-signin__head">
              <span className="home-signin__icon">
                <ShieldCheckIcon size={20} />
              </span>
              <div>
                <h2 className="home-signin__title">Save your plan and contacts</h2>
                <p className="home-signin__text">
                  Sign in to keep your emergency plan, kit checklist and people to call.
                </p>
              </div>
            </div>
            <div className="home-signin__actions">
              <Link to="/login" className="btn btn--secondary">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn--primary">
                Create account
              </Link>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

// Person 1's GET /api/prepare (plan, contacts, checked items, score).
// Until that API exists, or if it fails, the readiness and contact cards stay hidden.
function usePrepareSummary(user) {
  const [prep, setPrep] = useState(null);
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    api('/prepare')
      .then((data) => !cancelled && setPrep(data))
      .catch(() => !cancelled && setPrep(null));
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return userId ? prep : null;
}

function ReadinessCard({ score = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <Link to="/prepare" className="home-card home-card--row">
      <svg className="ring" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={r} className="ring__track" />
        <circle
          cx="22"
          cy="22"
          r={r}
          className="ring__value"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="home-card__text">
        <span className="home-card__sub">Emergency readiness</span>
        <span className="home-card__title">You&apos;re {pct}% ready</span>
      </span>
      <ChevronRightIcon className="home-card__chevron" />
    </Link>
  );
}

function CallSomeoneCard({ contacts }) {
  const [open, setOpen] = useState(false);
  const sorted = [...contacts].sort((a, b) => Number(b.first) - Number(a.first));
  const shown = sorted.slice(0, 2);
  const extra = sorted.length - shown.length;
  const first = sorted.find((c) => c.first);

  return (
    <>
      <button type="button" className="home-card home-card--row" onClick={() => setOpen(true)}>
        <span className="avatars" aria-hidden="true">
          {shown.map((c, i) => (
            <span key={c._id ?? i} className={`avatars__one avatars__one--${i}`}>
              {c.name.trim().charAt(0).toUpperCase()}
            </span>
          ))}
          {extra > 0 && <span className="avatars__one avatars__one--more">+{extra}</span>}
        </span>
        <span className="home-card__text">
          <span className="home-card__title">Call someone</span>
          <span className="home-card__sub">
            {first ? `${first.name} is your first contact` : 'Choose from your contacts'}
          </span>
        </span>
        <span className="round-icon">
          <PhoneIcon size={20} />
        </span>
      </button>
      {open && <CallSomeoneSheet contacts={sorted} onClose={() => setOpen(false)} />}
    </>
  );
}
