/**
 * PDF Service (Neon PostgreSQL)
 * Simplified PDF generation for assessment reports
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AssessmentData {
  id: string;
  title: string;
  status: string;
  assessment_type: string;
  beneficiary_id: string;
  consultant_id?: string;
  organization_id?: string;
  start_date: string;
  end_date?: string;
  progress_percentage: number;
  satisfaction_score?: number;
  created_at: Date;
  updated_at: Date;
}

interface CompetencyData {
  id: string;
  skill_name: string;
  category: string;
  self_assessment_level: number;
  self_interest_level: number;
  consultant_assessment_level?: number;
  consultant_notes?: string;
}

interface RecommendationData {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: number;
  match_score?: number;
}

// ============================================================================
// PDF GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate assessment PDF report
 */
export async function generateAssessmentPDF(
  assessmentId: string,
  userId: string,
  reportType: 'preliminary' | 'investigation' | 'conclusion' = 'preliminary'
): Promise<Buffer> {
  try {
    // Fetch assessment data
    const assessmentResult = await query<AssessmentData>(
      null,
      `SELECT * FROM assessments WHERE id = $1`,
      [assessmentId]
    );

    if (assessmentResult.length === 0) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const assessment = assessmentResult[0];

    // Verify access control
    if (assessment.beneficiary_id !== userId && assessment.consultant_id !== userId) {
      throw new Error('Unauthorized access to assessment');
    }

    // Fetch user data
    const userResult = await query<any>(
      null,
      `SELECT full_name, email FROM users WHERE id = $1`,
      [assessment.beneficiary_id]
    );

    const beneficiaryName = userResult[0]?.full_name || 'Unknown';
    const beneficiaryEmail = userResult[0]?.email || '';

    // Fetch competencies
    const competencies = await query<CompetencyData>(
      null,
      `SELECT * FROM assessment_competencies WHERE assessment_id = $1 ORDER BY category, skill_name`,
      [assessmentId]
    );

    // Fetch recommendations
    const recommendations = await query<RecommendationData>(
      null,
      `SELECT * FROM recommendations WHERE bilan_id = $1 ORDER BY priority DESC`,
      [assessmentId]
    );

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    // Title
    page.drawText('Rapport de Bilan de Compétences', {
      x: 50,
      y: yPosition,
      size: 24,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });

    yPosition -= 40;

    // Assessment info
    page.drawText(`Titre: ${assessment.title}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });

    yPosition -= 25;

    page.drawText(`Bénéficiaire: ${beneficiaryName}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 20;

    page.drawText(`Email: ${beneficiaryEmail}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 20;

    page.drawText(`Type: ${assessment.assessment_type}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 20;

    page.drawText(`Statut: ${assessment.status}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 20;

    page.drawText(`Progression: ${assessment.progress_percentage}%`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 40;

    // Competencies section
    if (competencies.length > 0) {
      page.drawText('Compétences Évaluées', {
        x: 50,
        y: yPosition,
        size: 16,
        font: fontBold,
        color: rgb(0, 0.2, 0.4),
      });

      yPosition -= 30;

      for (const comp of competencies.slice(0, 10)) { // Limit to 10 for first page
        if (yPosition < 100) break; // Avoid page overflow

        page.drawText(`• ${comp.skill_name} (${comp.category})`, {
          x: 60,
          y: yPosition,
          size: 10,
          font,
        });

        yPosition -= 15;

        page.drawText(`  Auto-évaluation: ${comp.self_assessment_level}/5, Intérêt: ${comp.self_interest_level}/5`, {
          x: 70,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });

        yPosition -= 20;
      }

      yPosition -= 10;
    }

    // Recommendations section
    if (recommendations.length > 0 && yPosition > 150) {
      page.drawText('Recommandations', {
        x: 50,
        y: yPosition,
        size: 16,
        font: fontBold,
        color: rgb(0, 0.2, 0.4),
      });

      yPosition -= 30;

      for (const rec of recommendations.slice(0, 5)) { // Limit to 5
        if (yPosition < 100) break;

        page.drawText(`• ${rec.title}`, {
          x: 60,
          y: yPosition,
          size: 10,
          font,
        });

        yPosition -= 15;

        if (rec.description) {
          const descLines = wrapText(rec.description, 70);
          for (const line of descLines.slice(0, 2)) { // Max 2 lines per recommendation
            if (yPosition < 100) break;
            page.drawText(`  ${line}`, {
              x: 70,
              y: yPosition,
              size: 9,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            yPosition -= 15;
          }
        }

        yPosition -= 10;
      }
    }

    // Footer
    page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('BilanCompetence.AI - Rapport confidentiel', {
      x: width - 250,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    logger.info(`PDF generated for assessment: ${assessmentId}`);
    return Buffer.from(pdfBytes);

  } catch (error) {
    logger.error('Error generating assessment PDF', error);
    throw new Error(`Failed to generate PDF: ${(error as Error).message}`);
  }
}

/**
 * Generate user assessments summary
 */
export async function generateUserAssessmentsSummary(userId: string): Promise<Buffer> {
  try {
    // Fetch all assessments for user
    const assessments = await query<AssessmentData>(
      null,
      `SELECT * FROM assessments WHERE beneficiary_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Fetch user data
    const userResult = await query<any>(
      null,
      `SELECT full_name, email FROM users WHERE id = $1`,
      [userId]
    );

    const userName = userResult[0]?.full_name || 'Unknown';

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    // Title
    page.drawText('Synthèse des Bilans de Compétences', {
      x: 50,
      y: yPosition,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });

    yPosition -= 40;

    page.drawText(`Bénéficiaire: ${userName}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });

    yPosition -= 30;

    page.drawText(`Nombre total de bilans: ${assessments.length}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 40;

    // List assessments
    for (const assessment of assessments) {
      if (yPosition < 100) break; // Avoid page overflow

      page.drawText(`• ${assessment.title}`, {
        x: 60,
        y: yPosition,
        size: 11,
        font: fontBold,
      });

      yPosition -= 18;

      page.drawText(`  Statut: ${assessment.status} | Progression: ${assessment.progress_percentage}%`, {
        x: 70,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      yPosition -= 15;

      page.drawText(`  Créé le: ${new Date(assessment.created_at).toLocaleDateString('fr-FR')}`, {
        x: 70,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      yPosition -= 25;
    }

    // Footer
    page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    logger.info(`Summary PDF generated for user: ${userId}`);
    return Buffer.from(pdfBytes);

  } catch (error) {
    logger.error('Error generating user summary PDF', error);
    throw new Error(`Failed to generate summary PDF: ${(error as Error).message}`);
  }
}

/**
 * Generate consultant client report
 */
export async function generateConsultantClientReport(
  consultantId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<Buffer> {
  try {
    // Fetch consultant data
    const consultantResult = await query<any>(
      null,
      `SELECT full_name, email FROM users WHERE id = $1`,
      [consultantId]
    );

    const consultantName = consultantResult[0]?.full_name || 'Unknown';

    // Fetch assessments for consultant
    let whereClause = 'WHERE consultant_id = $1';
    const params: any[] = [consultantId];
    let paramIndex = 2;

    if (dateFrom) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(dateTo);
    }

    const assessments = await query<AssessmentData>(
      null,
      `SELECT * FROM assessments ${whereClause} ORDER BY created_at DESC`,
      params
    );

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    // Title
    page.drawText('Rapport Consultant - Clients', {
      x: 50,
      y: yPosition,
      size: 20,
      font: fontBold,
      color: rgb(0, 0.2, 0.4),
    });

    yPosition -= 40;

    page.drawText(`Consultant: ${consultantName}`, {
      x: 50,
      y: yPosition,
      size: 14,
      font: fontBold,
    });

    yPosition -= 30;

    page.drawText(`Nombre de bilans: ${assessments.length}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font,
    });

    yPosition -= 40;

    // Statistics
    const completedCount = assessments.filter(a => a.status === 'COMPLETED').length;
    const inProgressCount = assessments.filter(a => a.status === 'IN_PROGRESS').length;

    page.drawText(`Bilans terminés: ${completedCount}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font,
    });

    yPosition -= 20;

    page.drawText(`Bilans en cours: ${inProgressCount}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font,
    });

    yPosition -= 40;

    // List assessments
    page.drawText('Liste des bilans:', {
      x: 50,
      y: yPosition,
      size: 12,
      font: fontBold,
    });

    yPosition -= 25;

    for (const assessment of assessments.slice(0, 15)) { // Limit to 15
      if (yPosition < 100) break;

      page.drawText(`• ${assessment.title} - ${assessment.status}`, {
        x: 60,
        y: yPosition,
        size: 10,
        font,
      });

      yPosition -= 18;
    }

    // Footer
    page.drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    logger.info(`Consultant report PDF generated for: ${consultantId}`);
    return Buffer.from(pdfBytes);

  } catch (error) {
    logger.error('Error generating consultant report PDF', error);
    throw new Error(`Failed to generate consultant report PDF: ${(error as Error).message}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wrap text to fit within a certain character width
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

