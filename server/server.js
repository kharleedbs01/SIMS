require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// Middleware
app.use(
helmet({
crossOriginResourcePolicy: { policy: 'cross-origin' }
})
);

app.use(
cors({
origin: process.env.CLIENT_URL || 'http://localhost:5173',
credentials: true
})
);

app.use(
rateLimit({
windowMs: 15 * 60 * 1000,
max: 300,
message: 'Too many requests'
})
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
}

// Home Route
app.get('/', (req, res) => {
res.status(200).json({
success: true,
message: 'Prime College SIMS API is running successfully',
version: '1.0.0'
});
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/results', require('./routes/results'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health Check
app.get('/api/health', (req, res) => {
res.json({
status: 'OK',
app: 'Prime College SIMS',
time: new Date()
});
});

// 404 Handler
app.use('*', (req, res) => {
res.status(404).json({
success: false,
message: 'Route not found'
});
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`🚀 SIMS Server running on port ${PORT}`);
});
