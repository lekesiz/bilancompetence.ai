/**
 * Qualiopi Compliance Service
 * Manages Qualiopi indicator tracking, status updates, and compliance calculations
 *
 * Core Indicators (MVP Focus):
 * - Indicator 1: Service Information
 * - Indicator 11: Participant Satisfaction
 * - Indicator 22: Document Archive
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types.js';

interface IndicatorStatus {
  indicator_id: number;
  name: string;
  status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
  evidence_count: number;
  last_reviewed_at: string | null;
  reviewed_by_name: string | null;
}

interface ComplianceMetrics {
  overall_percentage: number;
  compliant_count: number;
  missing_count: number;
  under_review_count: number;
  last_audit_date: string | null;
}

interface EvidenceMetadata {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  description: string;
  uploaded_by_name: string;
  created_at: string;
}

export class QualioptService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private organizationId: string | null;

  constructor(organizationId: string | null) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
    this.organizationId = organizationId;
  }

  /**
   * Get all 32 Qualiopi indicators
   */
  async getIndicators(): Promise<IndicatorStatus[]> {
    try {
      let query = this.supabase
        .from('qualiopi_indicators')
        .select(
          `
          id,
          indicator_number,
          name,
          description,
          category,
          focus_level,
          organization_qualiopi_status!inner (
            id,
            status,
            last_reviewed_at,
            reviewed_by,
            users (
              full_name
            )
          ),
          qualiopi_evidence (
            id
          )
        `
        )
        .order('indicator_number');

      // If organizationId is provided, filter by organization
      // If null (ADMIN global), return all organizations' indicators
      if (this.organizationId) {
        query = query.eq('organization_qualiopi_status.organization_id', this.organizationId);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Failed to fetch indicators: ${error.message}`);

      return (data || []).map((indicator: any) => ({
        indicator_id: indicator.id,
        name: indicator.name,
        status: indicator.organization_qualiopi_status[0]?.status || 'MISSING',
        evidence_count: indicator.qualiopi_evidence.length,
        last_reviewed_at: indicator.organization_qualiopi_status[0]?.last_reviewed_at,
        reviewed_by_name: indicator.organization_qualiopi_status[0]?.users?.full_name || null,
      }));
    } catch (error) {
      console.error('Error in getIndicators:', error);
      throw error;
    }
  }

  /**
   * Get a single indicator with full details
   */
  async getIndicatorDetails(indicatorId: number): Promise<any> {
    try {
      const { data: indicator, error: indicatorError } = await this.supabase
        .from('qualiopi_indicators')
        .select('*')
        .eq('id', indicatorId)
        .single();

      if (indicatorError) throw new Error(`Failed to fetch indicator: ${indicatorError.message}`);

      const { data: status, error: statusError } = await this.supabase
        .from('organization_qualiopi_status')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('indicator_id', indicatorId)
        .single();

      if (statusError && statusError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch status: ${statusError.message}`);
      }

      const { data: evidence, error: evidenceError } = await this.supabase
        .from('qualiopi_evidence')
        .select(
          `
          id,
          file_name,
          file_url,
          file_size,
          file_type,
          description,
          users (full_name),
          created_at
        `
        )
        .eq('indicator_id', indicatorId)
        .eq('organization_id', this.organizationId)
        .is('deleted_at', null);

      if (evidenceError) throw new Error(`Failed to fetch evidence: ${evidenceError.message}`);

      return {
        indicator,
        status: status || { status: 'MISSING', notes: null },
        evidence: evidence || [],
      };
    } catch (error) {
      console.error('Error in getIndicatorDetails:', error);
      throw error;
    }
  }

  /**
   * Update indicator status
   */
  async updateIndicatorStatus(
    indicatorId: number,
    status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW',
    notes: string,
    reviewedByUserId: string
  ): Promise<any> {
    try {
      // Upsert organization_qualiopi_status
      const { data, error } = await this.supabase
        .from('organization_qualiopi_status')
        .upsert(
          {
            organization_id: this.organizationId,
            indicator_id: indicatorId,
            status,
            notes,
            reviewed_by: reviewedByUserId,
            last_reviewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'organization_id,indicator_id',
          }
        )
        .select();

      if (error) throw new Error(`Failed to update indicator status: ${error.message}`);

      // Log audit event
      await this.logAuditEvent('INDICATOR_UPDATE', 'INDICATOR', indicatorId.toString(), {
        before: { status: 'UNKNOWN' },
        after: { status },
        fields_changed: ['status', 'notes'],
      });

      return data?.[0];
    } catch (error) {
      console.error('Error in updateIndicatorStatus:', error);
      throw error;
    }
  }

  /**
   * Add evidence file for an indicator
   */
  async addEvidence(
    indicatorId: number,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileType: string,
    description: string,
    uploadedByUserId: string
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('qualiopi_evidence')
        .insert({
          indicator_id: indicatorId,
          organization_id: this.organizationId,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
          description,
          uploaded_by: uploadedByUserId,
        })
        .select();

      if (error) throw new Error(`Failed to add evidence: ${error.message}`);

      const audit = data as any;
      // Log audit event
      await this.logAuditEvent('EVIDENCE_ADD', 'EVIDENCE', audit?.[0]?.id, {
        indicator_id: indicatorId,
        file_name: fileName,
      });

      return data?.[0];
    } catch (error) {
      console.error('Error in addEvidence:', error);
      throw error;
    }
  }

  /**
   * Get evidence files for an indicator
   */
  async getEvidenceForIndicator(indicatorId: number): Promise<EvidenceMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('qualiopi_evidence')
        .select(
          `
          id,
          file_name,
          file_url,
          file_size,
          file_type,
          description,
          users (full_name),
          created_at
        `
        )
        .eq('indicator_id', indicatorId)
        .eq('organization_id', this.organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch evidence: ${error.message}`);

      return (data || []).map((item: any) => ({
        id: item.id,
        file_name: item.file_name,
        file_url: item.file_url,
        file_size: item.file_size,
        file_type: item.file_type,
        description: item.description,
        uploaded_by_name: item.users?.full_name || 'Unknown',
        created_at: item.created_at,
      }));
    } catch (error) {
      console.error('Error in getEvidenceForIndicator:', error);
      throw error;
    }
  }

  /**
   * Calculate overall compliance percentage
   */
  async getCompliancePercentage(): Promise<ComplianceMetrics> {
    try {
      const { data, error } = await this.supabase
        .from('organization_qualiopi_status')
        .select('status')
        .eq('organization_id', this.organizationId);

      if (error) throw new Error(`Failed to fetch compliance data: ${error.message}`);

      const statuses = data || [];
      const total = Math.max(statuses.length, 32); // Ensure we count all 32 indicators

      const compliant_count = statuses.filter((s: any) => s.status === 'COMPLIANT').length;
      const missing_count = statuses.filter((s: any) => s.status === 'MISSING').length;
      const under_review_count = statuses.filter((s: any) => s.status === 'UNDER_REVIEW').length;

      const overall_percentage = Math.round((compliant_count / 32) * 100);

      // Get last audit date
      const { data: orgData, error: orgError } = await this.supabase
        .from('organizations')
        .select('qualiopi_last_audit_date')
        .eq('id', this.organizationId)
        .single();

      if (orgError && orgError.code !== 'PGRST116') {
        console.error('Error fetching org data:', orgError);
      }

      const org = orgData as any;
      return {
        overall_percentage,
        compliant_count,
        missing_count,
        under_review_count,
        last_audit_date: org?.qualiopi_last_audit_date || null,
      };
    } catch (error) {
      console.error('Error in getCompliancePercentage:', error);
      throw error;
    }
  }

  /**
   * Get core indicators (1, 11, 22) only
   */
  async getCoreIndicators(): Promise<IndicatorStatus[]> {
    try {
      const coreIndicatorIds = [1, 11, 22];
      const allIndicators = await this.getIndicators();
      return allIndicators.filter((ind: any) => coreIndicatorIds.includes(ind.indicator_id));
    } catch (error) {
      console.error('Error in getCoreIndicators:', error);
      throw error;
    }
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(
    actionType: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>,
    userId?: string
  ) {
    try {
      await this.supabase.from('qualiopi_audit_log').insert({
        organization_id: this.organizationId,
        action: `${entityType} ${actionType}`,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        changed_by: userId,
        details,
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - audit logging shouldn't fail the main operation
    }
  }

  /**
   * Get audit log for organization
   */
  async getAuditLog(limit = 50): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('qualiopi_audit_log')
        .select(
          `
          id,
          action,
          action_type,
          entity_type,
          entity_id,
          changed_by,
          changed_at,
          details,
          users (full_name)
        `
        )
        .eq('organization_id', this.organizationId)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Failed to fetch audit log: ${error.message}`);

      return data || [];
    } catch (error) {
      console.error('Error in getAuditLog:', error);
      throw error;
    }
  }
}

export default QualioptService;
