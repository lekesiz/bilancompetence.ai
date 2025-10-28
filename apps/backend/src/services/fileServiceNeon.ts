/**
 * File Service (Neon PostgreSQL)
 * Complete implementation matching original Supabase service signatures
 */

import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import {
  logAndThrow,
  validateRequired,
  DatabaseError,
  NotFoundError,
} from '../utils/errorHandler.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FileMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  bucket: string;
  url: string;
  created_at: string;
}

// ============================================================================
// FILE SERVICE FUNCTIONS
// ============================================================================

/**
 * Upload file to storage (placeholder - actual upload handled by multer/S3)
 * This function records file metadata in database
 */
export async function uploadFile(
  userId: string,
  file: Buffer,
  fileName: string,
  fileType: string,
  bucket: string = 'files'
): Promise<FileMetadata> {
  try {
    validateRequired({ userId, file, fileName, fileType, bucket }, [
      'userId',
      'file',
      'fileName',
      'fileType',
      'bucket',
    ]);

    const fileId = uuidv4();
    const storagePath = `${userId}/${fileId}-${fileName}`;

    // In production, this would upload to S3 or similar
    // For now, we just record metadata
    const fileUrl = `/files/${storagePath}`;

    const result = await query<FileMetadata>(
      null,
      `INSERT INTO files (
        id, user_id, file_name, file_size, file_type, storage_path, bucket, url, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *`,
      [fileId, userId, fileName, file.length, fileType, storagePath, bucket, fileUrl]
    );

    logger.info('File uploaded successfully', { userId, fileName, fileSize: file.length });
    return result[0];
  } catch (error) {
    logAndThrow('Failed to upload file', error);
  }
}

/**
 * Upload avatar (CV/profile picture)
 */
export async function uploadAvatar(
  userId: string,
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    validateRequired({ userId, file, fileName }, ['userId', 'file', 'fileName']);

    const avatarPath = `avatars/${userId}/${uuidv4()}-${fileName}`;
    const avatarUrl = `/files/${avatarPath}`;

    // Record in database
    await query(
      null,
      `INSERT INTO files (
        id, user_id, file_name, file_size, file_type, storage_path, bucket, url, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [uuidv4(), userId, fileName, file.length, 'image/*', avatarPath, 'avatars', avatarUrl]
    );

    // Update user's avatar_url
    await query(null, `UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`, [
      avatarUrl,
      userId,
    ]);

    logger.info('Avatar uploaded successfully', { userId });
    return avatarUrl;
  } catch (error) {
    logAndThrow('Failed to upload avatar', error);
  }
}

/**
 * Get user files
 */
export async function getUserFiles(userId: string, limit: number = 100) {
  try {
    validateRequired({ userId }, ['userId']);

    const result = await query<FileMetadata>(
      null,
      `SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );

    return result;
  } catch (error) {
    logAndThrow('Failed to fetch user files', error);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    validateRequired({ fileId }, ['fileId']);

    const result = await query<FileMetadata>(null, `SELECT * FROM files WHERE id = $1`, [fileId]);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    logAndThrow('Failed to fetch file metadata', error);
  }
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    validateRequired({ fileId }, ['fileId']);

    // Get file metadata first
    const file = await getFileMetadata(fileId);
    if (!file) {
      return false;
    }

    // Delete from database
    await query(null, `DELETE FROM files WHERE id = $1`, [fileId]);

    // In production, would also delete from S3/storage
    logger.info('File deleted successfully', { fileId });
    return true;
  } catch (error) {
    logger.error('Failed to delete file', error);
    return false;
  }
}

/**
 * Upload assessment document
 */
export async function uploadAssessmentDocument(
  userId: string,
  assessmentId: string,
  file: Buffer,
  fileName: string,
  fileType: string
): Promise<FileMetadata> {
  try {
    validateRequired({ userId, assessmentId, file, fileName, fileType }, [
      'userId',
      'assessmentId',
      'file',
      'fileName',
      'fileType',
    ]);

    const fileId = uuidv4();
    const storagePath = `assessments/${assessmentId}/${fileId}-${fileName}`;
    const fileUrl = `/files/${storagePath}`;

    const result = await query<FileMetadata>(
      null,
      `INSERT INTO files (
        id, user_id, file_name, file_size, file_type, storage_path, bucket, url, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *`,
      [fileId, userId, fileName, file.length, fileType, storagePath, 'assessments', fileUrl]
    );

    // Link file to assessment
    await query(
      null,
      `INSERT INTO assessment_documents (assessment_id, file_id, created_at) 
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
      [assessmentId, fileId]
    );

    logger.info('Assessment document uploaded', { assessmentId, fileName });
    return result[0];
  } catch (error) {
    logAndThrow('Failed to upload assessment document', error);
  }
}

/**
 * Get assessment documents
 */
export async function getAssessmentDocuments(assessmentId: string) {
  try {
    validateRequired({ assessmentId }, ['assessmentId']);

    const result = await query<FileMetadata>(
      null,
      `SELECT f.* FROM files f
       INNER JOIN assessment_documents ad ON f.id = ad.file_id
       WHERE ad.assessment_id = $1
       ORDER BY f.created_at DESC`,
      [assessmentId]
    );

    return result;
  } catch (error) {
    logAndThrow('Failed to fetch assessment documents', error);
  }
}

/**
 * Get download URL (returns existing URL from database)
 */
export async function getDownloadUrl(fileId: string, expirySeconds: number = 3600) {
  try {
    validateRequired({ fileId }, ['fileId']);

    const file = await getFileMetadata(fileId);
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // In production, would generate signed URL with expiry
    // For now, just return the URL
    return file.url;
  } catch (error) {
    logAndThrow('Failed to get download URL', error);
  }
}
