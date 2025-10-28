import { supabase } from './supabaseService.js';
import { v4 as uuidv4 } from 'uuid';
import {
  logAndThrow,
  validateRequired,
  DatabaseError,
  NotFoundError,
} from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * File Service - File management & storage
 * Standardized error handling for all file operations
 */

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

/**
 * Upload file to Supabase Storage
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

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
      contentType: fileType,
      cacheControl: '3600',
    });

    if (error) {
      throw new DatabaseError('Failed to upload file to storage', error);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    // Save metadata to database
    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_size: file.length,
        file_type: fileType,
        storage_path: storagePath,
        bucket,
        url: publicUrlData.publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      throw new DatabaseError('Failed to save file metadata', dbError);
    }

    logger.info('File uploaded successfully', { userId, fileName, fileSize: file.length });
    return fileData as unknown as FileMetadata;
  } catch (error) {
    logAndThrow('Failed to upload file', error);
  }
}

/**
 * Upload avatar
 */
export async function uploadAvatar(
  userId: string,
  file: Buffer,
  fileName: string
): Promise<string> {
  try {
    validateRequired({ userId, file, fileName }, ['userId', 'file', 'fileName']);

    const avatarPath = `avatars/${userId}/${uuidv4()}-${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(avatarPath, file, {
      contentType: 'image/*',
      cacheControl: '86400', // 24 hours
    });

    if (error) {
      throw new DatabaseError('Failed to upload avatar', error);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);

    // Update user avatar_url
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    if (updateError) {
      throw new DatabaseError('Failed to update user avatar', updateError);
    }

    logger.info('Avatar uploaded successfully', { userId });
    return data.publicUrl;
  } catch (error) {
    logAndThrow('Failed to upload avatar', error);
  }
}

/**
 * Get user files
 */
export async function getUserFiles(userId: string, limit: number = 100): Promise<any> {
  try {
    validateRequired({ userId }, ['userId']);

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new DatabaseError('Failed to fetch user files', error);
    }

    logger.info('User files retrieved successfully', { userId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logAndThrow('Failed to get user files', error);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    validateRequired({ fileId }, ['fileId']);

    const { data, error } = await supabase.from('files').select('*').eq('id', fileId).single();

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch file metadata', error);
    }

    if (!data) {
      logger.info('File metadata not found', { fileId });
      return null;
    }

    logger.info('File metadata retrieved successfully', { fileId });
    return data as unknown as FileMetadata;
  } catch (error) {
    logAndThrow('Failed to get file metadata', error);
  }
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    validateRequired({ fileId }, ['fileId']);

    // Get file metadata
    const fileData = await getFileMetadata(fileId);
    if (!fileData) {
      throw new NotFoundError('File');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(fileData.bucket)
      .remove([fileData.storage_path]);

    if (storageError) {
      throw new DatabaseError('Failed to delete file from storage', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase.from('files').delete().eq('id', fileId);

    if (dbError) {
      throw new DatabaseError('Failed to delete file from database', dbError);
    }

    logger.info('File deleted successfully', { fileId });
    return true;
  } catch (error) {
    logAndThrow('Failed to delete file', error);
  }
}

/**
 * Upload document for assessment
 */
export async function uploadAssessmentDocument(
  userId: string,
  assessmentId: string,
  file: Buffer,
  fileName: string,
  fileType: string
): Promise<any> {
  try {
    validateRequired({ userId, assessmentId, file, fileName, fileType }, [
      'userId',
      'assessmentId',
      'file',
      'fileName',
      'fileType',
    ]);

    const documentPath = `assessments/${assessmentId}/${uuidv4()}-${fileName}`;

    const { error } = await supabase.storage.from('documents').upload(documentPath, file, {
      contentType: fileType,
    });

    if (error) {
      throw new DatabaseError('Failed to upload assessment document to storage', error);
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(documentPath);

    // Save document record
    const { data: docData, error: dbError } = await supabase
      .from('documents')
      .insert({
        bilan_id: assessmentId,
        uploaded_by: userId,
        file_name: fileName,
        file_size: file.length,
        file_type: fileType,
        storage_path: documentPath,
        url: data.publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      throw new DatabaseError('Failed to save assessment document metadata', dbError);
    }

    logger.info('Assessment document uploaded successfully', { userId, assessmentId, fileName });
    return docData;
  } catch (error) {
    logAndThrow('Failed to upload assessment document', error);
  }
}

/**
 * Get assessment documents
 */
export async function getAssessmentDocuments(assessmentId: string): Promise<any> {
  try {
    validateRequired({ assessmentId }, ['assessmentId']);

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('bilan_id', assessmentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new DatabaseError('Failed to fetch assessment documents', error);
    }

    logger.info('Assessment documents retrieved successfully', {
      assessmentId,
      count: data?.length || 0,
    });
    return data || [];
  } catch (error) {
    logAndThrow('Failed to get assessment documents', error);
  }
}

/**
 * Generate file download URL with expiry
 */
export async function getDownloadUrl(fileId: string, expirySeconds: number = 3600) {
  try {
    validateRequired({ fileId }, ['fileId']);

    const fileData = await getFileMetadata(fileId);
    if (!fileData) {
      throw new NotFoundError('File');
    }

    const { data, error } = await supabase.storage
      .from(fileData.bucket)
      .createSignedUrl(fileData.storage_path, expirySeconds);

    if (error) {
      throw new DatabaseError('Failed to generate download URL', error);
    }

    logger.info('Download URL generated successfully', { fileId, expirySeconds });
    return data.signedUrl;
  } catch (error) {
    logAndThrow('Failed to get download URL', error);
  }
}

export default {
  uploadFile,
  uploadAvatar,
  getUserFiles,
  getFileMetadata,
  deleteFile,
  uploadAssessmentDocument,
  getAssessmentDocuments,
  getDownloadUrl,
};
