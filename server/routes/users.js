const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { checkFields, sendFieldErrors } = require('./validate');

const router = express.Router();
router.use(requireAuth);

// Update name and/or password. Changing the password needs the current one.
router.put('/me', async (req, res) => {
  const { name, currentPassword, newPassword } = req.body ?? {};
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found' });

  const fields = {};
  if (name !== undefined) {
    const nameErr = checkFields({ name }, ['name']);
    if (nameErr) Object.assign(fields, nameErr);
  }
  if (newPassword !== undefined) {
    const pwErr = checkFields({ password: newPassword }, ['password']);
    if (pwErr) fields.newPassword = pwErr.password;
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      fields.currentPassword = 'Your current password is not right';
    }
  }
  if (Object.keys(fields).length) return sendFieldErrors(res, fields);

  if (name !== undefined) user.name = name.trim();
  if (newPassword !== undefined) user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ user: user.toPublic() });
});

// Delete the account and its Prepare data (UserPrep is Person 1's model,
// so it is removed by collection name to avoid depending on it).
router.delete('/me', async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.user.id);
  await mongoose.connection.collection('userpreps').deleteOne({ user: id });
  await User.deleteOne({ _id: id });
  res.status(204).end();
});

module.exports = router;
