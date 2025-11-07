import { supabase } from '../config/supabase.js';
import { updateUserCV, deleteUserCV, getUserById } from './userServiceNeon.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { logger } from '../utils/logger.js';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';

interface UploadResult {
  cv_url: string;
  cv_uploaded_at: Date;
}

/**
 * Upload user CV to Supabase Storage and update Neon database
 * @param userId - User ID
 * @param file - Multer file object
 * @returns Upload result with CV URL and timestamp
 */
export async function uploadCV(userId: string, file: Express.Multer.File): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}/${uuidv4()}${fileExt}`;

    logger.info('Uploading CV to Supabase Storage', { userId, fileName });

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try to create it
      if (
        uploadError.message.includes('not found') ||
        uploadError.message.includes('Bucket not found')
      ) {
        logger.info('Creating cvs bucket in Supabase Storage');

        const { error: bucketError } = await supabase.storage.createBucket('cvs', {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
          logger.error('Failed to create bucket', { error: bucketError });
          throw new Error('Failed to create storage bucket');
        }

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from('cvs')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (retryError) {
          logger.error('Retry upload error', { error: retryError });
          throw new Error(`Failed to upload CV: ${retryError.message}`);
        }

        if (!retryData) {
          throw new Error('Upload succeeded but no data returned');
        }
      } else {
        logger.error('Upload error', { error: uploadError });
        throw new Error(`Failed to upload CV: ${uploadError.message}`);
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    const cv_url = urlData.publicUrl;

    // Delete old CV if exists
    const user = await getUserById(userId);
    if (user?.cv_url) {
      try {
        // Extract old filename from URL
        const oldFileName = user.cv_url.split('/cvs/')[1];
        if (oldFileName) {
          logger.info('Deleting old CV', { oldFileName });
          await supabase.storage.from('cvs').remove([oldFileName]);
        }
      } catch (error) {
        logger.warn('Failed to delete old CV', { error });
        // Continue even if old CV deletion fails
      }
    }

    // Update user record in Neon database with RLS
    const updatedUser = await updateUserCV(userId, cv_url);

    if (!updatedUser) {
      // Clean up uploaded file if database update fails
      await supabase.storage.from('cvs').remove([fileName]);
      throw new Error('Failed to update user record in database');
    }

    logger.info('CV uploaded successfully', { userId, cv_url });

    return {
      cv_url: updatedUser.cv_url!,
      cv_uploaded_at: updatedUser.cv_uploaded_at!,
    };
  } catch (error: unknown) {
    logger.error('Upload CV error', { error, userId });
    throw error;
  }
}

/**
 * Delete user CV from Supabase Storage and update Neon database
 * @param userId - User ID
 */
export async function deleteCV(userId: string): Promise<void> {
  try {
    // Get current CV URL from Neon database
    const user = await getUserById(userId);

    if (!user?.cv_url) {
      throw new Error('No CV found for this user');
    }

    // Extract filename from URL
    const fileName = user.cv_url.split('/cvs/')[1];
    if (!fileName) {
      throw new Error('Invalid CV URL format');
    }

    logger.info('Deleting CV', { userId, fileName });

    // Delete file from Supabase Storage
    const { error: deleteError } = await supabase.storage.from('cvs').remove([fileName]);

    if (deleteError) {
      logger.error('Failed to delete CV file from storage', { error: deleteError });
      throw new Error(`Failed to delete CV file: ${deleteError.message}`);
    }

    // Update user record in Neon database with RLS
    const updatedUser = await deleteUserCV(userId);

    if (!updatedUser) {
      throw new Error('Failed to update user record in database');
    }

    logger.info('CV deleted successfully', { userId });
  } catch (error: unknown) {
    logger.error('Delete CV error', { error, userId });
    throw error;
  }
}

/**
 * Get user CV URL from Neon database
 * @param userId - User ID
 * @returns CV URL or null
 */
export async function getUserCV(userId: string): Promise<string | null> {
  try {
    const user = await getUserById(userId);
    return user?.cv_url || null;
  } catch (error) {
    logger.error('Get CV error', { error, userId });
    return null;
  }
}
