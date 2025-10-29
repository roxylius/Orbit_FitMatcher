import nodemailer from 'nodemailer';
import getLogger from '../utils/logger';

const logger = getLogger('emailService');

// Import configuration from environment
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

interface EmailResult {
    success: boolean;
    messageId?: string;
}

// Create reusable transporter
const createTransporter = () => {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD
        }
    });
};

/**
 * Send OTP for password reset
 * @param email - Recipient email
 * @param otp - 6-digit OTP code
 * @param userName - User's name
 */
export const sendPasswordResetOTP = async (email: string, otp: string, userName?: string): Promise<EmailResult> => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Ocio Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - Ocio',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; }
                        .otp-box { 
                            background-color: #fff;
                            border: 2px dashed #4CAF50;
                            padding: 20px;
                            text-align: center;
                            margin: 20px 0;
                            border-radius: 10px;
                        }
                        .otp-code { 
                            font-size: 36px;
                            font-weight: bold;
                            color: #4CAF50;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
                        .warning { color: #d32f2f; font-weight: bold; }
                        .info { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset OTP</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName || 'User'},</p>
                            
                            <p>We received a request to reset your password for your Ocio account.</p>
                            
                            <p>Use the following One-Time Password (OTP) to reset your password:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                                <p class="otp-code">${otp}</p>
                            </div>
                            
                            <div class="info">
                                <strong>ℹ️ Important:</strong>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>This OTP is valid for <strong>10 minutes</strong></li>
                                    <li>Do not share this code with anyone</li>
                                    <li>Use this code only on the official Ocio website</li>
                                </ul>
                            </div>
                            
                            <p class="warning">⚠️ If you didn't request a password reset, please ignore this email and consider changing your password immediately.</p>
                            
                            <p>Best regards,<br>The Ocio Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; 2025 Ocio. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${userName || 'User'},
                
                We received a request to reset your password for your Ocio account.
                
                Your OTP Code: ${otp}
                
                ⚠️ This OTP is valid for 10 minutes only.
                
                Important:
                - Do not share this code with anyone
                - Use this code only on the official Ocio website
                
                If you didn't request a password reset, please ignore this email.
                
                Best regards,
                The Ocio Team
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('OTP_SENT', `Password reset OTP sent to ${email}, Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('EMAIL_ERROR', `Failed to send password reset OTP: ${errorMessage}`);
        throw error;
    }
};

/**
 * Send password changed confirmation email
 * @param email - Recipient email
 * @param userName - User's name
 */
export const sendPasswordChangedEmail = async (email: string, userName?: string): Promise<EmailResult> => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Ocio Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Password Changed Successfully - Ocio',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; }
                        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
                        .success { color: #4CAF50; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✓ Password Changed</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName || 'User'},</p>
                            
                            <p class="success">Your password has been successfully changed.</p>
                            
                            <p>If you did not make this change, please contact our support team immediately.</p>
                            
                            <p>Best regards,<br>The Ocio Team</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; 2025 Ocio. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${userName || 'User'},
                
                ✓ Your password has been successfully changed.
                
                If you did not make this change, please contact our support team immediately.
                
                Best regards,
                The Ocio Team
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('EMAIL_SENT', `Password changed confirmation sent to ${email}, Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('EMAIL_ERROR', `Failed to send password changed email: ${errorMessage}`);
        throw error;
    }
};
