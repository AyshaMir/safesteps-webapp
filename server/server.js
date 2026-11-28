const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const checklist = require('./routes/checklist');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SafeSteps server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prepare', require('./routes/prepare'));
app.use('/api/checklist', checklist.publicRouter);
app.use('/api/admin/checklist', checklist.adminRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express 5 forwards rejected promises here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Try again' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set (see server/.env.example)');
    process.exit(1);
  }
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

module.exports = app;
