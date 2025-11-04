import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from './emailService.js';

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(paymentIntent: any): Promise<void> {
  try {
    const { id, amount, customer, metadata } = paymentIntent;

    // Update payment record in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        stripe_payment_intent_id: id,
        paid_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', id);

    if (updateError) {
      logger.error('Error updating payment status:', updateError);
      throw updateError;
    }

    // Get user details
    const userId = metadata?.user_id;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();

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
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: last_payment_error?.message || 'Payment failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', id);

    if (updateError) {
      logger.error('Error updating payment failure:', updateError);
    }

    // Notify user
    const userId = metadata?.user_id;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single();

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
    const { error: insertError } = await supabase.from('subscriptions').insert({
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      user_id: metadata?.user_id,
      status: status,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      logger.error('Error creating subscription:', insertError);
      throw insertError;
    }

    // Update user's subscription status
    if (metadata?.user_id) {
      await supabase
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('id', metadata.user_id);
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

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        current_period_end: new Date(current_period_end * 1000).toISOString(),
        cancel_at_period_end: cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', id);

    if (updateError) {
      logger.error('Error updating subscription:', updateError);
      throw updateError;
    }

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
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', id);

    if (updateError) {
      logger.error('Error deleting subscription:', updateError);
    }

    // Update user's subscription status
    if (metadata?.user_id) {
      await supabase
        .from('users')
        .update({ subscription_status: 'inactive' })
        .eq('id', metadata.user_id);
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
    const { error: insertError } = await supabase.from('invoices').insert({
      stripe_invoice_id: id,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      amount: amount_paid,
      status: 'paid',
      paid_at: new Date().toISOString(),
    });

    if (insertError) {
      logger.error('Error recording invoice:', insertError);
    }

    // Send receipt
    const userId = metadata?.user_id;
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single();

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
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name')
        .eq('id', userId)
        .single();

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
