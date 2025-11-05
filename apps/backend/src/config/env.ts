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
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
];

const recommendedEnvVars = [
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'STRIPE_SECRET_KEY',
  'SENDGRID_API_KEY',
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
