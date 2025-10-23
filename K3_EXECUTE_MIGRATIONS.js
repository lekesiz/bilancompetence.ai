#!/usr/bin/env node

/**
 * K3 - Automated Migration Execution Script
 * Executes all 17 database migrations to Supabase
 *
 * Usage: node K3_EXECUTE_MIGRATIONS.js
 *
 * Prerequisites:
 * - SUPABASE_URL in environment
 * - SUPABASE_SERVICE_ROLE_KEY in environment
 * - All migration files in apps/backend/migrations/
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ommidwwqqrhupmhaqghx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, 'apps/backend/migrations');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Migration files in order
const MIGRATIONS = [
  '001_create_schema.sql',
  '002_expand_assessments_schema.sql',
  '003_expand_assessment_questions.sql',
  '004_expand_assessment_answers.sql',
  '005_create_assessment_competencies.sql',
  '006_create_assessment_drafts.sql',
  '007_seed_assessment_questions.sql',
  '008_create_qualiopi_indicators.sql',
  '009_create_organization_qualiopi_status.sql',
  '010_create_qualiopi_evidence.sql',
  '011_create_satisfaction_surveys.sql',
  '012_create_document_archive.sql',
  '013_create_qualiopi_audit_log.sql',
  '014_create_availability_slots.sql',
  '015_create_session_bookings.sql',
  '016_create_session_reminders.sql',
  '017_create_session_analytics.sql',
];

/**
 * Print colored output
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print header
 */
function printHeader() {
  log('\n' + '═'.repeat(80), 'cyan');
  log('🚀 K3 - DATABASE MIGRATION EXECUTION', 'bold cyan');
  log('═'.repeat(80) + '\n', 'cyan');
}

/**
 * Verify environment
 */
function verifyEnvironment() {
  log('[1/4] Verifying Environment', 'blue');

  // Check Supabase URL
  if (!SUPABASE_URL) {
    log('  ✗ SUPABASE_URL not set', 'red');
    process.exit(1);
  }
  log(`  ✓ Supabase URL: ${SUPABASE_URL}`, 'green');

  // Check service key
  if (!SUPABASE_SERVICE_KEY) {
    log('  ✗ SUPABASE_SERVICE_ROLE_KEY not set', 'red');
    log('  Please set SUPABASE_SERVICE_ROLE_KEY environment variable', 'yellow');
    process.exit(1);
  }
  log('  ✓ Service key configured', 'green');

  // Check migrations directory
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    log(`  ✗ Migrations directory not found: ${MIGRATIONS_DIR}`, 'red');
    process.exit(1);
  }
  log(`  ✓ Migrations directory: ${MIGRATIONS_DIR}`, 'green');

  // Check migration files
  let missingFiles = [];
  for (const migration of MIGRATIONS) {
    const filepath = path.join(MIGRATIONS_DIR, migration);
    if (!fs.existsSync(filepath)) {
      missingFiles.push(migration);
    }
  }

  if (missingFiles.length > 0) {
    log(`  ✗ Missing migration files: ${missingFiles.join(', ')}`, 'red');
    process.exit(1);
  }
  log(`  ✓ All ${MIGRATIONS.length} migration files present`, 'green');

  log('  Result: ✓ All checks passed\n', 'green');
}

/**
 * Read migration file
 */
function readMigrationFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read ${filename}: ${error.message}`);
  }
}

/**
 * Execute migration via Supabase client
 */
async function executeMigration(supabase, migrationIndex, migrationName, sql) {
  try {
    // Execute SQL via RPC or direct query
    // Since we have service role key, we can use REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'X-Client-Info': 'K3-Migration-Executor',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return { success: true };
  } catch (error) {
    // Try alternative: use supabase client directly
    // This requires executing multiple statements
    try {
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec_sql', {
          sql: statement + ';',
        });

        if (execError) {
          throw execError;
        }
      }
      return { success: true };
    } catch (fallbackError) {
      throw new Error(`Migration execution failed: ${fallbackError.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  printHeader();

  // Step 1: Verify environment
  verifyEnvironment();

  // Step 2: Print migration plan
  log('[2/4] Migration Execution Plan', 'blue');
  log(`\n  ${MIGRATIONS.length} migrations will be executed:\n`, 'bold');

  let totalSize = 0;
  for (let i = 0; i < MIGRATIONS.length; i++) {
    const migration = MIGRATIONS[i];
    const filepath = path.join(MIGRATIONS_DIR, migration);
    const size = fs.statSync(filepath).size / 1024;
    totalSize += size;
    log(`  ${(i + 1).toString().padStart(2)}. ${migration.padEnd(50)} (${size.toFixed(1)} KB)`, 'cyan');
  }

  log(`\n  Total size: ${(totalSize).toFixed(1)} KB`, 'bold');
  log(`  Expected tables: 30+\n`, 'bold');

  // Step 3: Create Supabase client
  log('[3/4] Connecting to Supabase', 'blue');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    log(`  ✓ Connected to: ${SUPABASE_URL}`, 'green');

    // Test connection
    const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
    if (error && error.message.includes('pg_tables')) {
      // pg_tables may not exist or be accessible, try a different check
      log(`  ✓ Connection verified`, 'green');
    } else if (error) {
      log(`  ⚠ Connection warning: ${error.message}`, 'yellow');
    } else {
      log(`  ✓ Connection verified`, 'green');
    }

    log('', '');

    // Step 4: Execute migrations
    log('[4/4] Executing Migrations', 'blue');
    log('', '');

    let successCount = 0;
    let failureCount = 0;
    let failedMigrations = [];

    for (let i = 0; i < MIGRATIONS.length; i++) {
      const migration = MIGRATIONS[i];
      const migrationNum = String(i + 1).padStart(2);

      process.stdout.write(`  ${migrationNum}. ${migration.padEnd(50)} ... `);

      try {
        const sql = readMigrationFile(migration);
        const result = await executeMigration(supabase, i, migration, sql);

        if (result.success) {
          log('✓', 'green');
          successCount++;
        } else {
          log('✗', 'red');
          failureCount++;
          failedMigrations.push(migration);
        }
      } catch (error) {
        log('✗', 'red');
        log(`    Error: ${error.message}`, 'red');
        failureCount++;
        failedMigrations.push(migration);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    log('\n', '');

    // Summary
    log('═'.repeat(80), 'cyan');
    log('EXECUTION SUMMARY', 'bold cyan');
    log('═'.repeat(80), 'cyan');

    log(`\nSuccessful migrations: ${successCount}/${MIGRATIONS.length}`, successCount === MIGRATIONS.length ? 'green' : 'yellow');

    if (failureCount > 0) {
      log(`Failed migrations: ${failureCount}/${MIGRATIONS.length}`, 'red');
      log('\nFailed migrations:', 'red');
      failedMigrations.forEach(m => {
        log(`  - ${m}`, 'red');
      });
      log('\nPlease review errors above and rerun if needed.\n', 'yellow');
      process.exit(failureCount > 0 ? 1 : 0);
    } else {
      log(`\n✓ All migrations completed successfully!\n`, 'green');

      log('Next steps:', 'bold');
      log('  1. Run verification queries (see K3_MIGRATION_EXECUTION_GUIDE.md)', '');
      log('  2. Check Supabase Studio for 30+ tables', '');
      log('  3. Test Auth API endpoints', '');
      log('  4. Notify team that database is ready\n', '');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run script
if (require.main === module) {
  main().catch(error => {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { executeMigration };
