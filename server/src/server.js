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



// Get allowed origins from environment or use defaults
const allowedOrigins = [
    'http://localhost:3000',
    'https://task-manager-client.vercel.app', // REPLACE with your actual Vercel URL
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

console.log('✅ CORS allowed origins:', allowedOrigins);

// CORS middleware - must come BEFORE routes
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('❌ Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests explicitly
app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`\n📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

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
            test: 'GET /api/test'
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

// Test API route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        method: req.method,
        url: req.url,
        headers: req.headers
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: {
            root: 'GET /',
            testDb: 'GET /test-db',
            testApi: 'GET /api/test',
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            tasks: 'GET /api/tasks (protected)'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 ==================================`);
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
    console.log(`🔗 Test API at: http://localhost:${PORT}/api/test`);
    console.log(`📊 Test DB at: http://localhost:${PORT}/test-db`);
    console.log(`=====================================\n`);
});