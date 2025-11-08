import { Resend } from 'resend';
import { logger } from '../utils/logger.js';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';

// 🔒 SECURITY: Fail-fast if RESEND_API_KEY is not set
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  logger.error('CRITICAL: RESEND_API_KEY environment variable is required');
  throw new Error('RESEND_API_KEY environment variable is required for email service');
}

const resend = new Resend(apiKey);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class ResendService {
  private defaultFrom = 'BilanCompetence.AI <noreply@bilancompetence.ai>';

  /**
   * Send a generic email
   */
  async sendEmail(data: EmailData): Promise<{ id: string }> {
    try {
      const result = await resend.emails.send({
        from: data.from || this.defaultFrom,
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      return { id: result.data?.id || '' };
    } catch (error: unknown) {
      logger.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send bilan completion email
   */
  async sendBilanCompleteEmail(
    to: string,
    name: string,
    bilanId: string,
    documentsUrl: string
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .achievement { background: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Félicitations ${name} !</h1>
              <p>Vous avez terminé votre bilan de compétences</p>
            </div>
            <div class="content">
              <p>Cher(e) ${name},</p>
              
              <p>Nous sommes heureux de vous annoncer que vous avez complété avec succès votre bilan de compétences sur BilanCompetence.AI !</p>
              
              <div class="achievement">
                <h3>🏆 Vos accomplissements</h3>
                <ul>
                  <li>✅ Phase préliminaire complétée</li>
                  <li>✅ Phase d'investigation complétée</li>
                  <li>✅ Phase de conclusion complétée</li>
                  <li>✅ Tests psychométriques réalisés</li>
                  <li>✅ Plan d'action personnalisé créé</li>
                </ul>
              </div>
              
              <p><strong>Vos documents sont prêts :</strong></p>
              <ul>
                <li>📄 Synthèse de bilan</li>
                <li>📜 Attestation de réalisation</li>
                <li>📋 Plan d'action personnalisé</li>
              </ul>
              
              <a href="${documentsUrl}" class="button">Télécharger mes documents</a>
              
              <p>Ces documents sont confidentiels et vous appartiennent. Vous pouvez les utiliser pour vos démarches professionnelles.</p>
              
              <p><strong>Et maintenant ?</strong></p>
              <p>Votre parcours ne s'arrête pas là ! Nous vous accompagnons dans la mise en œuvre de votre projet professionnel.</p>
              
              <p>Cordialement,<br>L'équipe BilanCompetence.AI</p>
            </div>
            <div class="footer">
              <p>© 2025 BilanCompetence.AI - Tous droits réservés</p>
              <p>Bilan ID: ${bilanId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '🎊 Félicitations ! Votre bilan de compétences est terminé',
      html,
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(
    to: string,
    name: string,
    amount: number,
    invoiceUrl: string
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .amount { background: #f5f3ff; border: 2px solid #8B5CF6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Paiement confirmé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              
              <p>Nous avons bien reçu votre paiement. Merci pour votre confiance !</p>
              
              <div class="amount">
                <h2 style="margin: 0; color: #8B5CF6;">${amount.toFixed(2)} €</h2>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Montant payé</p>
              </div>
              
              <p><strong>Détails de la transaction :</strong></p>
              <ul>
                <li>Date : ${new Date().toLocaleDateString('fr-FR')}</li>
                <li>Montant : ${amount.toFixed(2)} €</li>
                <li>Statut : Payé ✅</li>
              </ul>
              
              <a href="${invoiceUrl}" class="button">Télécharger la facture</a>
              
              <p>Vous pouvez maintenant accéder à tous les services de votre abonnement.</p>
              
              <p>Si vous avez des questions concernant votre paiement, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe BilanCompetence.AI</p>
            </div>
            <div class="footer">
              <p>© 2025 BilanCompetence.AI - Tous droits réservés</p>
              <p>Cette facture a été générée automatiquement.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '✅ Confirmation de paiement - BilanCompetence.AI',
      html,
    });
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminderEmail(
    to: string,
    name: string,
    appointmentDate: Date,
    consultantName: string
  ): Promise<{ id: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .appointment { background: #fffbeb; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rappel de rendez-vous</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              
              <p>Nous vous rappelons votre prochain rendez-vous avec votre consultant.</p>
              
              <div class="appointment">
                <h3>📅 Détails du rendez-vous</h3>
                <ul>
                  <li><strong>Date :</strong> ${appointmentDate.toLocaleDateString('fr-FR')}</li>
                  <li><strong>Heure :</strong> ${appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</li>
                  <li><strong>Consultant :</strong> ${consultantName}</li>
                </ul>
              </div>
              
              <p><strong>Préparation recommandée :</strong></p>
              <ul>
                <li>Relire vos notes de la dernière séance</li>
                <li>Préparer vos questions</li>
                <li>Avoir vos documents à portée de main</li>
              </ul>
              
              <p>Si vous ne pouvez pas assister à ce rendez-vous, merci de nous prévenir au moins 24h à l'avance.</p>
              
              <p>À bientôt,<br>L'équipe BilanCompetence.AI</p>
            </div>
            <div class="footer">
              <p>© 2025 BilanCompetence.AI - Tous droits réservés</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: '⏰ Rappel : Rendez-vous bilan de compétences',
      html,
    });
  }
}

// Export singleton instance
export const resendService = new ResendService();
