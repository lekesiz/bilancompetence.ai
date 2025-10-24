import { PDFDocument, PDFPage, rgb, degrees } from 'pdf-lib';
import { supabase } from './supabaseService.js';

/**
 * PDF Service - Assessment Report Generation
 *
 * This service handles the generation of PDF reports for assessments
 * with support for different report types: Preliminary, Investigation, and Conclusion
 */

// Type definitions for formatted data
interface FormattedAssessment {
  id: string;
  title: string;
  status: string;
  assessmentType: string;
  beneficiaryName: string;
  beneficiaryEmail: string;
  consultantName?: string;
  organizationName?: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  progressPercentage: number;
  satisfactionScore?: number;
}

interface AssessmentCompetency {
  id: string;
  skill_name: string;
  category: string;
  self_assessment_level: number;
  self_interest_level: number;
  consultant_assessment_level?: number;
  consultant_notes?: string;
}

interface Recommendation {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: number;
  match_score?: number;
}

interface ActionPlanItem {
  id: string;
  title: string;
  description?: string;
  timeline?: string;
  status: string;
  responsible_party?: string;
}

interface ScoreStats {
  averageScore: number;
  totalCompetencies: number;
  proficientCount: number;
  developingCount: number;
  needsWorkCount: number;
  completionPercentage: number;
}

/**
 * MAIN EXPORT FUNCTIONS (Public API)
 */

/**
 * Generate assessment PDF report
 *
 * @param assessmentId - The assessment ID to generate PDF for
 * @param userId - The user requesting the PDF (for access control)
 * @param reportType - Type of report: 'preliminary' | 'investigation' | 'conclusion'
 * @returns Buffer containing the PDF data
 */
export async function generateAssessmentPDF(
  assessmentId: string,
  userId: string,
  reportType: 'preliminary' | 'investigation' | 'conclusion' = 'preliminary'
): Promise<Buffer> {
  try {
    // Fetch assessment data with all relations
    const assessment = await fetchAssessmentWithRelations(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    // Verify access control
    if (assessment.beneficiary_id !== userId && assessment.consultant_id !== userId) {
      throw new Error('Unauthorized access to assessment');
    }

    // Format data for PDF display
    const formattedAssessment = await formatAssessmentData(assessment);

    // Fetch related data
    const competencies = await fetchCompetencies(assessmentId);
    const recommendations = await fetchRecommendations(assessmentId);
    const actionPlanItems = await fetchActionPlanItems(assessmentId);

    // Calculate score statistics
    const scoreStats = calculateScoreStatistics(competencies);

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Add pages based on report type
    await generateReportPages(
      pdfDoc,
      formattedAssessment,
      competencies,
      recommendations,
      actionPlanItems,
      scoreStats,
      reportType
    );

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);

  } catch (error) {
    console.error('Error generating assessment PDF:', error);
    throw new Error(`Failed to generate PDF: ${(error as Error).message}`);
  }
}

/**
 * Generate user assessments summary (all assessments for a user)
 *
 * @param userId - The user ID to generate summary for
 * @returns Buffer containing the PDF data
 */
export async function generateUserAssessmentsSummary(userId: string): Promise<Buffer> {
  try {
    // Fetch all assessments for user
    const { data: assessments } = await supabase
      .from('bilans')
      .select('*')
      .eq('beneficiary_id', userId)
      .order('created_at', { ascending: false });

    if (!assessments || assessments.length === 0) {
      throw new Error('No assessments found for user');
    }

    // Fetch user details
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const pdfDoc = await PDFDocument.create();

    // Add cover page
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    await addReportHeader(page, 'Assessment Summary', `User: ${(user as any).full_name}`, new Date());

    // Add summary table of all assessments
    await addAssessmentsSummaryTable(page, assessments, user);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);

  } catch (error) {
    console.error('Error generating assessments summary:', error);
    throw new Error(`Failed to generate assessments summary: ${(error as Error).message}`);
  }
}

