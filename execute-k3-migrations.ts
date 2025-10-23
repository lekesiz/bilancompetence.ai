import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ommidwwqqrhupmhaqghx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(process.cwd(), 'apps/backend/migrations');

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

async function executeMigrations() {
  console.log('🚀 K3 - Database Migration Execution\n');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
    console.error('Please set the environment variable and try again');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    db: {
      schema: 'public',
    },
  });

  console.log(`✓ Connected to: ${SUPABASE_URL}\n`);
  console.log(`📋 Executing ${MIGRATIONS.length} migrations...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < MIGRATIONS.length; i++) {
    const migration = MIGRATIONS[i];
    const filepath = path.join(MIGRATIONS_DIR, migration);

    process.stdout.write(`  ${String(i + 1).padStart(2)}. ${migration.padEnd(50)} ... `);

    try {
      const sql = fs.readFileSync(filepath, 'utf-8');

      // Split SQL into statements and execute each one
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';',
        });

        if (error) throw error;
      }

      console.log('✓');
      successCount++;
    } catch (error: any) {
      console.log('✗');
      console.log(`    Error: ${error.message}`);
      failureCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Successful: ${successCount}/${MIGRATIONS.length}`);
  if (failureCount > 0) {
    console.log(`✗ Failed: ${failureCount}/${MIGRATIONS.length}`);
  }
  console.log('='.repeat(80));

  if (failureCount === 0) {
    console.log('\n✓ All migrations completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run verification queries');
    console.log('  2. Check Supabase Studio for 30+ tables');
    console.log('  3. Test Auth API endpoints');
  }

  process.exit(failureCount > 0 ? 1 : 0);
}

executeMigrations().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
