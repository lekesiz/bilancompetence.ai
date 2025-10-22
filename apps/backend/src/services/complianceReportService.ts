/**
 * Compliance Report Service
 * Generates comprehensive Qualiopi compliance reports in JSON and PDF formats
 *
 * Features:
 * - JSON report generation
 * - PDF report generation with evidence
 * - Audit readiness assessment
 * - Executive summary generation
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import QualioptService from './qualioptService';
import SatisfactionSurveyService from './satisfactionSurveyService';
import DocumentArchiveService from './documentArchiveService';

interface IndicatorReport {
  indicator_id: number;
  indicator_name: string;
  status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
  evidence_count: number;
  notes: string | null;
  evidence_items: Array<{
    file_name: string;
    file_url: string;
    description: string;
  }>;
}

interface ComplianceReport {
  report_id: string;
  generated_at: string;
  organization_name: string;
  organization_id: string;
  overall_compliance_percentage: number;
  audit_readiness: boolean;
  summary: {
    total_indicators: number;
    compliant: number;
    missing: number;
    under_review: number;
  };
  indicators: IndicatorReport[];
  satisfaction_metrics: {
    nps_score: number;
    response_rate: number;
    average_satisfaction: number;
  };
  archive_stats: {
    total_documents: number;
    total_size: number;
  };
  next_steps: string[];
  audit_schedule: {
    self_assessment_deadline: string;
    external_audit_period: string;
  };
}

interface AuditReadinessAssessment {
  is_ready: boolean;
  readiness_percentage: number;
  critical_gaps: string[];
  recommendations: string[];
}

export class ComplianceReportService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private organizationId: string;
  private qualioptService: QualioptService;
  private surveyService: SatisfactionSurveyService;
  private archiveService: DocumentArchiveService;

  constructor(organizationId: string) {
    this.supabase = createClient<Database>(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
    this.organizationId = organizationId;
    this.qualioptService = new QualioptService(organizationId);
    this.surveyService = new SatisfactionSurveyService(organizationId);
    this.archiveService = new DocumentArchiveService(organizationId);
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateReport(includeEvidence = false): Promise<ComplianceReport> {
    try {
      // Get organization name
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .select('name')
        .eq('id', this.organizationId)
        .single();

      if (orgError) throw new Error(`Failed to fetch organization: ${orgError.message}`);

      // Get compliance metrics
      const complianceMetrics = await this.qualioptService.getCompliancePercentage();
      const indicators = await this.qualioptService.getIndicators();
      const surveyAnalytics = await this.surveyService.getAnalytics();
      const archiveStats = await this.archiveService.getArchiveStats();

      // Build indicator reports
      const indicatorReports = await Promise.all(
        indicators.map(async (indicator: any) => {
          const details = await this.qualioptService.getIndicatorDetails(indicator.indicator_id);
          const evidenceItems = includeEvidence ? details.evidence : [];

          return {
            indicator_id: indicator.indicator_id,
            indicator_name: indicator.name,
            status: indicator.status,
            evidence_count: indicator.evidence_count,
            notes: details.status?.notes || null,
            evidence_items: evidenceItems.map((e: any) => ({
              file_name: e.file_name,
              file_url: e.file_url,
              description: e.description,
            })),
          };
        })
      );

      // Determine audit readiness
      const auditReadiness = await this.assessAuditReadiness(complianceMetrics);

      // Calculate next steps
      const nextSteps = this.generateNextSteps(
        complianceMetrics,
        surveyAnalytics,
        indicatorReports
      );

      const report: ComplianceReport = {
        report_id: this.generateReportId(),
        generated_at: new Date().toISOString(),
        organization_name: org.name,
        organization_id: this.organizationId,
        overall_compliance_percentage: complianceMetrics.overall_percentage,
        audit_readiness: auditReadiness.is_ready,
        summary: {
          total_indicators: 32,
          compliant: complianceMetrics.compliant_count,
          missing: complianceMetrics.missing_count,
          under_review: complianceMetrics.under_review_count,
        },
        indicators: indicatorReports,
        satisfaction_metrics: {
          nps_score: surveyAnalytics.nps_score,
          response_rate: surveyAnalytics.response_rate,
          average_satisfaction: surveyAnalytics.average_satisfaction,
        },
        archive_stats: {
          total_documents: archiveStats.total_documents,
          total_size: archiveStats.total_size,
        },
        next_steps: nextSteps,
        audit_schedule: {
          self_assessment_deadline: this.formatDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)), // 60 days
          external_audit_period: '2026-Q1',
        },
      };

      return report;
    } catch (error) {
      console.error('Error in generateReport:', error);
      throw error;
    }
  }

  /**
   * Assess audit readiness
   */
  private async assessAuditReadiness(
    metrics: any
  ): Promise<AuditReadinessAssessment> {
    const criticalGaps: string[] = [];
    const recommendations: string[] = [];

    // Core indicators must be compliant
    if (metrics.compliant_count < 3) {
      criticalGaps.push('At least 3 core indicators (1, 11, 22) must be COMPLIANT');
      recommendations.push('Prioritize completing evidence for core indicators');
    }

    if (metrics.overall_percentage < 50) {
      criticalGaps.push('Overall compliance is below 50%');
      recommendations.push('Focus on closing gaps in MISSING indicators');
    }

    if (metrics.overall_percentage < 75) {
      recommendations.push('Improve compliance to 75%+ for external audit');
    }

    const readinessPercentage = Math.min(100, metrics.overall_percentage);
    const isReady = readinessPercentage >= 80 && criticalGaps.length === 0;

    return {
      is_ready: isReady,
      readiness_percentage: readinessPercentage,
      critical_gaps: criticalGaps,
      recommendations,
    };
  }

  /**
   * Generate next steps based on current compliance
   */
  private generateNextSteps(
    metrics: any,
    surveyAnalytics: any,
    indicators: IndicatorReport[]
  ): string[] {
    const steps: string[] = [];

    // Check missing indicators
    const missingIndicators = indicators.filter((i) => i.status === 'MISSING');
    if (missingIndicators.length > 0) {
      steps.push(
        `Complete evidence for ${missingIndicators.length} missing indicators: ${missingIndicators
          .slice(0, 3)
          .map((i) => `#${i.indicator_id}`)
          .join(', ')}${missingIndicators.length > 3 ? '...' : ''}`
      );
    }

    // Check under review
    const underReview = indicators.filter((i) => i.status === 'UNDER_REVIEW');
    if (underReview.length > 0) {
      steps.push(`Review and finalize ${underReview.length} indicators currently under review`);
    }

    // Check survey response rate
    if (surveyAnalytics.response_rate < 70) {
      steps.push('Improve survey response rate to 70%+ for better evidence of participant satisfaction');
    }

    // Check NPS score
    if (surveyAnalytics.nps_score < 20) {
      steps.push('Address participant satisfaction (NPS < 20) to improve audit prospects');
    }

    // Document archiving
    if (surveyAnalytics.archive_stats?.total_documents < 5) {
      steps.push('Ensure all bilan documents are properly archived for audit trail');
    }

    // Schedule audit
    if (metrics.overall_percentage >= 80) {
      steps.push('Schedule self-assessment with Qualiopi certifier (target: December 2025)');
      steps.push('Prepare for external audit in Q1 2026');
    }

    // Final steps
    steps.push('Maintain compliance records and document all changes');
    steps.push('Schedule monthly compliance reviews with team');

    return steps.slice(0, 10); // Limit to 10 steps
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `RPT-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate PDF report (returns buffer)
   * Note: This is a simplified version - in production use a library like pdfkit or puppeteer
   */
  async generatePDFReport(report: ComplianceReport): Promise<Buffer> {
    try {
      // TODO: Implement PDF generation using pdfkit or similar
      // For now, return a placeholder
      console.log('PDF report generation requested for report:', report.report_id);

      // In production, you would use:
      // const PDFDocument = require('pdfkit');
      // const doc = new PDFDocument();
      // ... add content to doc ...
      // return doc.end();

      return Buffer.from('PDF report placeholder');
    } catch (error) {
      console.error('Error in generatePDFReport:', error);
      throw error;
    }
  }

  /**
   * Export report as JSON
   */
  exportAsJSON(report: ComplianceReport): string {
    try {
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('Error in exportAsJSON:', error);
      throw error;
    }
  }

  /**
   * Export report as CSV (simplified version)
   */
  exportAsCSV(report: ComplianceReport): string {
    try {
      const rows: string[] = [];

      // Header
      rows.push('Qualiopi Compliance Report');
      rows.push(`Generated: ${report.generated_at}`);
      rows.push(`Organization: ${report.organization_name}`);
      rows.push(`Overall Compliance: ${report.overall_compliance_percentage}%`);
      rows.push(`Audit Ready: ${report.audit_readiness ? 'YES' : 'NO'}`);
      rows.push('');

      // Summary
      rows.push('SUMMARY');
      rows.push(`Total Indicators,${report.summary.total_indicators}`);
      rows.push(`Compliant,${report.summary.compliant}`);
      rows.push(`Missing,${report.summary.missing}`);
      rows.push(`Under Review,${report.summary.under_review}`);
      rows.push('');

      // Indicators
      rows.push('INDICATORS');
      rows.push('ID,Name,Status,Evidence Count,Notes');
      report.indicators.forEach((ind) => {
        const notes = (ind.notes || '').replace(/,/g, ';'); // Escape commas
        rows.push(`${ind.indicator_id},"${ind.indicator_name}",${ind.status},${ind.evidence_count},"${notes}"`);
      });

      return rows.join('\n');
    } catch (error) {
      console.error('Error in exportAsCSV:', error);
      throw error;
    }
  }

  /**
   * Store report in database
   */
  async storeReport(report: ComplianceReport): Promise<void> {
    try {
      const { error } = await this.supabase.from('qualiopi_reports').insert({
        organization_id: this.organizationId,
        report_data: report,
        compliance_percentage: report.overall_compliance_percentage,
        audit_ready: report.audit_readiness,
        generated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn('Note: qualiopi_reports table may not exist yet', error);
      }
    } catch (error) {
      console.error('Error storing report:', error);
      // Don't throw - this is a non-critical operation
    }
  }
}

export default ComplianceReportService;

