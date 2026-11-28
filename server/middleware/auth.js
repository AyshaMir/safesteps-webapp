const jwt = require('jsonwebtoken');
const User = require('../models/User');

const TOKEN_TTL = '7d';

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

// Puts req.user = { id, role } on the request, or answers 401.
// The role is read from the database so a demoted admin loses access at once.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please sign in' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('role');
    if (!user) return res.status(401).json({ error: 'Please sign in' });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again' });
  }
}

// Use after requireAuth.
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: "You don't have access" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, signToken };
