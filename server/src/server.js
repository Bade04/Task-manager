const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// ⚠️ IMPORTANT: Initialize app BEFORE using it!
const app = express();  // <-- This MUST come before any app.use() or app.enable()


app.enable('trust proxy');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API is running!',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            tasks: 'GET /api/tasks (protected)'
        }
    });
});

// Test database route
app.get('/test-db', async (req, res) => {
    try {
        const pool = require('./db');
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Database connected!',
            time: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database connection failed',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📝 Test the API at: http://localhost:${PORT}`);
});