import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.PROD_POSTGRES_URI });

export default pool;