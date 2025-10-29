import { Router } from 'express';
import { getMetadata } from '../controllers/metadataController';

const router = Router();

/**
 * @route   GET /metadata
 * @desc    Retrieve distinct program types, countries, and industries for autocomplete dropdowns
 * @access  Public
 */
router.get('/metadata', getMetadata);

export default router;
