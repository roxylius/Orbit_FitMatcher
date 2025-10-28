import { Router } from 'express';
import { getUniversityMatches } from '../controllers/matchController';

const router = Router();

/**
 * POST /api/match
 * Get personalized university recommendations based on user profile
 * 
 * Request Body:
 * {
 *   gmat_score?: number,        // 200-800 (optional if GRE provided)
 *   gre_score?: number,         // 260-340 (optional if GMAT provided)
 *   gpa: number,                // Required
 *   gpa_scale?: number,         // Default 4.0 (can be 10.0, 100.0, etc.)
 *   work_experience: number,    // Years (required)
 *   program_type: string,       // e.g., "MBA", "MS CS" (required)
 *   industry_preference?: string,
 *   nationality?: string,
 *   visa_required?: boolean,
 *   preferred_location?: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   count: number,
 *   profile_summary: {...},
 *   matches: [
 *     {
 *       university: {...},
 *       match_percentage: number,
 *       category: "Safety" | "Target" | "Reach",
 *       reasons: string[]
 *     }
 *   ]
 * }
 */
router.post('/match', getUniversityMatches);

export default router;
