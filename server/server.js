const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Dashboard routes matching PRD Section 48 (/api/admin/dashboard and /api/owner/dashboard)
app.use('/api', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve production client build if available
const path = require('path');
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// For SPA routing, serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON payload.' });
  }
  return res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Auto-start server and initialize PostgreSQL database
async function startServer() {
  try {
    await db.initDb();

    // Check if users table is empty; if so, seed sample dataset automatically
    const userCount = await db.query('SELECT COUNT(id)::int as count FROM users');
    if (userCount.rows[0].count === 0) {
      console.log('Database empty. Automatically populating initial seed dataset...');
      const seed = require('./scripts/seed');
      await seed();
    }

    const server = app.listen(PORT, () => {
      console.log(`Store Rating Management API running at http://localhost:${PORT}`);
    });

    const gracefulShutdown = async () => {
      console.log('\nShutting down server...');
      server.close(async () => {
        await db.closeDb();
        process.exit(0);
      });
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
