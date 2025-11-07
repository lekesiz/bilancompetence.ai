import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { stripeService } from '../services/stripeService.js';
import {
  handlePaymentSuccess,
  handlePaymentFailure,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '../services/webhookHandlers.js';

const router = express.Router();

/**
 * @swagger
 * /api/payments/create-payment-intent:
 *   post:
 *     summary: Create a payment intent
 *     description: Create a Stripe payment intent for one-time payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - email
 *               - name
 *               - userId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in EUR
 *                 example: 99.99
 *               currency:
 *                 type: string
 *                 default: eur
 *                 example: eur
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   description: Client secret for Stripe payment
 *                 paymentIntentId:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
      prices: prices.map((price: any) => ({
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
      invoices: invoices.map((invoice: any) => ({
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
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
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
