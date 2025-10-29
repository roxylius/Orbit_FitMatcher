import express, { Request, Response } from 'express';
import getLogger from '../../utils/logger';

const logger = getLogger('logout');

// Handles logout route
const logoutRouter = express.Router();

logoutRouter.delete('/', (req: Request, res: Response) => {
    // Logs out user from the application
    req.logOut((err: any) => {
        if (err) {
            logger.error('LOGOUT', 'Error logging out user: ' + err.message);
            return res.status(401).json({ message: 'Unable to Logout!' });
        }
        
        req.session.destroy((err: any) => {
            if (err) {
                logger.error('SESSION_DESTROY', 'Error destroying session: ' + err.message);
            }
            res.status(200).json({ message: 'User Logged Out' });
        });
    });
});

export default logoutRouter;
