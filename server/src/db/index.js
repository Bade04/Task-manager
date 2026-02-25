// server/src/db/index.js

const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE,
};

// Add SSL for production (Render requires this)
if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = {
        rejectUnauthorized: false // Required for Render PostgreSQL
    };
}

const pool = new Pool(poolConfig);

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('Connection config:', {
            ...poolConfig,
            password: poolConfig.password ? '***' : undefined
        });
        return;
    }
    console.log('✅ Connected to PostgreSQL database');
    release();
});

module.exports = pool;