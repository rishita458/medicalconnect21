require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

// Add lightweight request logging for auth routes in non-production to capture failing signup payloads
if (process.env.NODE_ENV !== 'production') {
  // Ensure express.json() is already used in your app; this middleware assumes req.body is available.
  app.use((req, res, next) => {
    if (req.path && req.path.includes('/auth')) {
      try {
        console.log('[debug] AUTH REQUEST ->', req.method, req.path, 'Headers:', {
          origin: req.headers.origin,
          'content-type': req.headers['content-type']
        }, 'Body:', req.body);
      } catch (e) {
        console.log('[debug] AUTH REQUEST -> unable to log body', e);
      }
    }
    next();
  });
}

// Global error handler to log stack traces for route errors (keeps existing app-level handlers if any)
app.use((err, req, res, next) => {
  console.error('[error] Unhandled route error:', err && err.stack ? err.stack : err);
  if (!res.headersSent) {
    res.status(err && err.status ? err.status : 500).json({ message: err && err.message ? err.message : 'Internal server error' });
  } else {
    next(err);
  }
});

// Log unhandled rejections and uncaught exceptions so you can see backend failures during signup
process.on('unhandledRejection', (reason, promise) => {
  console.error('[fatal] Unhandled Rejection at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught Exception thrown:', err && err.stack ? err.stack : err);
  // In many apps it's best to exit after uncaught exceptions; comment out if you prefer to keep running.
  process.exit(1);
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
      console.error('[fatal] HTTP server error', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
