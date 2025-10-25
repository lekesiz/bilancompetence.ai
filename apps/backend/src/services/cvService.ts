import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface UploadResult {
  cv_url: string;
  cv_uploaded_at: string;
}

/**
 * Upload user CV to Supabase Storage
 * @param userId - User ID
 * @param file - Multer file object
 * @returns Upload result with CV URL and timestamp
 */
export async function uploadCv(userId: string, file: Express.Multer.File): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}/${uuidv4()}${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, try to create it
      if (uploadError.message.includes('not found')) {
        console.log('Creating cvs bucket...');
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
          console.error('Failed to create bucket:', bucketError);
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
          console.error('Retry upload error:', retryError);
          throw new Error(`Failed to upload CV: ${retryError.message}`);
        }

        if (!retryData) {
          throw new Error('Upload succeeded but no data returned');
        }
      } else {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload CV: ${uploadError.message}`);
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }

    const cv_url = urlData.publicUrl;
    const cv_uploaded_at = new Date().toISOString();

    // Delete old CV if exists
    const { data: userData } = await supabase
      .from('users')
      .select('cv_url')
      .eq('id', userId)
      .single();

    if (userData?.cv_url) {
      // Extract old filename from URL
      const oldFileName = userData.cv_url.split('/cvs/')[1];
      if (oldFileName) {
        await supabase.storage.from('cvs').remove([oldFileName]);
      }
    }

    // Update user record with CV URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cv_url,
        cv_uploaded_at,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user record:', updateError);
      // Clean up uploaded file
      await supabase.storage.from('cvs').remove([fileName]);
      throw new Error(`Failed to update user record: ${updateError.message}`);
    }

    return {
      cv_url,
      cv_uploaded_at,
    };
  } catch (error: any) {
    console.error('Upload CV error:', error);
    throw error;
  }
}

/**
 * Delete user CV from Supabase Storage
 * @param userId - User ID
 */
export async function deleteCv(userId: string): Promise<void> {
  try {
    // Get current CV URL
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('cv_url')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch user:', fetchError);
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    if (!userData?.cv_url) {
      throw new Error('No CV found for this user');
    }

    // Extract filename from URL
    const fileName = userData.cv_url.split('/cvs/')[1];
    if (!fileName) {
      throw new Error('Invalid CV URL format');
    }

    // Delete file from storage
    const { error: deleteError } = await supabase.storage.from('cvs').remove([fileName]);

    if (deleteError) {
      console.error('Failed to delete CV file:', deleteError);
      throw new Error(`Failed to delete CV file: ${deleteError.message}`);
    }

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        cv_url: null,
        cv_uploaded_at: null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user record:', updateError);
      throw new Error(`Failed to update user record: ${updateError.message}`);
    }
  } catch (error: any) {
    console.error('Delete CV error:', error);
    throw error;
  }
}

/**
 * Get user CV URL
 * @param userId - User ID
 * @returns CV URL or null
 */
export async function getUserCv(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('cv_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch CV:', error);
      return null;
    }

    return data?.cv_url || null;
  } catch (error) {
    console.error('Get CV error:', error);
    return null;
  }
}

