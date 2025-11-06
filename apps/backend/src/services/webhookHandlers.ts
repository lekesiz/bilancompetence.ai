import { pool } from '../config/neon.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from './emailService.js';

/**
 * Webhook Handlers Service
 * Migrated to Neon PostgreSQL
 * Handles Stripe webhook events
 */

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(paymentIntent: any): Promise<void> {
  try {
    const { id, amount, customer, metadata } = paymentIntent;

    // Update payment record in database
    await pool.query(
      `UPDATE payments
       SET status = $1, stripe_payment_intent_id = $2, paid_at = NOW()
       WHERE stripe_payment_intent_id = $3`,
      ['succeeded', id, id]
    );

    // Get user details
    const userId = metadata?.user_id;
    if (userId) {
      const result = await pool.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (user && user.email) {
        // Send confirmation email
        await sendEmail({
          to: user.email,
          subject: 'Confirmation de paiement - BilanCompetence.AI',
          html: `
            <h2>Paiement confirmé</h2>
            <p>Bonjour ${user.first_name} ${user.last_name},</p>
            <p>Nous avons bien reçu votre paiement de ${(amount / 100).toFixed(2)}€.</p>
            <p>Votre abonnement est maintenant actif.</p>
            <p>Merci de votre confiance !</p>
          `,
        });
      }
    }

    logger.info('Payment success handled:', { paymentIntentId: id });
  } catch (error) {
    logger.error('Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailure(paymentIntent: any): Promise<void> {
  try {
    const { id, last_payment_error, metadata } = paymentIntent;

    // Update payment record
    await pool.query(
      `UPDATE payments
       SET status = $1, error_message = $2, updated_at = NOW()
       WHERE stripe_payment_intent_id = $3`,
      ['failed', last_payment_error?.message || 'Payment failed', id]
    );

    // Notify user
    const userId = metadata?.user_id;
    if (userId) {
      const result = await pool.query(
        'SELECT email, first_name FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Échec du paiement - BilanCompetence.AI',
          html: `
            <h2>Paiement échoué</h2>
            <p>Bonjour ${user.first_name},</p>
            <p>Malheureusement, votre paiement n'a pas pu être traité.</p>
            <p>Raison: ${last_payment_error?.message || 'Erreur inconnue'}</p>
            <p>Veuillez réessayer ou contacter notre support.</p>
          `,
        });
      }
    }

    logger.info('Payment failure handled:', { paymentIntentId: id });
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

/**
 * Handle subscription creation
 */
export async function handleSubscriptionCreated(subscription: any): Promise<void> {
  try {
    const { id, customer, status, metadata, current_period_end } = subscription;

    // Create subscription record
    await pool.query(
      `INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id, status, current_period_end, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        id,
        customer,
        metadata?.user_id,
        status,
        new Date(current_period_end * 1000).toISOString(),
      ]
    );

    // Update user's subscription status
    if (metadata?.user_id) {
      await pool.query(
        'UPDATE users SET subscription_status = $1 WHERE id = $2',
        ['active', metadata.user_id]
      );
    }

    logger.info('Subscription created:', { subscriptionId: id });
  } catch (error) {
    logger.error('Error handling subscription creation:', error);
    throw error;
  }
}

/**
 * Handle subscription update
 */
export async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  try {
    const { id, status, current_period_end, cancel_at_period_end } = subscription;

    await pool.query(
      `UPDATE subscriptions
       SET status = $1, current_period_end = $2, cancel_at_period_end = $3, updated_at = NOW()
       WHERE stripe_subscription_id = $4`,
      [status, new Date(current_period_end * 1000).toISOString(), cancel_at_period_end, id]
    );

    logger.info('Subscription updated:', { subscriptionId: id });
  } catch (error) {
    logger.error('Error handling subscription update:', error);
    throw error;
  }
}

/**
 * Handle subscription deletion
 */
export async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  try {
    const { id, metadata } = subscription;

    // Update subscription status
    await pool.query(
      `UPDATE subscriptions
       SET status = $1, canceled_at = NOW()
       WHERE stripe_subscription_id = $2`,
      ['canceled', id]
    );

    // Update user's subscription status
    if (metadata?.user_id) {
      await pool.query(
        'UPDATE users SET subscription_status = $1 WHERE id = $2',
        ['inactive', metadata.user_id]
      );
    }

    logger.info('Subscription deleted:', { subscriptionId: id });
  } catch (error) {
    logger.error('Error handling subscription deletion:', error);
  }
}

/**
 * Handle invoice paid
 */
export async function handleInvoicePaid(invoice: any): Promise<void> {
  try {
    const { id, customer, amount_paid, subscription, metadata } = invoice;

    // Record invoice payment
    await pool.query(
      `INSERT INTO invoices (stripe_invoice_id, stripe_customer_id, stripe_subscription_id, amount, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, customer, subscription, amount_paid, 'paid']
    );

    // Send receipt
    const userId = metadata?.user_id;
    if (userId) {
      const result = await pool.query(
        'SELECT email, first_name FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Reçu de paiement - BilanCompetence.AI',
          html: `
            <h2>Reçu de paiement</h2>
            <p>Bonjour ${user.first_name},</p>
            <p>Montant payé: ${(amount_paid / 100).toFixed(2)}€</p>
            <p>Numéro de facture: ${id}</p>
            <p>Merci pour votre paiement.</p>
          `,
        });
      }
    }

    logger.info('Invoice paid handled:', { invoiceId: id });
  } catch (error) {
    logger.error('Error handling invoice paid:', error);
  }
}

/**
 * Handle invoice payment failure
 */
export async function handleInvoicePaymentFailed(invoice: any): Promise<void> {
  try {
    const { id, attempt_count, next_payment_attempt, metadata } = invoice;

    // Notify user
    const userId = metadata?.user_id;
    if (userId) {
      const result = await pool.query(
        'SELECT email, first_name FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (user && user.email) {
        await sendEmail({
          to: user.email,
          subject: 'Échec du paiement de facture - BilanCompetence.AI',
          html: `
            <h2>Échec du paiement</h2>
            <p>Bonjour ${user.first_name},</p>
            <p>Le paiement de votre facture a échoué (tentative ${attempt_count}).</p>
            ${next_payment_attempt ? `<p>Prochaine tentative: ${new Date(next_payment_attempt * 1000).toLocaleDateString()}</p>` : ''}
            <p>Veuillez mettre à jour vos informations de paiement.</p>
          `,
        });
      }
    }

    logger.info('Invoice payment failure handled:', { invoiceId: id });
  } catch (error) {
    logger.error('Error handling invoice payment failure:', error);
  }
}
