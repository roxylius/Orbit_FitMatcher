import { Router } from 'express';
import { searchUniversities } from '../controllers/searchController';

const router = Router();

/**
 * @route   GET /search
 * @desc    Search universities with multiple filters
 * @query   program - Program type (MBA, MS CS, etc.)
 * @query   location_country - Country name (partial match)
 * @query   min_acceptance - Minimum acceptance rate (%)
 * @query   max_acceptance - Maximum acceptance rate (%)
 * @query   visa_sponsorship - Visa sponsorship (true/false)
 * @query   min_tuition - Minimum tuition (USD)
 * @query   max_tuition - Maximum tuition (USD)
 * @query   min_ranking - Minimum ranking
 * @query   max_ranking - Maximum ranking
 * @query   post_study_work - Post-study work support (partial match)
 * @query   has_scholarships - Scholarship availability (true/false)
 * @query   sort_by - Sort field (ranking, acceptance_rate, tuition_usd, avg_starting_salary_usd, name)
 * @query   order - Sort order (asc/desc)
 * @query   limit - Results per page (default: 50, max: 100)
 * @query   offset - Pagination offset (default: 0)
 * @access  Public
 */
router.get('/search', searchUniversities);

export default router;
