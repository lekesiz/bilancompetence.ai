import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { logAndThrow, validateRequired, DatabaseError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

// Email configuration - update with SendGrid or similar
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Alternative: SendGrid setup (uncomment to use)
// const transporter = nodemailer.createTransport(sgMail);

/**
 * Generate a secure token for email verification or password reset
 */
export function generateToken(length: number = 32): string {
  try {
    validateRequired({ length }, ['length']);

    if (length <= 0) {
      throw new ValidationError('Token length must be greater than 0');
    }

    const token = randomBytes(length).toString('hex');
    logger.info('Token generated successfully', { tokenLength: length });
    return token;
  } catch (error) {
    logAndThrow('Failed to generate token', error);
  }
}

/**
 * Send email verification link
 */
export async function sendEmailVerificationEmail(
  email: string,
  verificationToken: string,
  fullName: string
) {
  try {
    validateRequired({ email, verificationToken, fullName }, ['email', 'verificationToken', 'fullName']);

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@bilancompetence.ai',
      to: email,
      subject: 'Verify your BilanCompetence email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BilanCompetence, ${fullName}!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p><small>${verificationUrl}</small></p>
          <p>This link will expire in 24 hours.</p>
          <hr>
          <p><small>If you did not create this account, please ignore this email.</small></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email verification sent successfully', { email });
  } catch (error) {
    logAndThrow('Failed to send email verification', error);
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  fullName: string
) {
  try {
    validateRequired({ email, resetToken, fullName }, ['email', 'resetToken', 'fullName']);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@bilancompetence.ai',
      to: email,
      subject: 'Reset your BilanCompetence password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${fullName},</p>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <p>
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p><small>${resetUrl}</small></p>
          <p>This link will expire in 1 hour.</p>
          <hr>
          <p><small>If you did not request this, please ignore this email.</small></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent successfully', { email });
  } catch (error) {
    logAndThrow('Failed to send password reset email', error);
  }
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(email: string, fullName: string) {
  try {
    validateRequired({ email, fullName }, ['email', 'fullName']);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@bilancompetence.ai',
      to: email,
      subject: 'Welcome to BilanCompetence!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to BilanCompetence, ${fullName}!</h1>
          <p>We're excited to have you on board.</p>
          <h3>Getting Started:</h3>
          <ol>
            <li>Verify your email address</li>
            <li>Complete your profile</li>
            <li>Start your first assessment</li>
          </ol>
          <p>
            <a href="${process.env.FRONTEND_URL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <hr>
          <p><strong>Questions?</strong> Visit our help center or contact support at hello@bilancompetence.ai</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent successfully', { email });
  } catch (error) {
    logAndThrow('Failed to send welcome email', error);
  }
}

/**
 * Send account confirmation email
 */
export async function sendAccountConfirmationEmail(email: string, fullName: string) {
  try {
    validateRequired({ email, fullName }, ['email', 'fullName']);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@bilancompetence.ai',
      to: email,
      subject: 'Your account is confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Confirmed!</h2>
          <p>Hi ${fullName},</p>
          <p>Your email has been verified and your account is now fully active.</p>
          <p>You can now:</p>
          <ul>
            <li>Access all features</li>
            <li>Create assessments</li>
            <li>Manage your profile</li>
          </ul>
          <p>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Dashboard
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('Account confirmation email sent successfully', { email });
  } catch (error) {
    logAndThrow('Failed to send account confirmation email', error);
  }
}

export default {
  generateToken,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendAccountConfirmationEmail,
};