/**
 * Generate consultant client report
 *
 * @param consultantId - The consultant ID
 * @param clientId - The client user ID
 * @returns Buffer containing the PDF data
 */
export async function generateConsultantClientReport(
  consultantId: string,
  clientId: string
): Promise<Buffer> {
  try {
    // Fetch latest assessment for client with this consultant
    const { data: assessments } = await supabase
      .from('bilans')
      .select('*')
      .eq('beneficiary_id', clientId)
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!assessments || assessments.length === 0) {
      throw new Error('No assessment found for this consultant-client pair');
    }

    // Generate conclusion report for the latest assessment
    return generateAssessmentPDF((assessments[0] as any).id, consultantId, 'conclusion');

  } catch (error) {
    console.error('Error generating consultant client report:', error);
    throw new Error(`Failed to generate consultant report: ${(error as Error).message}`);
  }
}

/**
 * REPORT GENERATION FUNCTIONS (Private)
 */

/**
 * Generate all report pages based on report type
 */
async function generateReportPages(
  pdfDoc: PDFDocument,
  assessment: FormattedAssessment,
  competencies: AssessmentCompetency[],
  recommendations: Recommendation[],
  actionPlanItems: ActionPlanItem[],
  scoreStats: ScoreStats,
  reportType: string
): Promise<void> {
  // Page 1: Cover Page with Header
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  await addReportHeader(page, 'Assessment Report', assessment.title, new Date());
  await addAssessmentMetadata(page, assessment);
  await addReportFooter(page, 1);

  // Page 2: Executive Summary (all report types)
  page = pdfDoc.addPage([595.28, 841.89]);
  await addExecutiveSummary(page, assessment, scoreStats, recommendations);
  await addReportFooter(page, 2);

  // Page 3: Assessment Details
  page = pdfDoc.addPage([595.28, 841.89]);
  await addAssessmentDetails(page, assessment);
  await addReportFooter(page, 3);

  // Page 4: Score Breakdown & Competencies
  if (competencies.length > 0) {
    page = pdfDoc.addPage([595.28, 841.89]);
    await addScoreBreakdown(page, competencies, scoreStats);
    await addReportFooter(page, 4);

    // Additional pages for detailed competencies
    page = pdfDoc.addPage([595.28, 841.89]);
    await addCompetenciesAnalysis(page, competencies);
    await addReportFooter(page, 5);
  }

  // Page 5+: Recommendations (all report types if available)
  if (recommendations.length > 0) {
    page = pdfDoc.addPage([595.28, 841.89]);
    await addRecommendationsSection(page, recommendations);
    await addReportFooter(page, pdfDoc.getPageCount());
  }

  // Page 6+: Action Plan (only for conclusion reports)
  if (reportType === 'conclusion' && actionPlanItems.length > 0) {
    page = pdfDoc.addPage([595.28, 841.89]);
    await addActionPlanSection(page, actionPlanItems);
    await addReportFooter(page, pdfDoc.getPageCount());
  }
}

/**
 * SECTION BUILDER FUNCTIONS (Private)
 */

/**
 * Add report header with title and metadata
 */
async function addReportHeader(
  page: PDFPage,
  title: string,
  subtitle: string,
  generatedDate: Date
): Promise<void> {
  const { width, height } = page.getSize();

  // Draw header background
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(0, 102, 204), // Brand blue
  });

  // Add title
  page.drawText(title, {
    x: 40,
    y: height - 45,
    size: 28,
    color: rgb(255, 255, 255),
    font: undefined,
  });

  // Add subtitle
  page.drawText(subtitle, {
    x: 40,
    y: height - 65,
    size: 14,
    color: rgb(200, 220, 255),
    font: undefined,
  });

  // Add generated date
  page.drawText(`Generated: ${generatedDate.toLocaleDateString()}`, {
    x: width - 180,
    y: height - 50,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });
}

/**
 * Add assessment metadata section
 */
