import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import WarningBox from '../../components/WarningBox';
import { useAuth } from '../../context/useAuth';
import { checkEmail, compact } from './validate';
import { returnPath } from './redirect';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: null });
  };

  async function onSubmit(e) {
    e.preventDefault();
    const found = compact({
      email: checkEmail(form.email),
      password: form.password ? null : 'Enter your password',
    });
    setErrors(found ?? {});
    setFormError(null);
    if (found) return;

    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(returnPath(location), { replace: true });
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length) setErrors(err.fields);
      else setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="auth">
        <h1 className="h1">Sign in</h1>
        <p className="lead">Your plan, kit and contacts are saved to your account.</p>

        {formError && <WarningBox title={formError} />}

        <form className="stack" onSubmit={onSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
          />
          <Button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="auth__switch">
          New to SafeSteps?{' '}
          <Link to="/signup" state={location.state}>
            Create an account
          </Link>
        </p>
      </div>
    </Layout>
  );
}
