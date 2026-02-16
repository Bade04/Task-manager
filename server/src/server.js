const express = require('express');
const cors = require('cors');
require('dotenv').config();
app.enable('trust proxy'); // Enable if behind a proxy (e.g., Vercel)
// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const allowedOrigins = [
    'http://localhost:3000',
    'https://task-manager-7nqjxk9kg-bade04s-projects.vercel.app', // Your Vercel URL
    process.env.FRONTEND_URL // Add this line to allow the URL from .env
].filter(Boolean);

const app = express();

// Middleware

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Routes - THIS IS THE KEY PART
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Test database route
app.get('/test-db', async (req, res) => {
    try {
        const pool = require('./db');
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connected!', time: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});