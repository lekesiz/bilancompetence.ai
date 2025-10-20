import { supabase } from './supabaseService';
import { v4 as uuidv4 } from 'uuid';

/**
 * File Service - File management & storage
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
  const fileId = uuidv4();
  const storagePath = `${userId}/${fileId}-${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: fileType,
      cacheControl: '3600',
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

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
    throw dbError;
  }

  return fileData as FileMetadata;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(
  userId: string,
  file: Buffer,
  fileName: string
): Promise<string> {
  const avatarPath = `avatars/${userId}/${uuidv4()}-${fileName}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(avatarPath, file, {
      contentType: 'image/*',
      cacheControl: '86400', // 24 hours
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(avatarPath);

  // Update user avatar_url
  await supabase
    .from('users')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);

  return data.publicUrl;
}

/**
 * Get user files
 */
export async function getUserFiles(userId: string, limit: number = 100) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  // Get file metadata
  const fileData = await getFileMetadata(fileId);
  if (!fileData) {
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(fileData.bucket)
    .remove([fileData.storage_path]);

  if (storageError) {
    throw storageError;
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw dbError;
  }

  return true;
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
) {
  const documentPath = `assessments/${assessmentId}/${uuidv4()}-${fileName}`;

  const { error } = await supabase.storage
    .from('documents')
    .upload(documentPath, file, {
      contentType: fileType,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(documentPath);

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
    throw dbError;
  }

  return docData;
}

/**
 * Get assessment documents
 */
export async function getAssessmentDocuments(assessmentId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('bilan_id', assessmentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Generate file download URL with expiry
 */
export async function getDownloadUrl(fileId: string, expirySeconds: number = 3600) {
  const fileData = await getFileMetadata(fileId);
  if (!fileData) {
    throw new Error('File not found');
  }

  const { data, error } = await supabase.storage
    .from(fileData.bucket)
    .createSignedUrl(fileData.storage_path, expirySeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
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
