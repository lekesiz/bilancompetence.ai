import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

interface AssessmentData {
  id: string;
  startDate: string;
  endDate: string;
  currentPhase: string;
  progress: number;
}

interface TestResults {
  mbti?: {
    type: string;
    description: string;
  };
  riasec?: {
    codes: string[];
    topInterests: string[];
  };
  competences?: string[];
  valeurs?: string[];
}

interface ActionPlan {
  objectives: string[];
  actions: Array<{
    title: string;
    description: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  formations?: string[];
  metiers?: string[];
}

export class PDFGeneratorService {
  private doc: PDFKit.PDFDocument;
  private outputPath: string;

  constructor(outputPath: string) {
    this.doc = new PDFDocument({ size: 'A4', margin: 50 });
    this.outputPath = outputPath;
  }

  /**
   * Generate Synthèse de Bilan PDF
   */
  async generateSynthese(
    user: UserData,
    assessment: AssessmentData,
    testResults: TestResults,
    actionPlan: ActionPlan
  ): Promise<string> {
    const filename = `synthese_${assessment.id}_${Date.now()}.pdf`;
    const filepath = path.join(this.outputPath, filename);

    this.doc.pipe(fs.createWriteStream(filepath));

    // Header
    this.addHeader('SYNTHÈSE DE BILAN DE COMPÉTENCES');

    // User Info
    this.doc.moveDown();
    this.doc.fontSize(14).text('Informations du bénéficiaire', { underline: true });
    this.doc.moveDown(0.5);
    this.doc.fontSize(11)
      .text(`Nom : ${user.lastName}`)
      .text(`Prénom : ${user.firstName}`)
      .text(`Email : ${user.email}`)
      .text(`Date de début : ${new Date(assessment.startDate).toLocaleDateString('fr-FR')}`)
      .text(`Date de fin : ${new Date(assessment.endDate).toLocaleDateString('fr-FR')}`);

    // Test Results
    this.doc.moveDown(2);
    this.doc.fontSize(14).text('Résultats des tests psychométriques', { underline: true });
    this.doc.moveDown(0.5);

    if (testResults.mbti) {
      this.doc.fontSize(12).text('MBTI - Type de personnalité', { bold: true });
      this.doc.fontSize(11)
        .text(`Type : ${testResults.mbti.type}`, { indent: 20 })
        .text(`Description : ${testResults.mbti.description}`, { indent: 20 });
      this.doc.moveDown();
    }

    if (testResults.riasec) {
      this.doc.fontSize(12).text('RIASEC - Intérêts professionnels', { bold: true });
      this.doc.fontSize(11)
        .text(`Codes dominants : ${testResults.riasec.codes.join(', ')}`, { indent: 20 })
        .text(`Centres d'intérêt : ${testResults.riasec.topInterests.join(', ')}`, { indent: 20 });
      this.doc.moveDown();
    }

    if (testResults.competences && testResults.competences.length > 0) {
      this.doc.fontSize(12).text('Compétences identifiées', { bold: true });
      testResults.competences.forEach(comp => {
        this.doc.fontSize(11).text(`• ${comp}`, { indent: 20 });
      });
      this.doc.moveDown();
    }

    if (testResults.valeurs && testResults.valeurs.length > 0) {
      this.doc.fontSize(12).text('Valeurs professionnelles', { bold: true });
      testResults.valeurs.forEach(val => {
        this.doc.fontSize(11).text(`• ${val}`, { indent: 20 });
      });
      this.doc.moveDown();
    }

    // Action Plan
    this.doc.addPage();
    this.doc.fontSize(14).text('Plan d\'action', { underline: true });
    this.doc.moveDown(0.5);

    if (actionPlan.objectives && actionPlan.objectives.length > 0) {
      this.doc.fontSize(12).text('Objectifs professionnels', { bold: true });
      actionPlan.objectives.forEach((obj, index) => {
        this.doc.fontSize(11).text(`${index + 1}. ${obj}`, { indent: 20 });
      });
      this.doc.moveDown();
    }

    if (actionPlan.actions && actionPlan.actions.length > 0) {
      this.doc.fontSize(12).text('Actions prioritaires', { bold: true });
      this.doc.moveDown(0.5);
      actionPlan.actions.forEach((action, index) => {
        const priorityColor = action.priority === 'high' ? 'red' : action.priority === 'medium' ? 'orange' : 'green';
        this.doc.fontSize(11)
          .text(`${index + 1}. ${action.title}`, { bold: true, indent: 20 })
          .text(`   ${action.description}`, { indent: 20 })
          .text(`   Échéance : ${action.deadline} | Priorité : ${action.priority.toUpperCase()}`, { indent: 20 });
        this.doc.moveDown(0.5);
      });
    }

    if (actionPlan.metiers && actionPlan.metiers.length > 0) {
      this.doc.moveDown();
      this.doc.fontSize(12).text('Métiers recommandés', { bold: true });
      actionPlan.metiers.forEach(metier => {
        this.doc.fontSize(11).text(`• ${metier}`, { indent: 20 });
      });
    }

    if (actionPlan.formations && actionPlan.formations.length > 0) {
      this.doc.moveDown();
      this.doc.fontSize(12).text('Formations suggérées', { bold: true });
      actionPlan.formations.forEach(formation => {
        this.doc.fontSize(11).text(`• ${formation}`, { indent: 20 });
      });
    }

    // Footer
    this.addFooter();

    this.doc.end();

    return filepath;
  }

