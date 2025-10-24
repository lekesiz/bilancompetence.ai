import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export interface PaymentIntentData {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customerId,
        metadata: data.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Stripe payment intent error:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(email: string, name: string, userId: string): Promise<Stripe.Customer> {
    try {
      // Check if customer already exists
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error: any) {
      console.error('Stripe customer error:', error);
      throw new Error(`Failed to create/get customer: ${error.message}`);
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(data: SubscriptionData): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        metadata: data.metadata || {},
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return subscription;
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error: any) {
      console.error('Stripe cancel subscription error:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error: any) {
      console.error('Stripe get subscription error:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, updates);
      return subscription;
    } catch (error: any) {
      console.error('Stripe update subscription error:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  /**
   * Construct webhook event
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Get customer portal session
   */
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error: any) {
      console.error('Stripe portal session error:', error);
      throw new Error(`Failed to create portal session: ${error.message}`);
    }
  }

  /**
   * Create checkout session
   */
  async createCheckoutSession(params: {
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: params.customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata || {},
      });

      return session;
    } catch (error: any) {
      console.error('Stripe checkout session error:', error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * List all prices
   */
  async listPrices(): Promise<Stripe.Price[]> {
    try {
      const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      return prices.data;
    } catch (error: any) {
      console.error('Stripe list prices error:', error);
      throw new Error(`Failed to list prices: ${error.message}`);
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice;
    } catch (error: any) {
      console.error('Stripe get invoice error:', error);
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  /**
   * List customer invoices
   */
  async listCustomerInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return invoices.data;
    } catch (error: any) {
      console.error('Stripe list invoices error:', error);
      throw new Error(`Failed to list invoices: ${error.message}`);
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

