const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

console.log('🔍 Checking database environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST ? `"${process.env.DB_HOST}"` : '❌ UNDEFINED');
console.log('- DB_USER:', process.env.DB_USER ? `"${process.env.DB_USER}"` : '❌ UNDEFINED');
console.log('- DB_DATABASE:', process.env.DB_DATABASE ? `"${process.env.DB_DATABASE}"` : '❌ UNDEFINED');
console.log('- DB_PORT:', process.env.DB_PORT ? `"${process.env.DB_PORT}"` : '❌ UNDEFINED');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ Set (hidden)' : '❌ UNDEFINED');

const poolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '4500'),
    database: process.env.DB_DATABASE,
};

console.log('🔧 Creating pool with config:', {
    ...poolConfig,
    password: poolConfig.password ? '✅ Set' : '❌ Missing'
});

const pool = new Pool(poolConfig);

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        return;
    }
    console.log('✅ Connected to PostgreSQL database');
    release();
});

module.exports = pool;