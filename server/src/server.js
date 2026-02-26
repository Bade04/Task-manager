// server/src/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Initialize app
const app = express();

// Trust proxy - needed for Render
app.enable('trust proxy');

// ==================== COMPLETE CORS FIX ====================
// Get allowed origins from environment
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://task-manager-761y.vercel.app',
    'https://task-manager-pink-zeta-21.vercel.app',
    'https://task-manager-5rgn6kmgi-bade04s-projects.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

console.log('✅ CORS allowed origins:', allowedOrigins);

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true);
        
        // Allow if origin is in allowed list OR any Vercel preview URL
        if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
            callback(null, origin);
        } else {
            console.log('❌ Blocked origin:', origin);
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Origin', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Additional headers middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.includes('.vercel.app'))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Origin, X-Requested-With, Accept');
    }
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    next();
});

// ==================== ROUTES ====================
// Health check route
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'Task Manager API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            tasks: 'GET /api/tasks (protected)',
            test: 'GET /api/test',
            corsTest: 'GET /api/cors-test'
        }
    });
});

// Test database connection route
app.get('/test-db', async (req, res) => {
    try {
        const pool = require('./db');
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Database connected successfully!',
            time: result.rows[0],
            database: process.env.DB_DATABASE
        });
    } catch (error) {
        console.error('❌ Database connection error:', error);
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// CORS test route
app.get('/api/cors-test', (req, res) => {
    res.json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        method: req.method,
        headers: req.headers
    });
});

// Test API route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        method: req.method,
        url: req.url
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use('*', (req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 ==================================`);
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    console.log(`🌐 CORS Test at: https://task-manager-api.onrender.com/api/cors-test`);
    console.log(`=====================================\n`);
});