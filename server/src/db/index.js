const { Pool } = require('pg');
require('dotenv').config();

console.log('🔌 Database Configuration:');
console.log('- Host:', process.env.db_host);
console.log('- Database:', process.env.db_database);
console.log('- User:', process.env.db_user);
console.log('- Port:', process.env.db_port);

const poolConfig = {
    user: process.env.db_user,
    password: process.env.db_password,
    host: process.env.db_host,
    port: parseInt(process.env.db_port || '5432'),
    database: process.env.db_database,
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