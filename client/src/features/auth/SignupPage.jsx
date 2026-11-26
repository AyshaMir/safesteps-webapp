import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import WarningBox from '../../components/WarningBox';
import { useAuth } from '../../context/useAuth';
import { MIN_PASSWORD, checkEmail, checkName, checkNewPassword, compact } from './validate';
import { returnPath } from './redirect';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      name: checkName(form.name),
      email: checkEmail(form.email),
      password: checkNewPassword(form.password),
    });
    setErrors(found ?? {});
    setFormError(null);
    if (found) return;

    setBusy(true);
    try {
      await signup(form.name, form.email, form.password);
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
        <h1 className="h1">Create an account</h1>
        <p className="lead">Save your emergency plan, kit checklist and contacts.</p>

        {formError && <WarningBox title={formError} />}

        <form className="stack" onSubmit={onSubmit} noValidate>
          <TextField
            label="Name"
            autoComplete="name"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
          />
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
            autoComplete="new-password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD} characters`}
          />
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="auth__switch">
          Already have an account?{' '}
          <Link to="/login" state={location.state}>
            Sign in
          </Link>
        </p>
      </div>
    </Layout>
  );
}
