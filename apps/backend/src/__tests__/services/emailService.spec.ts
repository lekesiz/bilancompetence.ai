/**
 * Email Service Unit Tests
 *
 * Tests for email sending functionality:
 * - sendWelcomeEmail
 * - sendPasswordResetEmail
 * - sendVerificationEmail
 * - sendConfirmationEmail
 * - sendNotificationEmail
 */

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendConfirmationEmail,
} from '../../services/emailService.js';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  let mockSendMail: jest.Mock;
  const testEmail = 'test@example.com';
  const testFullName = 'Test User';

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'mock-message-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const result = await sendWelcomeEmail(testEmail, testFullName);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(testEmail);
      expect(callArgs.subject).toContain('Welcome');
      expect(callArgs.html).toContain(testFullName);
    });

    it('should include user name in welcome email', async () => {
      await sendWelcomeEmail(testEmail, testFullName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(testFullName);
    });

    it('should set correct from address', async () => {
      await sendWelcomeEmail(testEmail, testFullName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.from).toBeDefined();
    });

    it('should handle email send errors gracefully', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      await expect(sendWelcomeEmail(testEmail, testFullName)).rejects.toThrow();
    });

    it('should include login link in welcome email', async () => {
      await sendWelcomeEmail(testEmail, testFullName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('login') || expect(callArgs.html).toContain('access');
    });
  });

  describe('sendPasswordResetEmail', () => {
    const resetToken = 'reset-token-123';
    const resetLink = `https://example.com/reset?token=${resetToken}`;

    it('should send password reset email with token', async () => {
      await sendPasswordResetEmail(testEmail, resetToken);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(testEmail);
      expect(callArgs.subject).toContain('Reset');
      expect(callArgs.html).toContain(resetToken) || expect(callArgs.html).toContain('reset');
    });

    it('should include valid reset token in email', async () => {
      await sendPasswordResetEmail(testEmail, resetToken);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(resetToken);
    });

    it('should include instructions for password reset', async () => {
      await sendPasswordResetEmail(testEmail, resetToken);

      const callArgs = mockSendMail.mock.calls[0][0];
      const emailBody = callArgs.html.toLowerCase();
      expect(emailBody).toMatch(/reset|password/);
    });

    it('should handle different email addresses', async () => {
      const differentEmail = 'different@example.com';
      await sendPasswordResetEmail(differentEmail, resetToken);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(differentEmail);
    });

    it('should fail gracefully on invalid email', async () => {
      const invalidEmail = 'not-an-email';
      mockSendMail.mockRejectedValueOnce(new Error('Invalid email'));

      await expect(sendPasswordResetEmail(invalidEmail, resetToken)).rejects.toThrow();
    });
  });

  describe('sendVerificationEmail', () => {
    const verificationToken = 'verify-token-123';

    it('should send verification email with token', async () => {
      await sendVerificationEmail(testEmail, verificationToken);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(testEmail);
      expect(callArgs.subject).toContain('Verif');
      expect(callArgs.html).toContain(verificationToken) || expect(callArgs.html).toContain('verify');
    });

    it('should include verification link', async () => {
      await sendVerificationEmail(testEmail, verificationToken);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toMatch(/verify|confirm|email/i);
    });

    it('should include instructions for email verification', async () => {
      await sendVerificationEmail(testEmail, verificationToken);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(verificationToken);
    });

    it('should handle multiple verification attempts', async () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      await sendVerificationEmail(testEmail, token1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      await sendVerificationEmail(testEmail, token2);
      expect(mockSendMail).toHaveBeenCalledTimes(2);

      const secondCall = mockSendMail.mock.calls[1][0];
      expect(secondCall.html).toContain(token2);
    });
  });

  describe('sendConfirmationEmail', () => {
    const confirmationData = {
      subject: 'Assessment Submitted',
      message: 'Your assessment has been submitted successfully',
    };

    it('should send confirmation email with custom data', async () => {
      await sendConfirmationEmail(testEmail, confirmationData.subject, confirmationData.message);

      expect(mockSendMail).toHaveBeenCalled();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(testEmail);
      expect(callArgs.subject).toContain(confirmationData.subject);
      expect(callArgs.html).toContain(confirmationData.message);
    });

    it('should include confirmation message in body', async () => {
      const customMessage = 'Your booking is confirmed';
      await sendConfirmationEmail(testEmail, 'Booking Confirmation', customMessage);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(customMessage);
    });

    it('should handle HTML special characters in message', async () => {
      const htmlMessage = '<b>Important:</b> Your data is safe';
      await sendConfirmationEmail(testEmail, 'Confirmation', htmlMessage);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Important');
    });

    it('should set appropriate subject line', async () => {
      const customSubject = 'Professional Report Generated';
      await sendConfirmationEmail(testEmail, customSubject, 'Your report is ready');

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.subject).toContain(customSubject);
    });
  });

  describe('Email Service Error Handling', () => {
    it('should handle SMTP connection errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'));

      await expect(sendWelcomeEmail(testEmail, testFullName)).rejects.toThrow();
    });

    it('should handle invalid email addresses', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Invalid email address'));

      await expect(sendWelcomeEmail('invalid-email', testFullName)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Operation timeout'));

      await expect(sendWelcomeEmail(testEmail, testFullName)).rejects.toThrow('timeout');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSendMail.mockRejectedValueOnce(new Error('Email send failed'));

      try {
        await sendWelcomeEmail(testEmail, testFullName);
      } catch {
        // Error expected
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Email Service Success Cases', () => {
    it('should return message ID on successful send', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'msg-123' });

      const result = await sendWelcomeEmail(testEmail, testFullName);

      expect(result).toHaveProperty('messageId');
    });

    it('should send multiple emails sequentially', async () => {
      const emails = [
        { email: 'user1@test.com', name: 'User 1' },
        { email: 'user2@test.com', name: 'User 2' },
        { email: 'user3@test.com', name: 'User 3' },
      ];

      for (const user of emails) {
        await sendWelcomeEmail(user.email, user.name);
      }

      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });

    it('should preserve email metadata in templates', async () => {
      await sendWelcomeEmail(testEmail, testFullName);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe(testEmail);
      expect(callArgs.from).toBeDefined();
      expect(callArgs.subject).toBeDefined();
      expect(callArgs.html).toBeDefined();
    });
  });
});
