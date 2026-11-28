const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

// Returns { field: message } for each problem, or null when everything is fine.
function checkFields({ name, email, password }, required) {
  const errors = {};
  if (required.includes('name') && !String(name ?? '').trim()) {
    errors.name = 'Enter your name';
  }
  if (required.includes('email')) {
    if (!String(email ?? '').trim()) errors.email = 'Enter your email';
    else if (!EMAIL_RE.test(String(email).trim())) errors.email = 'Enter a valid email, like name@example.com';
  }
  if (required.includes('password')) {
    if (!password) errors.password = 'Enter a password';
    else if (String(password).length < MIN_PASSWORD) {
      errors.password = `Use at least ${MIN_PASSWORD} characters`;
    }
  }
  return Object.keys(errors).length ? errors : null;
}

// Errors use the shape { error } and, for forms, a per-field map.
function sendFieldErrors(res, fields) {
  res.status(400).json({ error: 'Please check the highlighted fields', fields });
}

module.exports = { checkFields, sendFieldErrors, MIN_PASSWORD };
