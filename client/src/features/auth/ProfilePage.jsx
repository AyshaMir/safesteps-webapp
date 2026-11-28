import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import WarningBox from '../../components/WarningBox';
import { api } from '../../api/api';
import { useAuth } from '../../context/useAuth';
import { MIN_PASSWORD, checkName, checkNewPassword, compact } from './validate';
import useOnlineStatus from '../../hooks/useOnlineStatus';

export default function ProfilePage() {
  const { user, logout, offlineSession } = useAuth();
  const isOnline = useOnlineStatus();
  const canEdit = isOnline && !offlineSession;
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function onLogout() {
    logout();
    navigate('/', { replace: true });
  }

  if (!canEdit) {
  return (
    <Layout>
      <div className="profile">
        <div className="profile__head">
          <span className="profile__avatar" aria-hidden="true">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>

          <div>
            <h1 className="h1">{user.name}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <WarningBox title="Account changes are unavailable">
          Reconnect to SafeSteps to manage your account.
        </WarningBox>

        <section className="section">
          <Button variant="secondary" onClick={onLogout}>
            Log out
          </Button>
        </section>
      </div>
    </Layout>
  );
}
  if (confirmingDelete) {
    return <DeleteConfirm onCancel={() => setConfirmingDelete(false)} />;
  }

  return (
    <Layout>
      <div className="profile">
        <div className="profile__head">
          <span className="profile__avatar" aria-hidden="true">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="h1">{user.name}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        {user.role === 'admin' && (
          <Link to="/admin" className="card card--link">
            <span>
              <span className="card__title">Admin dashboard</span>
              <span className="card__sub">Manage guides and checklist items</span>
            </span>
            <span className="chevron" aria-hidden="true">›</span>
          </Link>
        )}

        <DetailsForm />
        <PasswordForm />

        <section className="section">
          <Button variant="secondary" onClick={onLogout}>
            Log out
          </Button>
          <button type="button" className="text-btn text-btn--warning" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </button>
        </section>
      </div>
    </Layout>
  );
}

function DetailsForm() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved

  async function onSubmit(e) {
    e.preventDefault();
    const problem = checkName(name);
    setError(problem);
    if (problem) return;
    setStatus('saving');
    try {
      const data = await api('/users/me', { method: 'PUT', body: { name } });
      setUser(data.user);
      setStatus('saved');
    } catch (err) {
      setError(err.fields?.name ?? err.message);
      setStatus('idle');
    }
  }

  return (
    <form className="section stack" onSubmit={onSubmit} noValidate>
      <h2 className="h2">Your details</h2>
      <TextField
        label="Name"
        autoComplete="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
          setStatus('idle');
        }}
        error={error}
      />
      <TextField label="Email" value={user.email} readOnly hint="Your email can't be changed" />
      <Button type="submit" disabled={status === 'saving' || name.trim() === user.name}>
        {status === 'saving' ? 'Saving…' : 'Save'}
      </Button>
      {status === 'saved' && <SavedNote>Name saved</SavedNote>}
    </form>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [status, setStatus] = useState('idle');

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: null });
    setStatus('idle');
  };

  async function onSubmit(e) {
    e.preventDefault();
    const found = compact({
      currentPassword: form.currentPassword ? null : 'Enter your current password',
      newPassword: checkNewPassword(form.newPassword),
    });
    setErrors(found ?? {});
    setFormError(null);
    if (found) return;
    setStatus('saving');
    try {
      await api('/users/me', { method: 'PUT', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      setStatus('saved');
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      else setFormError(err.message);
      setStatus('idle');
    }
  }

  return (
    <form className="section stack" onSubmit={onSubmit} noValidate>
      <h2 className="h2">Change password</h2>
      {formError && <WarningBox title={formError} />}
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={update('currentPassword')}
        error={errors.currentPassword}
      />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        value={form.newPassword}
        onChange={update('newPassword')}
        error={errors.newPassword}
        hint={`At least ${MIN_PASSWORD} characters`}
      />
      <Button type="submit" variant="secondary" disabled={status === 'saving'}>
        {status === 'saving' ? 'Changing…' : 'Change password'}
      </Button>
      {status === 'saved' && <SavedNote>Password changed</SavedNote>}
    </form>
  );
}

function DeleteConfirm({ onCancel }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onDelete() {
    setBusy(true);
    setError(null);
    try {
      await api('/users/me', { method: 'DELETE' });
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="center-message">
        <span className="bang bang--xl" aria-hidden="true">!</span>
        <h1 className="h1">Delete your account?</h1>
        <p className="lead">
          Your emergency plan, kit checklist and saved contacts will be deleted too. This can&apos;t be
          undone.
        </p>
        {error && <WarningBox title={error} onRetry={onDelete} />}
        <div className="stack stack--full">
          <Button variant="warning" onClick={onDelete} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete my account'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Keep my account
          </Button>
        </div>
      </div>
    </Layout>
  );
}

function SavedNote({ children }) {
  return (
    <p className="status status--success" role="status">
      <span aria-hidden="true">✓</span> {children}
    </p>
  );
}