  /**
   * Generate Attestation de Réalisation PDF
   */
  async generateAttestation(
    user: UserData,
    assessment: AssessmentData,
    consultant: { name: string; certification: string }
  ): Promise<string> {
    const filename = `attestation_${assessment.id}_${Date.now()}.pdf`;
    const filepath = path.join(this.outputPath, filename);

    this.doc.pipe(fs.createWriteStream(filepath));

    // Header with logo placeholder
    this.doc.fontSize(20).text('ATTESTATION DE RÉALISATION', { align: 'center', bold: true });
    this.doc.moveDown();
    this.doc.fontSize(16).text('Bilan de Compétences', { align: 'center' });
    this.doc.moveDown(3);

    // Main content
    this.doc.fontSize(12).text(
      `Je soussigné(e), ${consultant.name}, consultant(e) certifié(e) en bilan de compétences (${consultant.certification}), atteste que :`,
      { align: 'justify' }
    );

    this.doc.moveDown(2);

    this.doc.fontSize(14).text(
      `${user.firstName} ${user.lastName}`,
      { align: 'center', bold: true }
    );

    this.doc.moveDown();

    this.doc.fontSize(12).text(
      `a suivi et complété un bilan de compétences conforme aux dispositions de l'article L6313-10 du Code du travail, du ${new Date(assessment.startDate).toLocaleDateString('fr-FR')} au ${new Date(assessment.endDate).toLocaleDateString('fr-FR')}.`,
      { align: 'justify' }
    );

    this.doc.moveDown(2);

    this.doc.fontSize(12).text(
      'Ce bilan de compétences a été réalisé selon les trois phases réglementaires :',
      { align: 'justify' }
    );

    this.doc.moveDown();

    this.doc.fontSize(11)
      .text('• Phase préliminaire : Analyse de la demande et définition des objectifs', { indent: 30 })
      .text('• Phase d\'investigation : Exploration des compétences, aptitudes et motivations', { indent: 30 })
      .text('• Phase de conclusion : Élaboration du projet professionnel et plan d\'action', { indent: 30 });

    this.doc.moveDown(2);

    this.doc.fontSize(12).text(
      'Le bénéficiaire a participé activement à l\'ensemble des séances et a réalisé les travaux demandés.',
      { align: 'justify' }
    );

    this.doc.moveDown(3);

    // Signature section
    this.doc.fontSize(11).text(`Fait à Paris, le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'left' });
    this.doc.moveDown(3);

    this.doc.fontSize(11)
      .text('Le consultant', { align: 'left' })
      .text(consultant.name, { align: 'left', bold: true });

    // Footer
    this.addFooter();

    this.doc.end();

    return filepath;
  }

  /**
   * Generate Plan d'Action PDF
   */
  async generateActionPlan(
    user: UserData,
    actionPlan: ActionPlan
  ): Promise<string> {
    const filename = `plan_action_${Date.now()}.pdf`;
    const filepath = path.join(this.outputPath, filename);

    this.doc.pipe(fs.createWriteStream(filepath));

    // Header
    this.addHeader('PLAN D\'ACTION PERSONNALISÉ');

    // User Info
    this.doc.moveDown();
    this.doc.fontSize(12).text(`Bénéficiaire : ${user.firstName} ${user.lastName}`);
    this.doc.fontSize(11).text(`Date d'établissement : ${new Date().toLocaleDateString('fr-FR')}`);

    this.doc.moveDown(2);

    // Objectives
    if (actionPlan.objectives && actionPlan.objectives.length > 0) {
      this.doc.fontSize(14).text('Objectifs professionnels', { underline: true });
      this.doc.moveDown(0.5);
      actionPlan.objectives.forEach((obj, index) => {
        this.doc.fontSize(11).text(`${index + 1}. ${obj}`, { indent: 20 });
      });
      this.doc.moveDown(2);
    }

    // Actions
    if (actionPlan.actions && actionPlan.actions.length > 0) {
      this.doc.fontSize(14).text('Actions à mettre en œuvre', { underline: true });
      this.doc.moveDown(0.5);

      // Group by priority
      const highPriority = actionPlan.actions.filter(a => a.priority === 'high');
      const mediumPriority = actionPlan.actions.filter(a => a.priority === 'medium');
      const lowPriority = actionPlan.actions.filter(a => a.priority === 'low');

      if (highPriority.length > 0) {
        this.doc.fontSize(12).text('Priorité HAUTE', { bold: true, color: 'red' });
        highPriority.forEach((action, index) => {
          this.doc.fontSize(11)
            .fillColor('black')
            .text(`${index + 1}. ${action.title}`, { bold: true, indent: 20 })
            .text(`   ${action.description}`, { indent: 20 })
            .text(`   Échéance : ${action.deadline}`, { indent: 20 });
          this.doc.moveDown(0.5);
        });
        this.doc.moveDown();
      }

      if (mediumPriority.length > 0) {
        this.doc.fontSize(12).fillColor('orange').text('Priorité MOYENNE', { bold: true });
        mediumPriority.forEach((action, index) => {
          this.doc.fontSize(11)
            .fillColor('black')
            .text(`${index + 1}. ${action.title}`, { bold: true, indent: 20 })
            .text(`   ${action.description}`, { indent: 20 })
            .text(`   Échéance : ${action.deadline}`, { indent: 20 });
          this.doc.moveDown(0.5);
        });
        this.doc.moveDown();
      }

      if (lowPriority.length > 0) {
        this.doc.fontSize(12).fillColor('green').text('Priorité BASSE', { bold: true });
        lowPriority.forEach((action, index) => {
          this.doc.fontSize(11)
            .fillColor('black')
            .text(`${index + 1}. ${action.title}`, { bold: true, indent: 20 })
            .text(`   ${action.description}`, { indent: 20 })
            .text(`   Échéance : ${action.deadline}`, { indent: 20 });
          this.doc.moveDown(0.5);
        });
      }
    }

    // Recommended careers
    if (actionPlan.metiers && actionPlan.metiers.length > 0) {
      this.doc.addPage();
      this.doc.fontSize(14).fillColor('black').text('Métiers recommandés', { underline: true });
      this.doc.moveDown(0.5);
      actionPlan.metiers.forEach((metier, index) => {
        this.doc.fontSize(11).text(`${index + 1}. ${metier}`, { indent: 20 });
      });
      this.doc.moveDown(2);
    }

    // Suggested trainings
    if (actionPlan.formations && actionPlan.formations.length > 0) {
      this.doc.fontSize(14).text('Formations suggérées', { underline: true });
      this.doc.moveDown(0.5);
      actionPlan.formations.forEach((formation, index) => {
        this.doc.fontSize(11).text(`${index + 1}. ${formation}`, { indent: 20 });
      });
    }

    // Footer
    this.addFooter();

    this.doc.end();

    return filepath;
  }

  /**
   * Add header to PDF
   */
  private addHeader(title: string) {
    this.doc
      .fontSize(18)
      .fillColor('#3B82F6')
      .text(title, { align: 'center', bold: true });
    
    this.doc
      .moveTo(50, this.doc.y + 10)
      .lineTo(550, this.doc.y + 10)
      .stroke('#3B82F6');
    
    this.doc.moveDown(2);
    this.doc.fillColor('black');
  }

  /**
   * Add footer to PDF
   */
  private addFooter() {
    const bottomMargin = 50;
    const pageHeight = this.doc.page.height;

    this.doc
      .fontSize(9)
      .fillColor('gray')
      .text(
        'BilanCompetence.AI - Document confidentiel',
        50,
        pageHeight - bottomMargin,
        { align: 'center' }
      )
      .text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        50,
        pageHeight - bottomMargin + 12,
        { align: 'center' }
      );
  }
}

// Export factory function
export const createPDFGenerator = (outputPath: string) => {
  return new PDFGeneratorService(outputPath);
};

