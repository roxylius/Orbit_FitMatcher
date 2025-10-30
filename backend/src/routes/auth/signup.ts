import express, { Request, Response } from 'express';
import passport from 'passport';
import User from '../../models/user';
import getLogger from '../../utils/logger';

const logger = getLogger('signup');

// Handles signup routes
const SignupRouter = express.Router();

// Handle POST request for the signup page
SignupRouter.post("/", async (req: Request, res: Response) => {
    // Retrieve input passed by client application
    const { email, password, name, role, permissions } = req.body;

    try {
        // Find the user in DB
        const foundUser = await User.findOne({ email: email });

        // If user with same email is found sends err else register the user
        if (foundUser) {
            return res.status(401).json({ message: 'The email already exists!' });
        }

        // Create a new user
        const newUser = new User({ email, name, role, permissions, provider: 'local' });

        // Registers the user using passport-local-mongoose fn
        // @ts-ignore - Bypass complex type inference with passport-local-mongoose
        User.register(newUser, password, (err: any, user: any) => {
            // If any error in registering otherwise authenticate the user
            if (err) { 
                logger.error("REGISTER", "Error registering user: " + err.message);
                return res.status(401).json(err);
            }

            // Remove salt and hash fields
            const userObj = user.toObject();
            delete userObj.salt;
            delete userObj.hash;
            
            // Authenticates the user based on local strategy and sends the session with the response
            passport.authenticate('local')(req, res, () => {
                res.status(200).json({ message: 'User Authenticated!', userObj });
            });
        });
    } catch (error: any) {
        logger.error("SIGNUP_ERROR", "Error during signup: " + error.message);
        res.status(500).json({ message: 'An error occurred during signup.' });
    }
});

export default SignupRouter;
