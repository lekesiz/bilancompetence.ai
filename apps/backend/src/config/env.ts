import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.resolve(__dirname, '../');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(backendDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(backendDir, '.env') });

// ✅ PHASE 2: Environment Variable Validation
// 🔒 SECURITY: Comprehensive validation added after security audit
const requiredEnvVars = [
  // Core Infrastructure
  'DATABASE_URL',           // Primary Neon database connection
  'JWT_SECRET',            // Session token signing (CRITICAL - must be strong)
  'FRONTEND_URL',          // CORS and redirect configuration

  // Email Service (CRITICAL - required for auth flows)
  'RESEND_API_KEY',        // Email delivery service
  'EMAIL_FROM',            // Sender email address
];

const recommendedEnvVars = [
  // AI Services
  'GEMINI_API_KEY',        // Google Gemini AI for recommendations
  'GOOGLE_API_KEY',        // Google services integration

  // Storage (Supabase Storage still used for file uploads)
  'SUPABASE_URL',          // Supabase project URL
  'SUPABASE_SERVICE_KEY',  // Admin access for Storage operations

  // Payment Processing
  'STRIPE_SECRET_KEY',     // Payment gateway
  'STRIPE_WEBHOOK_SECRET', // Webhook signature verification

  // Third-party Integrations
  'WEDOF_API_KEY',         // Wedof LMS integration
  'PENNYLANE_API_KEY',     // Accounting software integration

  // SSO/OAuth
  'GOOGLE_CLIENT_ID',      // Google OAuth
  'GOOGLE_CLIENT_SECRET',
  'MICROSOFT_CLIENT_ID',   // Microsoft OAuth
  'MICROSOFT_CLIENT_SECRET',
  'MICROSOFT_TENANT_ID',

  // France Travail API
  'FRANCE_TRAVAIL_CLIENT_ID',
  'FRANCE_TRAVAIL_CLIENT_SECRET',

  // Monitoring
  'SENTRY_DSN',            // Error tracking and monitoring
];

// Check required variables
const missingRequired = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingRequired.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:');
  missingRequired.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Set these variables in your .env file or deployment platform.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Fail fast in production
  }
}

// Warn about missing recommended variables
const missingRecommended = recommendedEnvVars.filter(varName => !process.env[varName]);
if (missingRecommended.length > 0) {
  console.warn('⚠️  WARNING: Missing recommended environment variables:');
  missingRecommended.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('   Some features may not work correctly.\n');
}

if (missingRequired.length === 0) {
  console.log('✅ Environment variables validated');
  console.log(`   - Required: ${requiredEnvVars.length}/${requiredEnvVars.length}`);
  console.log(`   - Recommended: ${recommendedEnvVars.length - missingRecommended.length}/${recommendedEnvVars.length}\n`);
}
