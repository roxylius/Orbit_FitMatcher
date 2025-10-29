import express, { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../../models/user';
import { sendPasswordResetOTP } from '../../services/emailService';
import getLogger from '../../utils/logger';

const logger = getLogger('forgotPassword');

const forgotPasswordRouter = express.Router();

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * POST /auth/forgot-password
 * Request OTP for password reset
 */
forgotPasswordRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required.' 
            });
        }

        // Check if user exists in database
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return specific message that email doesn't exist for frontend to handle
            logger.warn('FORGOT_PASSWORD', `Password reset attempt for non-existent email: ${email}`);
            return res.status(404).json({ 
                success: false,
                emailExists: false,
                message: 'No account found with this email address. Please check your email or sign up.' 
            });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Set OTP expiration time (10 minutes from now)
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP to user document
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpires = otpExpires;
        await user.save();

        // Send OTP via email
        try {
            await sendPasswordResetOTP(user.email, otp, user.name);
            
            logger.info('OTP_GENERATED', `Password reset OTP generated for user: ${user.email}`);
            
            return res.status(200).json({ 
                success: true,
                emailExists: true,
                message: 'OTP has been sent to your email address. Please check your inbox.',
                // In development, you might want to return the OTP for testing
                // Remove this in production!
                ...(process.env.NODE_ENV !== 'production' && { otp })
            });
        } catch (emailError: any) {
            logger.error('EMAIL_SEND_FAILED', `Failed to send OTP email: ${emailError.message}`);
            
            // Clear OTP fields if email fails
            user.resetPasswordOTP = undefined;
            user.resetPasswordOTPExpires = undefined;
            await user.save();
            
            return res.status(500).json({ 
                success: false,
                message: 'Failed to send OTP email. Please try again later.' 
            });
        }

    } catch (error: any) {
        logger.error('FORGOT_PASSWORD_ERROR', `Error in forgot password: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: 'An error occurred while processing your request.' 
        });
    }
});

export default forgotPasswordRouter;
