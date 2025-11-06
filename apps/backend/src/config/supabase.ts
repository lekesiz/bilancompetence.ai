/**
 * Supabase Configuration
 *
 * ⚠️ LEGACY: Only used for Supabase Storage (file uploads)
 * - All database operations use Neon PostgreSQL
 * - TODO: Migrate file storage to S3 or alternative
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.warn('Supabase credentials not configured - file storage will not work');
  logger.warn('Database operations use Neon PostgreSQL and are not affected');
}

/**
 * Supabase client - ONLY for Storage
 * Database operations should use Neon services (userServiceNeon, etc.)
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);
