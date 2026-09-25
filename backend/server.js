const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const partsRoutes = require('./routes/partsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploaded parts images
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
      try {
        const buffer = Buffer.alloc(30);
        const fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 30, 0);
        fs.closeSync(fd);
        const head = buffer.toString('utf8');
        if (head.includes('<svg') || head.includes('<?xml')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        }
      } catch (e) {}
    }
  }
}));

// API Root & Health Check
app.get('/api', (req, res) => {
  const modeLabel =
    db.dbEngine === 'postgres'
      ? 'PostgreSQL Production Database'
      : db.dbEngine === 'mysql'
      ? 'MySQL 8 Production Database'
      : 'Embedded Local Database';
  res.json({
    project: 'MACHINEX',
    tagline: 'Give Your Unused Machine Parts a Second Life',
    status: 'ONLINE',
    version: '1.0.0',
    db_mode: modeLabel
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS test');
    res.json({
      status: 'healthy',
      database: 'connected',
      db_mode: db.dbEngine
    });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found.` });
});

// Serve Compiled React Frontend when dist exists (Production / Unified Server)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 [MachineX] Serving compiled frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, message: 'Resource not found' });
    }
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server & Initialize Database
async function startServer() {
  try {
    await db.initDatabase();
    const dbLabel =
      db.dbEngine === 'postgres'
        ? 'PostgreSQL (Cloud Persistent)'
        : db.dbEngine === 'mysql'
        ? 'MySQL 8 (Cloud Persistent)'
        : 'Embedded Fallback (machinex_local.db)';
    app.listen(PORT, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🚀 MACHINEX Server running on port ${PORT}`);
      console.log(`📡 Local:   http://localhost:${PORT}`);
      console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
      console.log(`🗄️ Database: ${dbLabel}`);
      console.log(`💻 Frontend: ${fs.existsSync(frontendDistPath) ? 'Unified Production Bundle' : 'Dev Mode (Vite on :5173)'}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
