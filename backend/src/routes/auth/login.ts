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
            try {
                // Find the user by name
                const foundUser = await User.findOne({ name: user.name }).exec();
                if (!foundUser) {
                    return res.status(404).json({ message: 'User not found.' });
                }
                // Successful login
                // Return the user's details, including their role
                return res.status(200).json({
                    message: 'Login successful.',
                    user: {
                        id: foundUser._id,
                        email: foundUser.email,
                        name: foundUser.name,
                        role: foundUser.role,
                    },
                });
            } catch (error) {
                return res.status(500).json({ message: 'An error occurred while retrieving user details.' });
            }
        });
    })(req, res, next);
});

export default loginRouter;
