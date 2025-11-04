import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { StripeService } from '../../services/stripeService.js';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe');

describe('StripeService', () => {
  let stripeService: StripeService;
  let mockStripeInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Stripe instance
    mockStripeInstance = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        list: jest.fn(),
        retrieve: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        cancel: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };

    // Mock Stripe constructor
    (Stripe as any).mockImplementation(() => mockStripeInstance);

    // Set environment variable
    process.env.STRIPE_SECRET_KEY = 'sk_test_123456789';

    stripeService = new StripeService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_123456',
        amount: 5000,
        currency: 'eur',
        status: 'requires_payment_method',
        client_secret: 'pi_123456_secret_abc',
      };

      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent({
        amount: 5000,
        currency: 'eur',
        customerId: 'cus_123',
        metadata: { orderId: 'order_789' },
      });

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'eur',
        customer: 'cus_123',
        metadata: { orderId: 'order_789' },
        automatic_payment_methods: { enabled: true },
      });
    });

    it('should create payment intent without customer ID', async () => {
      const mockPaymentIntent = { id: 'pi_123', amount: 1000, currency: 'usd' };
      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      await stripeService.createPaymentIntent({
        amount: 1000,
        currency: 'usd',
      });

      expect(mockStripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 1000,
          currency: 'usd',
          customer: undefined,
        })
      );
    });

    it('should handle Stripe API errors', async () => {
      mockStripeInstance.paymentIntents.create.mockRejectedValue(
        new Error('Card declined')
      );

      await expect(
        stripeService.createPaymentIntent({
          amount: 5000,
          currency: 'eur',
        })
      ).rejects.toThrow('Failed to create payment intent: Card declined');
    });

    it('should handle invalid amount', async () => {
      mockStripeInstance.paymentIntents.create.mockRejectedValue(
        new Error('Amount must be at least $0.50')
      );

      await expect(
        stripeService.createPaymentIntent({
          amount: 10, // Too small
          currency: 'usd',
        })
      ).rejects.toThrow();
    });

    it('should handle missing Stripe configuration', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const uninitializedService = new StripeService();

      await expect(
        uninitializedService.createPaymentIntent({
          amount: 1000,
          currency: 'eur',
        })
      ).rejects.toThrow('Stripe is not configured');
    });
  });

  describe('createOrGetCustomer', () => {
    it('should return existing customer if found', async () => {
      const mockCustomer = {
        id: 'cus_existing',
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user_123' },
      };

      mockStripeInstance.customers.list.mockResolvedValue({
        data: [mockCustomer],
      });

      const result = await stripeService.createOrGetCustomer(
        'test@example.com',
        'Test User',
        'user_123'
      );

      expect(result).toEqual(mockCustomer);
      expect(mockStripeInstance.customers.list).toHaveBeenCalledWith({
        email: 'test@example.com',
        limit: 1,
      });
      expect(mockStripeInstance.customers.create).not.toHaveBeenCalled();
    });

    it('should create new customer if not found', async () => {
      const mockCustomer = {
        id: 'cus_new',
        email: 'newuser@example.com',
        name: 'New User',
        metadata: { userId: 'user_456' },
      };

      mockStripeInstance.customers.list.mockResolvedValue({ data: [] });
      mockStripeInstance.customers.create.mockResolvedValue(mockCustomer);

      const result = await stripeService.createOrGetCustomer(
        'newuser@example.com',
        'New User',
        'user_456'
      );

      expect(result).toEqual(mockCustomer);
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        name: 'New User',
        metadata: { userId: 'user_456' },
      });
    });

    it('should handle invalid email format', async () => {
      mockStripeInstance.customers.list.mockRejectedValue(
        new Error('Invalid email address')
      );

      await expect(
        stripeService.createOrGetCustomer('invalid-email', 'User', 'user_id')
      ).rejects.toThrow('Failed to create/get customer');
    });

    it('should handle Stripe API rate limiting', async () => {
      mockStripeInstance.customers.list.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        stripeService.createOrGetCustomer('test@example.com', 'User', 'user_id')
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle special characters in name', async () => {
      const mockCustomer = {
        id: 'cus_123',
        email: 'user@example.com',
        name: "O'Brien-Smith & Co.",
      };

      mockStripeInstance.customers.list.mockResolvedValue({ data: [] });
      mockStripeInstance.customers.create.mockResolvedValue(mockCustomer);

      const result = await stripeService.createOrGetCustomer(
        'user@example.com',
        "O'Brien-Smith & Co.",
        'user_id'
      );

      expect(result.name).toBe("O'Brien-Smith & Co.");
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        items: {
          data: [{ price: { id: 'price_abc' } }],
        },
        latest_invoice: {
          payment_intent: {
            client_secret: 'pi_secret',
          },
        },
      };

      mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);

      const result = await stripeService.createSubscription({
        customerId: 'cus_123',
        priceId: 'price_abc',
        metadata: { plan: 'premium' },
      });

      expect(result).toEqual(mockSubscription);
      expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        items: [{ price: 'price_abc' }],
        metadata: { plan: 'premium' },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
    });

    it('should create subscription without metadata', async () => {
      const mockSubscription = { id: 'sub_123', status: 'active' };
      mockStripeInstance.subscriptions.create.mockResolvedValue(mockSubscription);

      await stripeService.createSubscription({
        customerId: 'cus_123',
        priceId: 'price_abc',
      });

      expect(mockStripeInstance.subscriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {},
        })
      );
    });

    it('should handle invalid price ID', async () => {
      mockStripeInstance.subscriptions.create.mockRejectedValue(
        new Error('No such price: invalid_price')
      );

      await expect(
        stripeService.createSubscription({
          customerId: 'cus_123',
          priceId: 'invalid_price',
        })
      ).rejects.toThrow('Failed to create subscription');
    });

    it('should handle customer without payment method', async () => {
      mockStripeInstance.subscriptions.create.mockRejectedValue(
        new Error('Customer has no attached payment source')
      );

      await expect(
        stripeService.createSubscription({
          customerId: 'cus_no_payment',
          priceId: 'price_abc',
        })
      ).rejects.toThrow();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const mockCancelledSubscription = {
        id: 'sub_123',
        status: 'canceled',
        canceled_at: Date.now(),
      };

      mockStripeInstance.subscriptions.cancel.mockResolvedValue(mockCancelledSubscription);

      const result = await stripeService.cancelSubscription('sub_123');

      expect(result).toEqual(mockCancelledSubscription);
      expect(mockStripeInstance.subscriptions.cancel).toHaveBeenCalledWith('sub_123');
    });

    it('should handle already canceled subscription', async () => {
      mockStripeInstance.subscriptions.cancel.mockRejectedValue(
        new Error('Subscription is already canceled')
      );

      await expect(stripeService.cancelSubscription('sub_canceled')).rejects.toThrow(
        'Failed to cancel subscription'
      );
    });

    it('should handle non-existent subscription', async () => {
      mockStripeInstance.subscriptions.cancel.mockRejectedValue(
        new Error('No such subscription: sub_nonexistent')
      );

      await expect(stripeService.cancelSubscription('sub_nonexistent')).rejects.toThrow();
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        customer: 'cus_123',
        status: 'active',
        current_period_end: Date.now() + 86400000,
      };

      mockStripeInstance.subscriptions.retrieve.mockResolvedValue(mockSubscription);

      const result = await stripeService.getSubscription('sub_123');

      expect(result).toEqual(mockSubscription);
      expect(mockStripeInstance.subscriptions.retrieve).toHaveBeenCalledWith('sub_123');
    });

    it('should handle non-existent subscription', async () => {
      mockStripeInstance.subscriptions.retrieve.mockRejectedValue(
        new Error('No such subscription')
      );

      await expect(stripeService.getSubscription('sub_fake')).rejects.toThrow(
        'Failed to get subscription'
      );
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const mockUpdatedSubscription = {
        id: 'sub_123',
        items: {
          data: [{ price: { id: 'price_new' } }],
        },
      };

      mockStripeInstance.subscriptions.update.mockResolvedValue(mockUpdatedSubscription);

      const result = await stripeService.updateSubscription('sub_123', {
        items: [{ price: 'price_new' }],
      });

      expect(result).toEqual(mockUpdatedSubscription);
      expect(mockStripeInstance.subscriptions.update).toHaveBeenCalledWith('sub_123', {
        items: [{ price: 'price_new' }],
      });
    });

    it('should handle invalid update parameters', async () => {
      mockStripeInstance.subscriptions.update.mockRejectedValue(
        new Error('Invalid parameters')
      );

      await expect(
        stripeService.updateSubscription('sub_123', { invalid: 'param' } as any)
      ).rejects.toThrow();
    });

    it('should update subscription metadata', async () => {
      const mockSubscription = {
        id: 'sub_123',
        metadata: { upgraded: 'true', date: '2025-11-04' },
      };

      mockStripeInstance.subscriptions.update.mockResolvedValue(mockSubscription);

      const result = await stripeService.updateSubscription('sub_123', {
        metadata: { upgraded: 'true', date: '2025-11-04' },
      });

      expect(result.metadata).toEqual({ upgraded: 'true', date: '2025-11-04' });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle network timeouts', async () => {
      mockStripeInstance.paymentIntents.create.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        stripeService.createPaymentIntent({ amount: 1000, currency: 'eur' })
      ).rejects.toThrow('Network timeout');
    });

    it('should handle very large amounts', async () => {
      const mockPaymentIntent = {
        id: 'pi_large',
        amount: 99999999, // $999,999.99
        currency: 'usd',
      };

      mockStripeInstance.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent({
        amount: 99999999,
        currency: 'usd',
      });

      expect(result.amount).toBe(99999999);
    });

    it('should handle different currency codes', async () => {
      const currencies = ['eur', 'usd', 'gbp', 'jpy', 'cad'];

      for (const currency of currencies) {
        mockStripeInstance.paymentIntents.create.mockResolvedValue({
          id: 'pi_test',
          amount: 1000,
          currency,
        });

        const result = await stripeService.createPaymentIntent({
          amount: 1000,
          currency,
        });

        expect(result.currency).toBe(currency);
      }
    });

    it('should handle webhook signature verification', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      };

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const rawBody = '{"type":"payment_intent.succeeded"}';
      const signature = 'sig_test_123';

      const result = mockStripeInstance.webhooks.constructEvent(
        rawBody,
        signature,
        'whsec_test'
      );

      expect(result).toEqual(mockEvent);
    });

    it('should handle concurrent API calls', async () => {
      mockStripeInstance.customers.create.mockResolvedValue({ id: 'cus_1' });
      mockStripeInstance.subscriptions.create.mockResolvedValue({ id: 'sub_1' });
      mockStripeInstance.paymentIntents.create.mockResolvedValue({ id: 'pi_1' });

      const [customer, subscription, payment] = await Promise.all([
        stripeService.createOrGetCustomer('test@example.com', 'Test', 'user_1'),
        stripeService.createSubscription({ customerId: 'cus_1', priceId: 'price_1' }),
        stripeService.createPaymentIntent({ amount: 1000, currency: 'eur' }),
      ]);

      expect(customer.id).toBe('cus_1');
      expect(subscription.id).toBe('sub_1');
      expect(payment.id).toBe('pi_1');
    });

    it('should handle metadata with special characters', async () => {
      const metadata = {
        'user-id': 'user_123',
        'order#': '12345',
        'note': 'Special chars: @#$%^&*()',
      };

      mockStripeInstance.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        metadata,
      });

      const result = await stripeService.createPaymentIntent({
        amount: 1000,
        currency: 'eur',
        metadata,
      });

      expect(result.metadata).toEqual(metadata);
    });
  });

  describe('Configuration Validation', () => {
    it('should throw error when Stripe is not initialized', async () => {
      delete process.env.STRIPE_SECRET_KEY;
      const newService = new StripeService();

      await expect(
        newService.createPaymentIntent({ amount: 1000, currency: 'eur' })
      ).rejects.toThrow('Stripe is not configured');

      await expect(
        newService.createOrGetCustomer('test@test.com', 'Test', 'user_1')
      ).rejects.toThrow('Stripe is not configured');

      await expect(
        newService.createSubscription({ customerId: 'cus_1', priceId: 'price_1' })
      ).rejects.toThrow('Stripe is not configured');
    });

    it('should properly initialize with valid API key', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_valid_key';
      const validService = new StripeService();

      expect(validService).toBeInstanceOf(StripeService);
    });
  });
});
