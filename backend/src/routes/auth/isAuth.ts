import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/auth/verify
 * Get current authenticated user
 * Returns user data if authenticated, 401 if not
 */
router.get('/', (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
        // User is authenticated, return user data
        const user = req.user as any;
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                provider: user.provider
            }
        });
    }

    // User is not authenticated
    return res.status(401).json({
        success: false,
        message: 'Not authenticated'
    });
});

export default router;
