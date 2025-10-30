import express, { Request, Response } from 'express';
import User from '../../models/user';
import { sendPasswordChangedEmail } from '../../services/emailService';
import getLogger from '../../utils/logger';

const logger = getLogger('resetPassword');

const resetPasswordRouter = express.Router();

/**
 * POST /auth/verify-otp
 * Verify OTP before allowing password reset
 */
resetPasswordRouter.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        // Validate inputs
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and OTP are required.' 
            });
        }

        // Find user with matching email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or OTP.' 
            });
        }

        // Check if OTP exists and is not expired
        if (!(user as any).resetPasswordOTP || !(user as any).resetPasswordOTPExpires) {
            return res.status(400).json({ 
                success: false,
                message: 'No OTP request found. Please request a new OTP.' 
            });
        }

        // Check if OTP is expired
        if (new Date() > (user as any).resetPasswordOTPExpires) {
            // Clear expired OTP
            (user as any).resetPasswordOTP = undefined;
            (user as any).resetPasswordOTPExpires = undefined;
            await user.save();

            return res.status(400).json({ 
                success: false,
                message: 'OTP has expired. Please request a new one.' 
            });
        }

        // Verify OTP matches
        if ((user as any).resetPasswordOTP !== otp) {
            logger.warn('INVALID_OTP', `Invalid OTP attempt for user: ${(user as any).email}`);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid OTP. Please check and try again.' 
            });
        }
        
        logger.info('OTP_VERIFIED', `OTP verified successfully for user: ${(user as any).email}`);

        return res.status(200).json({ 
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            email: (user as any).email
        });

    } catch (error: any) {
        logger.error('VERIFY_OTP_ERROR', `Error verifying OTP: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: 'An error occurred while verifying OTP.' 
        });
    }
});

/**
 * POST /auth/reset-password
 * Reset password using verified OTP
 */
resetPasswordRouter.post('/', async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate inputs
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Email, OTP, and new password are required.' 
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters long.' 
            });
        }

        // Find user with matching email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email or OTP.' 
            });
        }

        // Check if OTP exists and is not expired
        if (!(user as any).resetPasswordOTP || !(user as any).resetPasswordOTPExpires) {
            return res.status(400).json({ 
                success: false,
                message: 'No OTP request found. Please request a new OTP.' 
            });
        }

        // Check if OTP is expired
        if (new Date() > (user as any).resetPasswordOTPExpires) {
            (user as any).resetPasswordOTP = undefined;
            (user as any).resetPasswordOTPExpires = undefined;
            await user.save();

            return res.status(400).json({ 
                success: false,
                message: 'OTP has expired. Please request a new one.' 
            });
        }

        // Verify OTP matches
        if ((user as any).resetPasswordOTP !== otp) {
            logger.warn('INVALID_OTP_RESET', `Invalid OTP attempt during password reset for user: ${(user as any).email}`);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid OTP. Please check and try again.' 
            });
        }
        
        // Reset/Set password using passport-local-mongoose method
        try {
            await (user as any).setPassword(newPassword);
            
            // Clear OTP fields
            (user as any).resetPasswordOTP = undefined;
            (user as any).resetPasswordOTPExpires = undefined;
            
            await user.save();

            logger.info('PASSWORD_RESET', `Password reset successfully for user: ${(user as any).email}`);

            // Send confirmation email
            try {
                await sendPasswordChangedEmail((user as any).email, (user as any).name);
            } catch (emailError: any) {
                // Log error but don't fail the password reset
                logger.error('EMAIL_SEND_FAILED', `Failed to send password changed email: ${emailError.message}`);
            }

            return res.status(200).json({ 
                success: true,
                message: 'Password has been reset successfully. You can now login with your new password.'
            });

        } catch (setPasswordError: any) {
            logger.error('SET_PASSWORD_ERROR', `Error setting new password: ${setPasswordError.message}`);
            return res.status(500).json({ 
                success: false,
                message: 'Failed to reset password. Please try again.' 
            });
        }

    } catch (error: any) {
        logger.error('RESET_PASSWORD_ERROR', `Error in reset password: ${error.message}`);
        return res.status(500).json({ 
            success: false,
            message: 'An error occurred while resetting password.' 
        });
    }
});

export default resetPasswordRouter;
