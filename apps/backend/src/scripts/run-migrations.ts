/**
 * Database Migration Runner
 * Runs all SQL migrations in the migrations/ directory
 * Usage: ts-node scripts/run-migrations.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, '../../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Run in alphabetical order (001, 002, 003...)

  console.log(`📁 Found ${migrationFiles.length} migration files:\n`);
  migrationFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`⏳ Running migration: ${file}...`);

    try {
      await pool.query(sql);
      console.log(`✅ Migration ${file} completed successfully\n`);
    } catch (error: any) {
      console.error(`❌ Migration ${file} failed:`);
      console.error(`   Error: ${error.message}\n`);
      
      // Continue with other migrations even if one fails
      // (some migrations might be idempotent with IF NOT EXISTS)
    }
  }

  console.log('🎉 All migrations processed!\n');
  console.log('📊 Checking database tables...');

  // Verify tables
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log(`\n✅ Found ${result.rows.length} tables in database:`);
  result.rows.forEach((row: any) => console.log(`   - ${row.table_name}`));

  await pool.end();
  console.log('\n✨ Migration process completed!');
}

runMigrations().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

