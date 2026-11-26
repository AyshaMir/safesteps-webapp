const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { requireAuth, signToken } = require('../middleware/auth');
const { checkFields, sendFieldErrors } = require('./validate');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  const fields = checkFields({ name, email, password }, ['name', 'email', 'password']);
  if (fields) return sendFieldErrors(res, fields);

  const normalEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalEmail })) {
    return sendFieldErrors(res, { email: 'An account with this email already exists. Sign in instead' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalEmail,
    passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
  });
  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const fields = checkFields({ email }, ['email']) ?? {};
  if (!password) fields.password = 'Enter your password';
  if (Object.keys(fields).length) return sendFieldErrors(res, fields);

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    return sendFieldErrors(res, { password: "That email and password don't match. Try again" });
  }
  res.json({ token: signToken(user), user: user.toPublic() });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });
  res.json({ user: user.toPublic() });
});

module.exports = router;
