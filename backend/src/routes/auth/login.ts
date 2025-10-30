import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../../models/user';

// Handles login routes
const loginRouter = express.Router();

// Handle the POST request for login
loginRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
    // Authenticates the user in DB and conditionally generates response
    passport.authenticate('local', async (err: any, user: any, info: any) => {
        if (err) {
            // Error during authentication (e.g., database error)
            return res.status(500).json({ message: 'An error occurred during authentication.' });
        }

        if (!user) {
            // Authentication failed (invalid credentials)
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Establish a login session
        req.logIn(user, async (err) => {
            if (err) {
                // Error during login
                return res.status(500).json({ message: 'An error occurred during login.' });
            }
            // Successful login
            // Return the user's details, including their role
            return res.status(200).json({
                message: 'Login successful.',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    
                },
            });
        });
    })(req, res, next);
});

export default loginRouter;
