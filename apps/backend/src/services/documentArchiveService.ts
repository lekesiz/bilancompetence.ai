/**
 * Document Archive Service
 * Manages automatic archiving of bilan documents with audit trail and retention policies
 *
 * Features:
 * - Auto-archiving of bilan documents
 * - SHA256 integrity verification
 * - Complete access audit trail
 * - Retention policy enforcement
 * - Soft delete support
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import crypto from 'crypto';

interface ArchivedDocument {
  id: string;
  bilan_id: string;
  document_type: 'PRELIMINARY' | 'INVESTIGATION' | 'CONCLUSION' | 'REPORT' | 'EVIDENCE' | 'OTHER';
  file_name: string;
  file_url: string;
  file_size: number;
  file_hash: string;
  mime_type: string;
  created_by_name: string;
  created_at: string;
  retention_until: string | null;
}

interface AccessLogEntry {
  id: string;
  accessed_by_name: string;
  action: 'VIEW' | 'DOWNLOAD' | 'SHARE' | 'DELETE_REQUEST';
  accessed_at: string;
  user_ip: string;
  user_agent: string;
  notes?: string;
}

interface ArchiveStats {
  total_documents: number;
  total_size: number;
  by_type: Record<string, number>;
  earliest_document: string;
  latest_document: string;
  documents_expiring_soon: number;
}

const RETENTION_POLICY_DAYS = 1825; // 5 years
const DOCUMENT_TYPES = ['PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'REPORT', 'EVIDENCE', 'OTHER'];

export class DocumentArchiveService {
  private supabase: ReturnType<typeof createClient<Database>>;
  private organizationId: string;

  constructor(organizationId: string) {
    this.supabase = createClient<Database>(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
    this.organizationId = organizationId;
  }

  /**
   * Calculate SHA256 hash of file content
   */
  private calculateHash(fileContent: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    hash.update(fileContent);
    return hash.digest('hex');
  }

  /**
   * Archive a document
   */
  async archiveDocument(
    bilanId: string,
    documentType: string,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileHash: string,
    mimeType: string,
    createdByUserId: string
  ): Promise<ArchivedDocument> {
    try {
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + RETENTION_POLICY_DAYS);

      const { data, error } = await this.supabase
        .from('document_archive')
        .insert({
          bilan_id: bilanId,
          organization_id: this.organizationId,
          document_type: documentType,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileSize,
          file_hash: fileHash,
          mime_type: mimeType,
          created_by: createdByUserId,
          retention_until: retentionUntil.toISOString(),
        })
        .select(
          `
          id,
          bilan_id,
          document_type,
          file_name,
          file_url,
          file_size,
          file_hash,
          mime_type,
          users (full_name),
          created_at,
          retention_until
        `
        )
        .single();

      if (error) throw new Error(`Failed to archive document: ${error.message}`);

      // Type assertion for data properties
      const doc = data as any;

      // Log audit event
      await this.logAccess(
        doc.id,
        createdByUserId,
        'DOWNLOAD',
        '0.0.0.0',
        'Document archived',
        'System archive operation'
      );

      return {
        id: doc.id,
        bilan_id: doc.bilan_id,
        document_type: doc.document_type,
        file_name: doc.file_name,
        file_url: doc.file_url,
        file_size: doc.file_size,
        file_hash: doc.file_hash,
        mime_type: doc.mime_type,
        created_by_name: doc.users?.full_name || 'System',
        created_at: doc.created_at,
        retention_until: doc.retention_until,
      };
    } catch (error) {
      console.error('Error in archiveDocument:', error);
      throw error;
    }
  }

  /**
   * Get all archived documents for organization
   */
  async getArchivedDocuments(
    filters?: {
      documentType?: string;
      bilanId?: string;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ArchivedDocument[]> {
    try {
      let query = this.supabase
        .from('document_archive')
        .select(
          `
          id,
          bilan_id,
          document_type,
          file_name,
          file_url,
          file_size,
          file_hash,
          mime_type,
          users (full_name),
          created_at,
          retention_until
        `
        )
        .eq('organization_id', this.organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (filters?.documentType) {
        query = query.eq('document_type', filters.documentType);
      }

      if (filters?.bilanId) {
        query = query.eq('bilan_id', filters.bilanId);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Failed to fetch documents: ${error.message}`);

      return (data || []).map((doc: any) => ({
        id: doc.id,
        bilan_id: doc.bilan_id,
        document_type: doc.document_type,
        file_name: doc.file_name,
        file_url: doc.file_url,
        file_size: doc.file_size,
        file_hash: doc.file_hash,
        mime_type: doc.mime_type,
        created_by_name: doc.users?.full_name || 'Unknown',
        created_at: doc.created_at,
        retention_until: doc.retention_until,
      }));
    } catch (error) {
      console.error('Error in getArchivedDocuments:', error);
      throw error;
    }
  }

  /**
   * Get document details with full access log
   */
  async getDocumentDetails(documentId: string): Promise<any> {
    try {
      const { data: document, error: docError } = await this.supabase
        .from('document_archive')
        .select(
          `
          *,
          users (full_name),
          bilans (id, status)
        `
        )
        .eq('id', documentId)
        .eq('organization_id', this.organizationId)
        .is('deleted_at', null)
        .single();

      if (docError) throw new Error(`Document not found: ${docError.message}`);

      const { data: accessLog, error: logError } = await this.supabase
        .from('document_access_log')
        .select(
          `
          id,
          action,
          accessed_at,
          user_ip,
          user_agent,
          notes,
          users (full_name)
        `
        )
        .eq('document_id', documentId)
        .order('accessed_at', { ascending: false });

      if (logError) throw new Error(`Failed to fetch access log: ${logError.message}`);

      return {
        document,
        access_log: accessLog || [],
        access_count: accessLog?.length || 0,
      };
    } catch (error) {
      console.error('Error in getDocumentDetails:', error);
      throw error;
    }
  }

  /**
   * Log document access
   */
  async logAccess(
    documentId: string,
    userId: string,
    action: 'VIEW' | 'DOWNLOAD' | 'SHARE' | 'DELETE_REQUEST',
    userIp: string,
    userAgent: string,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('document_access_log').insert({
        document_id: documentId,
        accessed_by: userId,
        action,
        user_ip: userIp,
        user_agent: userAgent,
        notes,
      });

      if (error) throw new Error(`Failed to log access: ${error.message}`);
    } catch (error) {
      console.error('Error in logAccess:', error);
      // Don't throw - logging shouldn't fail the main operation
    }
  }

  /**
   * Get access log for a document
   */
  async getAccessLog(documentId: string, limit = 100): Promise<AccessLogEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('document_access_log')
        .select(
          `
          id,
          action,
          accessed_at,
          user_ip,
          user_agent,
          notes,
          users (full_name)
        `
        )
        .eq('document_id', documentId)
        .order('accessed_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Failed to fetch access log: ${error.message}`);

      return (data || []).map((entry: any) => ({
        id: entry.id,
        accessed_by_name: entry.users?.full_name || 'Unknown',
        action: entry.action,
        accessed_at: entry.accessed_at,
        user_ip: entry.user_ip,
        user_agent: entry.user_agent,
        notes: entry.notes,
      }));
    } catch (error) {
      console.error('Error in getAccessLog:', error);
      throw error;
    }
  }

  /**
   * Get archive statistics
   */
  async getArchiveStats(): Promise<ArchiveStats> {
    try {
      const { data: documents, error: docsError } = await this.supabase
        .from('document_archive')
        .select('id, document_type, file_size, created_at, retention_until')
        .eq('organization_id', this.organizationId)
        .is('deleted_at', null);

      if (docsError) throw new Error(`Failed to fetch documents: ${docsError.message}`);

      const docs = documents || [];
      const byType: Record<string, number> = {};
      let totalSize = 0;

      docs.forEach((doc: any) => {
        byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
        totalSize += doc.file_size || 0;
      });

      // Find documents expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringsoon = docs.filter((doc: any) => {
        const retentionDate = new Date(doc.retention_until);
        return retentionDate <= thirtyDaysFromNow && retentionDate > new Date();
      }).length;

      const createdDates = docs.map((d: any) => new Date(d.created_at)).sort((a, b) => a.getTime() - b.getTime());

      return {
        total_documents: docs.length,
        total_size: totalSize,
        by_type: byType,
        earliest_document: createdDates[0]?.toISOString() || new Date().toISOString(),
        latest_document: createdDates[createdDates.length - 1]?.toISOString() || new Date().toISOString(),
        documents_expiring_soon: expiringsoon,
      };
    } catch (error) {
      console.error('Error in getArchiveStats:', error);
      throw error;
    }
  }

  /**
   * Apply retention policy - delete expired documents
   */
  async applyRetentionPolicy(): Promise<number> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('document_archive')
        .update({ deleted_at: now })
        .eq('organization_id', this.organizationId)
        .lte('retention_until', now)
        .is('deleted_at', null)
        .select();

      if (error) throw new Error(`Failed to apply retention policy: ${error.message}`);

      const deletedCount = (data || []).length;

      console.log(`Retention policy applied: ${deletedCount} documents marked for deletion`);
      return deletedCount;
    } catch (error) {
      console.error('Error in applyRetentionPolicy:', error);
      throw error;
    }
  }

  /**
   * Verify document integrity using hash
   */
  async verifyDocumentIntegrity(documentId: string, currentHash: string): Promise<boolean> {
    try {
      const { data: document, error } = await this.supabase
        .from('document_archive')
        .select('file_hash')
        .eq('id', documentId)
        .single();

      if (error) throw new Error(`Document not found: ${error.message}`);

      const doc = document as any;
      return doc.file_hash === currentHash;
    } catch (error) {
      console.error('Error in verifyDocumentIntegrity:', error);
      return false;
    }
  }

  /**
   * Get bilan documents
   */
  async getDocumentsForBilan(bilanId: string): Promise<ArchivedDocument[]> {
    try {
      return await this.getArchivedDocuments({ bilanId });
    } catch (error) {
      console.error('Error in getDocumentsForBilan:', error);
      throw error;
    }
  }

  /**
   * Auto-archive bilan document (called after document creation)
   */
  async autoArchiveDocument(
    bilanId: string,
    documentType: string,
    fileName: string,
    fileUrl: string,
    fileContent: Buffer | string,
    mimeType: string,
    createdByUserId: string
  ): Promise<ArchivedDocument> {
    try {
      // Calculate hash
      const fileHash = this.calculateHash(fileContent);

      // Calculate file size
      const fileSize = typeof fileContent === 'string' ? Buffer.byteLength(fileContent) : fileContent.length;

      // Archive document
      return await this.archiveDocument(
        bilanId,
        documentType,
        fileName,
        fileUrl,
        fileSize,
        fileHash,
        mimeType,
        createdByUserId
      );
    } catch (error) {
      console.error('Error in autoArchiveDocument:', error);
      throw error;
    }
  }
}

export default DocumentArchiveService;

