const { Pool } = require('pg');
require('dotenv').config();

// Support both lowercase (db_*) and uppercase (DB_*) env var names
const dbHost = process.env.db_host || process.env.DB_HOST;
const dbDatabase = process.env.db_database || process.env.DB_DATABASE;
const dbUser = process.env.db_user || process.env.DB_USER;
const dbPort = process.env.db_port || process.env.DB_PORT;
const dbPassword = process.env.db_password || process.env.DB_PASSWORD;

console.log('🔌 Database Configuration:');
console.log('- Host:', dbHost);
console.log('- Database:', dbDatabase);
console.log('- User:', dbUser);
console.log('- Port:', dbPort);

const poolConfig = {
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: parseInt(dbPort || '5432'),
    database: dbDatabase,
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