import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripeService.js';

const router = Router();

/**
 * POST /api/payments/create-payment-intent
 * Create a payment intent for one-time payments
 */
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'eur', email, name, userId } = req.body;

    if (!amount || !email || !name || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or get customer
    const customer = await stripeService.createOrGetCustomer(email, name, userId);

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customerId: customer.id,
      metadata: {
        userId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/create-subscription
 * Create a subscription
 */
router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    const { priceId, email, name, userId } = req.body;

    if (!priceId || !email || !name || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or get customer
    const customer = await stripeService.createOrGetCustomer(email, name, userId);

    // Create subscription
    const subscription = await stripeService.createSubscription({
      customerId: customer.id,
      priceId,
      metadata: {
        userId,
      },
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/create-checkout-session
 * Create a Stripe Checkout session
 */
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { priceId, email, name, userId, successUrl, cancelUrl } = req.body;

    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let customerId: string | undefined;

    if (email && name && userId) {
      const customer = await stripeService.createOrGetCustomer(email, name, userId);
      customerId = customer.id;
    }

    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        userId: userId || '',
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/cancel-subscription
 * Cancel a subscription
 */
router.post('/cancel-subscription', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscription ID' });
    }

    const subscription = await stripeService.cancelSubscription(subscriptionId);

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      canceledAt: subscription.canceled_at,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payments/subscription/:subscriptionId
 * Get subscription details
 */
router.get('/subscription/:subscriptionId', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await stripeService.getSubscription(subscriptionId);

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      items: subscription.items.data,
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/customer-portal
 * Create customer portal session
 */
router.post('/customer-portal', async (req: Request, res: Response) => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId || !returnUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripeService.createCustomerPortalSession(customerId, returnUrl);

    res.json({
      url: session.url,
    });
  } catch (error: any) {
    console.error('Customer portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payments/prices
 * List all active prices
 */
router.get('/prices', async (req: Request, res: Response) => {
  try {
    const prices = await stripeService.listPrices();

    res.json({
      prices: prices.map((price) => ({
        id: price.id,
        productId: price.product,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
      })),
    });
  } catch (error: any) {
    console.error('List prices error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/payments/invoices/:customerId
 * List customer invoices
 */
router.get('/invoices/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const invoices = await stripeService.listCustomerInvoices(customerId, limit);

    res.json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
        createdAt: invoice.created,
      })),
    });
  } catch (error: any) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const event = stripeService.constructWebhookEvent(req.body, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        // TODO: Update database, send confirmation email
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        // TODO: Notify user, update database
        break;

      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        // TODO: Update database, activate subscription
        break;

      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        // TODO: Update database
        break;

      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        // TODO: Deactivate subscription, update database
        break;

      case 'invoice.paid':
        console.log('Invoice paid:', event.data.object);
        // TODO: Send receipt, update database
        break;

      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object);
        // TODO: Notify user, retry payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
