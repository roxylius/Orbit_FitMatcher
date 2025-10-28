require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.PROD_POSTGRES_URI });

module.exports = pool;