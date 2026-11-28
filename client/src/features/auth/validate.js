// Same rules as the server (server/routes/validate.js), checked first so
// people see mistakes without a round trip.
export const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkName(name) {
  return name.trim() ? null : 'Enter your name';
}

export function checkEmail(email) {
  if (!email.trim()) return 'Enter your email';
  return EMAIL_RE.test(email.trim()) ? null : 'Enter a valid email, like name@example.com';
}

export function checkNewPassword(password) {
  if (!password) return 'Enter a password';
  return password.length >= MIN_PASSWORD ? null : `Use at least ${MIN_PASSWORD} characters`;
}

// Drops empty entries; returns null when there is nothing to show.
export function compact(errors) {
  const out = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
  return Object.keys(out).length ? out : null;
}
