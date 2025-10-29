import express from 'express';
import getLogger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

const logger = getLogger('routes/index');

//import controllers
import { getUniversityMatches } from '../controllers/matchController';
import { searchUniversities } from '../controllers/searchController';

//import routers
import metadataRoutes from './metadataRoutes';

const router = express.Router();

// Matching routes - /api/match
router.post('/match', getUniversityMatches);

// Search routes - /api/search
router.get('/search', searchUniversities);

// Metadata routes - /api/metadata
router.use('/', metadataRoutes);

// University routes - /api/universities
// router.use('/', universityRoutes);





// Middleware to log all requests
router.use((req, res, next) => {
    logger.debug(`${req.method}`,`${req.path}`);
    next();
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware for routes
router.use((err: any , req: Request, res: Response, next: NextFunction) => {
    logger.error('ROUTE_ERROR', err.message);
    res.status(err.status || 500).json({
        error:  err.message,
        timestamp: new Date().toISOString()
    });
});

// Export the combined router for use in main app
export default router;