async function addAssessmentMetadata(
  page: PDFPage,
  assessment: FormattedAssessment
): Promise<void> {
  let y = 700;

  // Title
  page.drawText('Assessment Information', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 30;

  // Metadata items
  const metadata: Array<{ label: string; value: string }> = [
    { label: 'Beneficiary', value: assessment.beneficiaryName },
    { label: 'Email', value: assessment.beneficiaryEmail },
    { label: 'Assessment Type', value: assessment.assessmentType },
    { label: 'Status', value: assessment.status },
    { label: 'Start Date', value: assessment.startDate },
  ];

  if (assessment.consultantName) {
    metadata.push({ label: 'Consultant', value: assessment.consultantName });
  }

  if (assessment.organizationName) {
    metadata.push({ label: 'Organization', value: assessment.organizationName });
  }

  for (const item of metadata) {
    page.drawText(`${item.label}:`, {
      x: 40,
      y: y,
      size: 11,
      color: rgb(51, 51, 51),
      font: undefined,
    });

    page.drawText(item.value, {
      x: 200,
      y: y,
      size: 11,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    y -= 20;
  }

  // Progress bar
  page.drawRectangle({
    x: 40,
    y: y - 10,
    width: 300,
    height: 20,
    borderColor: rgb(0, 102, 204),
    borderWidth: 1,
  });

  const progressWidth = (assessment.progressPercentage / 100) * 300;
  page.drawRectangle({
    x: 40,
    y: y - 10,
    width: progressWidth,
    height: 20,
    color: rgb(40, 167, 69), // Green
  });

  page.drawText(`${assessment.progressPercentage}% Complete`, {
    x: 50,
    y: y - 5,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });
}

/**
 * Add executive summary section
 */
async function addExecutiveSummary(
  page: PDFPage,
  assessment: FormattedAssessment,
  scoreStats: ScoreStats,
  recommendations: Recommendation[]
): Promise<void> {
  const { width } = page.getSize();
  let y = 780;

  // Section title
  page.drawText('Executive Summary', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  // Key metrics
  const metrics = [
    { label: 'Average Score', value: `${scoreStats.averageScore.toFixed(1)}/4.0` },
    { label: 'Proficient Competencies', value: `${scoreStats.proficientCount}/${scoreStats.totalCompetencies}` },
    { label: 'Completion', value: `${scoreStats.completionPercentage}%` },
    { label: 'Total Recommendations', value: `${recommendations.length}` },
  ];

  let xOffset = 40;
  for (const metric of metrics) {
    page.drawText(metric.label, {
      x: xOffset,
      y: y,
      size: 10,
      color: rgb(100, 100, 100),
      font: undefined,
    });

    page.drawText(metric.value, {
      x: xOffset,
      y: y - 20,
      size: 12,
      color: rgb(0, 102, 204),
      font: undefined,
    });

    xOffset += 140;
  }

  y -= 60;

  // Summary text
  page.drawText('Overview:', {
    x: 40,
    y: y,
    size: 12,
    color: rgb(51, 51, 51),
    font: undefined,
  });
  y -= 25;

  const summaryText = `Assessment started on ${assessment.startDate}. The beneficiary has demonstrated proficiency in ${scoreStats.proficientCount} competency areas and is developing in ${scoreStats.developingCount} areas. Key recommendations are provided below.`;

  // Wrap text
  const words = summaryText.split(' ');
  let line = '';
  const maxWidth = width - 80;

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (testLine.length > 60) {
      page.drawText(line, {
        x: 40,
        y: y,
        size: 10,
        color: rgb(51, 51, 51),
        font: undefined,
      });
      line = word;
      y -= 15;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, {
      x: 40,
      y: y,
      size: 10,
      color: rgb(51, 51, 51),
      font: undefined,
    });
  }
}

/**
 * Add assessment details section
 */
async function addAssessmentDetails(
  page: PDFPage,
  assessment: FormattedAssessment
): Promise<void> {
  let y = 780;

  page.drawText('Assessment Details', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  const details = [
    { label: 'Assessment ID', value: assessment.id.substring(0, 8) },
    { label: 'Type', value: assessment.assessmentType },
    { label: 'Status', value: assessment.status },
    { label: 'Start Date', value: assessment.startDate },
    ...(assessment.endDate ? [{ label: 'End Date', value: assessment.endDate }] : []),
    ...(assessment.duration ? [{ label: 'Duration', value: `${assessment.duration} hours` }] : []),
    { label: 'Progress', value: `${assessment.progressPercentage}%` },
  ];

  for (const detail of details) {
    page.drawText(`${detail.label}:`, {
      x: 40,
      y: y,
      size: 11,
      color: rgb(51, 51, 51),
      font: undefined,
    });

    page.drawText(detail.value, {
      x: 200,
      y: y,
      size: 11,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    y -= 22;
  }
}

/**
 * Add score breakdown section with competency table
 */
async function addScoreBreakdown(
  page: PDFPage,
  competencies: AssessmentCompetency[],
  scoreStats: ScoreStats
): Promise<void> {
  let y = 780;

  page.drawText('Score Breakdown', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  // Summary statistics
  const statText = `Total Competencies: ${scoreStats.totalCompetencies} | Proficient: ${scoreStats.proficientCount} | Developing: ${scoreStats.developingCount} | Needs Work: ${scoreStats.needsWorkCount}`;
  page.drawText(statText, {
    x: 40,
    y: y,
    size: 10,
    color: rgb(100, 100, 100),
    font: undefined,
  });
  y -= 25;

  // Table headers
  page.drawRectangle({
    x: 40,
    y: y - 5,
    width: 500,
    height: 20,
    color: rgb(0, 102, 204),
  });

  page.drawText('Competency', {
    x: 50,
    y: y + 3,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });

  page.drawText('Level', {
    x: 250,
    y: y + 3,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });

  page.drawText('Interest', {
    x: 320,
    y: y + 3,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });

  page.drawText('Status', {
    x: 420,
    y: y + 3,
    size: 10,
    color: rgb(255, 255, 255),
    font: undefined,
  });

  y -= 25;

  // Table rows
  for (let i = 0; i < Math.min(competencies.length, 12); i++) {
    const comp = competencies[i];
    const statusColor = getStatusColor(comp.self_assessment_level);
    const statusLabel = getStatusLabel(comp.self_assessment_level);

    // Alternate row background
    if (i % 2 === 0) {
      page.drawRectangle({
        x: 40,
        y: y - 3,
        width: 500,
        height: 18,
        color: rgb(240, 245, 250),
      });
    }

    page.drawText(comp.skill_name.substring(0, 25), {
      x: 50,
      y: y,
      size: 9,
      color: rgb(51, 51, 51),
      font: undefined,
    });

    page.drawText(`${comp.self_assessment_level}/4`, {
      x: 250,
      y: y,
      size: 9,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    page.drawText(`${comp.self_interest_level}/10`, {
      x: 320,
      y: y,
      size: 9,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    // Status indicator
    page.drawRectangle({
      x: 420,
      y: y - 4,
      width: 60,
      height: 12,
      color: statusColor,
    });

    page.drawText(statusLabel, {
      x: 425,
      y: y - 1,
      size: 8,
      color: rgb(255, 255, 255),
      font: undefined,
    });

    y -= 18;
  }

  if (competencies.length > 12) {
    page.drawText(`... and ${competencies.length - 12} more competencies`, {
      x: 50,
      y: y,
      size: 9,
      color: rgb(150, 150, 150),
      font: undefined,
    });
  }
}

/**
 * Add detailed competencies analysis section
 */
async function addCompetenciesAnalysis(
  page: PDFPage,
  competencies: AssessmentCompetency[]
): Promise<void> {
  let y = 780;

  page.drawText('Competencies Analysis', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  // Group competencies by category
  const categories = new Map<string, AssessmentCompetency[]>();
  for (const comp of competencies) {
    const cat = comp.category || 'other';
    if (!categories.has(cat)) {
      categories.set(cat, []);
    }
    categories.get(cat)!.push(comp);
  }

  // Display by category
  for (const [category, comps] of categories) {
    page.drawText(category.charAt(0).toUpperCase() + category.slice(1), {
      x: 40,
      y: y,
      size: 12,
      color: rgb(0, 68, 136),
      font: undefined,
    });
    y -= 18;

    for (const comp of comps.slice(0, 4)) {
      const statusLabel = getStatusLabel(comp.self_assessment_level);

      page.drawText(`• ${comp.skill_name}`, {
        x: 50,
        y: y,
        size: 10,
        color: rgb(51, 51, 51),
        font: undefined,
      });

      page.drawText(`Level: ${comp.self_assessment_level}/4 - ${statusLabel}`, {
        x: 280,
        y: y,
        size: 9,
        color: rgb(100, 100, 100),
        font: undefined,
      });

      y -= 16;

      if (y < 60) {
        break; // Stop if running out of space
      }
    }

    y -= 10;
    if (y < 60) break;
  }
}

/**
 * Add recommendations section
 */
async function addRecommendationsSection(
  page: PDFPage,
  recommendations: Recommendation[]
): Promise<void> {
  let y = 780;

  page.drawText('Recommendations', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  // Sort by priority
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);

  for (let i = 0; i < Math.min(sorted.length, 8); i++) {
    const rec = sorted[i];
    const priorityColor = getPriorityColor(rec.priority);
    const priorityLabel = rec.priority === 1 ? 'HIGH' : rec.priority === 2 ? 'MEDIUM' : 'LOW';

    // Priority badge
    page.drawRectangle({
      x: 40,
      y: y - 4,
      width: 50,
      height: 14,
      color: priorityColor,
    });

    page.drawText(priorityLabel, {
      x: 45,
      y: y,
      size: 8,
      color: rgb(255, 255, 255),
      font: undefined,
    });

    // Recommendation title
    page.drawText(rec.title, {
      x: 100,
      y: y,
      size: 11,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    y -= 18;

    // Description (if available)
    if (rec.description) {
      const desc = rec.description.substring(0, 80) + (rec.description.length > 80 ? '...' : '');
      page.drawText(desc, {
        x: 100,
        y: y,
        size: 9,
        color: rgb(100, 100, 100),
        font: undefined,
      });
      y -= 14;
    }

    y -= 8;

    if (y < 60) break;
  }

  if (recommendations.length > 8) {
    page.drawText(`... and ${recommendations.length - 8} more recommendations`, {
      x: 40,
      y: y,
      size: 9,
      color: rgb(150, 150, 150),
      font: undefined,
    });
  }
}

/**
 * Add action plan section (for conclusion reports)
 */
async function addActionPlanSection(
  page: PDFPage,
  actionPlanItems: ActionPlanItem[]
): Promise<void> {
  let y = 780;

  page.drawText('Action Plan', {
    x: 40,
    y: y,
    size: 16,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 35;

  for (let i = 0; i < Math.min(actionPlanItems.length, 10); i++) {
    const item = actionPlanItems[i];

    // Item number
    page.drawRectangle({
      x: 40,
      y: y - 4,
      width: 24,
      height: 16,
      color: rgb(0, 102, 204),
    });

    page.drawText(`${i + 1}`, {
      x: 47,
      y: y,
      size: 10,
      color: rgb(255, 255, 255),
      font: undefined,
    });

    // Title
    page.drawText(item.title, {
      x: 75,
      y: y,
      size: 11,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    y -= 18;

    // Details
    if (item.timeline) {
      page.drawText(`Timeline: ${item.timeline}`, {
        x: 85,
        y: y,
        size: 9,
        color: rgb(100, 100, 100),
        font: undefined,
      });
      y -= 14;
    }

    if (item.responsible_party) {
      page.drawText(`Responsible: ${item.responsible_party}`, {
        x: 85,
        y: y,
        size: 9,
        color: rgb(100, 100, 100),
        font: undefined,
      });
      y -= 14;
    }

    y -= 8;

    if (y < 60) break;
  }
}

/**
 * Add assessments summary table
 */
async function addAssessmentsSummaryTable(
  page: PDFPage,
  assessments: any[],
  user: any
): Promise<void> {
  let y = 700;

  page.drawText('Your Assessments', {
    x: 40,
    y: y,
    size: 14,
    color: rgb(0, 68, 136),
    font: undefined,
  });
  y -= 30;

  // Table headers
  page.drawRectangle({
    x: 40,
    y: y - 5,
    width: 500,
    height: 20,
    color: rgb(0, 102, 204),
  });

  page.drawText('Assessment', { x: 50, y: y + 3, size: 10, color: rgb(255, 255, 255), font: undefined });
  page.drawText('Status', { x: 250, y: y + 3, size: 10, color: rgb(255, 255, 255), font: undefined });
  page.drawText('Type', { x: 350, y: y + 3, size: 10, color: rgb(255, 255, 255), font: undefined });
  page.drawText('Date', { x: 450, y: y + 3, size: 10, color: rgb(255, 255, 255), font: undefined });

  y -= 25;

  // Table rows
  for (let i = 0; i < Math.min(assessments.length, 15); i++) {
    const assessment = assessments[i];

    if (i % 2 === 0) {
      page.drawRectangle({
        x: 40,
        y: y - 3,
        width: 500,
        height: 18,
        color: rgb(240, 245, 250),
      });
    }

    const startDate = new Date(assessment.start_date).toLocaleDateString();

    page.drawText(assessment.title || 'Untitled', {
      x: 50,
      y: y,
      size: 9,
      color: rgb(51, 51, 51),
      font: undefined,
    });

    page.drawText(assessment.status, {
      x: 250,
      y: y,
      size: 9,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    page.drawText(assessment.assessment_type || 'N/A', {
      x: 350,
      y: y,
      size: 9,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    page.drawText(startDate, {
      x: 450,
      y: y,
      size: 9,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    y -= 18;
  }
}

/**
 * Add report footer with page numbers
 */
async function addReportFooter(
  page: PDFPage,
  pageNumber: number
): Promise<void> {
  const { width, height } = page.getSize();

  // Footer line
  page.drawLine({
    start: { x: 40, y: 40 },
    end: { x: width - 40, y: 40 },
    color: rgb(200, 200, 200),
  });

  // Company info
  page.drawText('BilanCompétence', {
    x: 40,
    y: 20,
    size: 9,
    color: rgb(100, 100, 100),
    font: undefined,
  });

  // Page number
  page.drawText(`Page ${pageNumber}`, {
    x: width - 100,
    y: 20,
    size: 9,
    color: rgb(100, 100, 100),
    font: undefined,
  });

  // Confidentiality notice
  page.drawText('Confidential - For authorized use only', {
    x: 200,
    y: 20,
    size: 8,
    color: rgb(150, 150, 150),
    font: undefined,
  });
}

/**
 * DATA FETCHING FUNCTIONS (Private)
 */

/**
 * Fetch assessment with all related data
 */
async function fetchAssessmentWithRelations(assessmentId: string): Promise<any> {
  const { data: assessment } = await supabase
    .from('bilans')
    .select('*')
    .eq('id', assessmentId)
    .single();

  return assessment;
}

/**
 * Fetch competencies for an assessment
 */
async function fetchCompetencies(assessmentId: string): Promise<AssessmentCompetency[]> {
  const { data } = await supabase
    .from('assessment_competencies')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('skill_name');

  return (data as unknown as AssessmentCompetency[]) || [];
}

/**
 * Fetch recommendations for an assessment
 */
async function fetchRecommendations(assessmentId: string): Promise<Recommendation[]> {
  const { data } = await supabase
    .from('recommendations')
    .select('*')
    .eq('bilan_id', assessmentId)
    .order('priority');

  return (data as unknown as Recommendation[]) || [];
}

/**
 * Fetch action plan items for an assessment
 */
async function fetchActionPlanItems(assessmentId: string): Promise<ActionPlanItem[]> {
  const { data } = await supabase
    .from('action_plan_items')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at');

  return (data as unknown as ActionPlanItem[]) || [];
}

/**
 * UTILITY FUNCTIONS (Private)
 */

/**
 * Format assessment data for PDF display
 */
async function formatAssessmentData(assessment: any): Promise<FormattedAssessment> {
  // Fetch beneficiary details
  const { data: beneficiary } = await supabase
    .from('users')
    .select('*')
    .eq('id', assessment.beneficiary_id)
    .single();

  // Fetch consultant details (if assigned)
  let consultantName: string | undefined;
  if (assessment.consultant_id) {
    const { data: consultant } = await supabase
      .from('users')
      .select('*')
      .eq('id', assessment.consultant_id)
      .single();
    consultantName = (consultant as any)?.full_name;
  }

  // Fetch organization details (if assigned)
  let organizationName: string | undefined;
  if (assessment.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', assessment.organization_id)
      .single();
    organizationName = (org as any)?.name;
  }

  return {
    id: assessment.id,
    title: assessment.title || 'Assessment Report',
    status: assessment.status || 'DRAFT',
    assessmentType: assessment.assessment_type || 'comprehensive',
    beneficiaryName: (beneficiary as any)?.full_name || 'Unknown',
    beneficiaryEmail: (beneficiary as any)?.email || 'Unknown',
    consultantName,
    organizationName,
    startDate: assessment.start_date ? new Date(assessment.start_date).toLocaleDateString() : 'Not started',
    endDate: assessment.actual_end_date ? new Date(assessment.actual_end_date).toLocaleDateString() : undefined,
    duration: assessment.duration_hours || undefined,
    progressPercentage: assessment.progress_percentage || 0,
    satisfactionScore: assessment.satisfaction_score,
  };
}

/**
 * Calculate score statistics from competencies
 */
function calculateScoreStatistics(competencies: AssessmentCompetency[]): ScoreStats {
  if (competencies.length === 0) {
    return {
      averageScore: 0,
      totalCompetencies: 0,
      proficientCount: 0,
      developingCount: 0,
      needsWorkCount: 0,
      completionPercentage: 0,
    };
  }

  let totalScore = 0;
  let proficientCount = 0;
  let developingCount = 0;
  let needsWorkCount = 0;

  for (const comp of competencies) {
    totalScore += comp.self_assessment_level;

    if (comp.self_assessment_level >= 3.2) {
      proficientCount++;
    } else if (comp.self_assessment_level >= 2) {
      developingCount++;
    } else {
      needsWorkCount++;
    }
  }

  const averageScore = totalScore / competencies.length;
  const completionPercentage = Math.round(
    (competencies.filter(c => c.self_assessment_level > 0).length / competencies.length) * 100
  );

  return {
    averageScore,
    totalCompetencies: competencies.length,
    proficientCount,
    developingCount,
    needsWorkCount,
    completionPercentage,
  };
}

/**
 * Get status color based on assessment level
 */
function getStatusColor(level: number): any {
  if (level >= 3.2) {
    return rgb(40, 167, 69); // Green - Proficient
  } else if (level >= 2) {
    return rgb(255, 193, 7); // Yellow - Developing
  } else {
    return rgb(220, 53, 69); // Red - Needs Work
  }
}

/**
 * Get status label based on assessment level
 */
function getStatusLabel(level: number): string {
  if (level >= 3.2) {
    return 'Proficient';
  } else if (level >= 2) {
    return 'Developing';
  } else {
    return 'Needs Work';
  }
}

/**
 * Get priority color for recommendations
 */
function getPriorityColor(priority: number): any {
  if (priority === 1) {
    return rgb(220, 53, 69); // Red - High
  } else if (priority === 2) {
    return rgb(255, 193, 7); // Yellow - Medium
  } else {
    return rgb(40, 167, 69); // Green - Low
  }
}
