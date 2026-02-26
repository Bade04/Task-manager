// server/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// ==================== REGISTER ROUTE ====================
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Register attempt:', req.body);
        
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Please provide name, email and password' 
            });
        }

        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ 
                error: 'User already exists with this email' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        // Create JWT token
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ User registered successfully:', newUser.rows[0].email);
        
        res.status(201).json({
            token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('❌ Register error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// ==================== LOGIN ROUTE ====================
router.post('/login', async (req, res) => {
    try {
        console.log('📝 Login attempt:', req.body);
        
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Please provide email and password' 
            });
        }

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);

        if (!isMatch) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        // Create token
        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ User logged in successfully:', email);
        
        res.json({
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// ==================== GET CURRENT USER ====================
router.get('/me', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await pool.query(
            'SELECT id, name, email, created_at FROM users WHERE id = $1',
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error('❌ Get user error:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
});

module.exports = router;