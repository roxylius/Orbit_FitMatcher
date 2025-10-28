import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import pool from '../config/db';  // Your PG pool
import { University } from '../models/matching';  // Reuse interface

const router = express.Router();

// GET /api/universities - Fetch universities (optional filter by program)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const program = req.query.program as string;
    let query = 'SELECT * FROM universities';
    const params: any[] = [];

    if (program) {
      query += ' WHERE program_type = $1';
      params.push(program);
    }

    // Order by ranking or acceptance_rate for default list
    query += ' ORDER BY acceptance_rate DESC';

    const result = await pool.query(query, params);

    // Type assertion for response
    const universities: University[] = result.rows;

    res.json({
      success: true,
      count: universities.length,
      universities
    });
  } catch (error) {
    next(error);  // Pass to global error handler
  }
});

export default router;
