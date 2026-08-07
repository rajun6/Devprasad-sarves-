const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({ origin: '*' }));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static files with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/service_center')
  .then(() => {
    console.log('🍃 MongoDB Connected');
    require('fs').mkdirSync('./uploads', { recursive: true });
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`⚡ Fast loading enabled`);
    });
  })
  .catch(err => { console.error('DB Error:', err); process.exit(1); });
