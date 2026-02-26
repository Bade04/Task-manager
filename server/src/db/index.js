const { Pool } = require('pg');
require('dotenv').config();

console.log('🔌 Database Configuration:');
console.log('- Host:', process.env.DB_HOST);
console.log('- Database:', process.env.DB_DATABASE);
console.log('- User:', process.env.DB_USER);
console.log('- Port:', process.env.DB_PORT);

const poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false  // Required for Render external connections
    },
    // Add connection timeout and retry logic
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10 // Maximum number of clients in the pool
};

console.log('📊 Connecting with SSL enabled');

const pool = new Pool(poolConfig);

// Test the connection with a simple query
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connected successfully at:', res.rows[0].now);
    }
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('❌ Unexpected database pool error:', err);
});

module.exports = pool;