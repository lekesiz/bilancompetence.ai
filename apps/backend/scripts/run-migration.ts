/**
 * Script to run SQL migrations on Supabase
 * Usage: npx tsx scripts/run-migration.ts <migration-file>
 * Example: npx tsx scripts/run-migration.ts migrations/020_create_ai_tables.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// Get migration file from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Error: Please provide a migration file path');
  console.error('Usage: npx tsx scripts/run-migration.ts <migration-file>');
  console.error('Example: npx tsx scripts/run-migration.ts migrations/020_create_ai_tables.sql');
  process.exit(1);
}

async function runMigration() {
  try {
    // Create Supabase client with service role key (has admin privileges)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Read migration file
    const migrationPath = resolve(process.cwd(), migrationFile);
    console.log(`📖 Reading migration file: ${migrationPath}`);
    
    const sql = readFileSync(migrationPath, 'utf-8');
    
    if (!sql.trim()) {
      console.error('❌ Error: Migration file is empty');
      process.exit(1);
    }

    console.log(`📝 Migration file loaded (${sql.length} characters)`);
    console.log('🚀 Executing migration...\n');

    // Execute the SQL migration
    // Note: Supabase client doesn't have a direct SQL execution method
    // We need to use the REST API or pg client
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql function doesn't exist, we'll use an alternative method
      console.log('⚠️  exec_sql function not found, using alternative method...');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        // Skip comments and empty statements
        if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
          continue;
        }

        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        
        try {
          // Use the PostgreSQL REST API endpoint
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ sql_query: statement + ';' })
          });

          if (!response.ok) {
            console.error(`❌ Statement ${i + 1} failed:`, await response.text());
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err: any) {
          console.error(`❌ Statement ${i + 1} error:`, err.message);
        }
      }

      console.log('\n⚠️  Note: Some statements may have failed. Please check the output above.');
      console.log('💡 Tip: You can also run this migration manually in the Supabase SQL Editor:');
      console.log(`   ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql/new`);
      
    } else {
      console.log('✅ Migration executed successfully!');
      if (data) {
        console.log('📊 Result:', data);
      }
    }

    console.log('\n✨ Migration process completed!');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Run the migration manually in Supabase SQL Editor:');
    console.error(`   1. Go to: ${SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql/new`);
    console.error(`   2. Copy the contents of: ${migrationFile}`);
    console.error(`   3. Paste and execute in the SQL Editor`);
    process.exit(1);
  }
}

// Run the migration
runMigration();

