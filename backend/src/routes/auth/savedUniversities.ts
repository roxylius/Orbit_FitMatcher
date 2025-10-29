import { Router, Request, Response } from 'express';
import User from '../../models/user';

const router = Router();

/**
 * Middleware to check if user is authenticated
 */
const requireAuth = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'Authentication required'
    });
};

/**
 * GET /api/auth/saved-universities
 * Get all saved universities for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const userData = await User.findById(user._id).select('savedUniversities');
        
        return res.status(200).json({
            success: true,
            count: userData?.savedUniversities?.length || 0,
            universities: userData?.savedUniversities || []
        });
    } catch (error) {
        console.error('Error fetching saved universities:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch saved universities'
        });
    }
});

/**
 * POST /api/auth/saved-universities
 * Save a university to user's saved list
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const universityData = req.body;

        // Validate required fields
        if (!universityData.university_id || !universityData.name || !universityData.program_name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: university_id, name, program_name'
            });
        }

        // Find user and check if university already saved
        const userData = await User.findById(user._id);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already saved
        const alreadySaved = (userData as any).savedUniversities?.some(
            (u: any) => u.university_id === universityData.university_id
        );

        if (alreadySaved) {
            return res.status(400).json({
                success: false,
                message: 'University already saved'
            });
        }

        // Add savedAt timestamp
        const universityToSave = {
            ...universityData,
            savedAt: new Date()
        };

        // Save university
        await User.findByIdAndUpdate(
            user._id,
            { $push: { savedUniversities: universityToSave } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: 'University saved successfully',
            university: universityToSave
        });
    } catch (error) {
        console.error('Error saving university:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save university'
        });
    }
});

/**
 * DELETE /api/auth/saved-universities/:university_id
 * Remove a university from user's saved list
 */
router.delete('/:university_id', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const universityId = parseInt(req.params.university_id);

        if (isNaN(universityId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid university ID'
            });
        }

        // Remove university from saved list
        await User.findByIdAndUpdate(
            user._id,
            { $pull: { savedUniversities: { university_id: universityId } } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'University removed from saved list'
        });
    } catch (error) {
        console.error('Error removing saved university:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove university'
        });
    }
});

/**
 * POST /api/auth/saved-universities/bulk
 * Save multiple universities at once (sync from frontend)
 */
router.post('/bulk', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        const { universities } = req.body;

        if (!Array.isArray(universities)) {
            return res.status(400).json({
                success: false,
                message: 'universities must be an array'
            });
        }

        // Validate all universities have required fields
        const invalidUniversities = universities.filter(
            u => !u.university_id || !u.name || !u.program_name
        );

        if (invalidUniversities.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some universities are missing required fields'
            });
        }

        // Get current saved universities
        const userData = await User.findById(user._id);
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentSavedIds = new Set(
            (userData as any).savedUniversities?.map((u: any) => u.university_id) || []
        );

        // Filter out already saved universities
        const newUniversities = universities
            .filter(u => !currentSavedIds.has(u.university_id))
            .map(u => ({
                ...u,
                savedAt: new Date()
            }));

        if (newUniversities.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'All universities already saved',
                saved: 0
            });
        }

        // Add all new universities
        await User.findByIdAndUpdate(
            user._id,
            { $push: { savedUniversities: { $each: newUniversities } } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: `${newUniversities.length} universities saved successfully`,
            saved: newUniversities.length
        });
    } catch (error) {
        console.error('Error saving universities in bulk:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save universities'
        });
    }
});

export default router;
