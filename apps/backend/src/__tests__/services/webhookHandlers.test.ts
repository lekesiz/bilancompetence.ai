import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as webhookHandlers from '../webhookHandlers';
import { supabase } from '../../config/supabase';
import * as emailService from '../emailService';

// Mock dependencies
jest.mock('../../config/supabase');
jest.mock('../emailService');
jest.mock('../../utils/logger');

describe('Webhook Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handlePaymentSuccess', () => {
    it('should update payment status and send confirmation email', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        amount: 9900,
        customer: 'cus_test',
        metadata: { user_id: 'user123' },
      };

      const mockUser = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser }),
          }),
        }),
      });

      (emailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      await webhookHandlers.handlePaymentSuccess(mockPaymentIntent);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Confirmation de paiement'),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        amount: 9900,
        metadata: {},
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('DB Error') }),
        }),
      });

      await expect(
        webhookHandlers.handlePaymentSuccess(mockPaymentIntent)
      ).rejects.toThrow('DB Error');
    });
  });

  describe('handlePaymentFailure', () => {
    it('should update payment status and notify user', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        last_payment_error: { message: 'Card declined' },
        metadata: { user_id: 'user123' },
      };

      const mockUser = {
        email: 'test@example.com',
        first_name: 'John',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser }),
          }),
        }),
      });

      (emailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      await webhookHandlers.handlePaymentFailure(mockPaymentIntent);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Échec du paiement'),
        })
      );
    });
  });

  describe('handleSubscriptionCreated', () => {
    it('should create subscription record and update user status', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test',
        status: 'active',
        metadata: { user_id: 'user123' },
        current_period_end: 1735689600, // Unix timestamp
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await webhookHandlers.handleSubscriptionCreated(mockSubscription);

      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if subscription creation fails', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test',
        status: 'active',
        metadata: {},
        current_period_end: 1735689600,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: new Error('Insert failed') }),
      });

      await expect(
        webhookHandlers.handleSubscriptionCreated(mockSubscription)
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('handleSubscriptionDeleted', () => {
    it('should cancel subscription and update user status', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        metadata: { user_id: 'user123' },
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await webhookHandlers.handleSubscriptionDeleted(mockSubscription);

      expect(supabase.from).toHaveBeenCalledWith('subscriptions');
      expect(supabase.from).toHaveBeenCalledWith('users');
    });
  });

  describe('handleInvoicePaid', () => {
    it('should record invoice and send receipt', async () => {
      const mockInvoice = {
        id: 'in_test123',
        customer: 'cus_test',
        amount_paid: 9900,
        subscription: 'sub_test',
        metadata: { user_id: 'user123' },
      };

      const mockUser = {
        email: 'test@example.com',
        first_name: 'John',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser }),
          }),
        }),
      });

      (emailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      await webhookHandlers.handleInvoicePaid(mockInvoice);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Reçu de paiement'),
        })
      );
    });
  });

  describe('handleInvoicePaymentFailed', () => {
    it('should notify user about payment failure', async () => {
      const mockInvoice = {
        id: 'in_test123',
        attempt_count: 2,
        next_payment_attempt: 1735776000,
        metadata: { user_id: 'user123' },
      };

      const mockUser = {
        email: 'test@example.com',
        first_name: 'John',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser }),
          }),
        }),
      });

      (emailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      await webhookHandlers.handleInvoicePaymentFailed(mockInvoice);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Échec du paiement'),
          html: expect.stringContaining('tentative 2'),
        })
      );
    });
  });
});
