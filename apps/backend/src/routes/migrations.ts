import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin-only middleware
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET || 'admin_secret_2025';
  
  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }
  
  next();
};

/**
 * POST /api/migrations/run
 * Run SQL migrations programmatically
 * Requires admin authentication
 */
router.post('/run', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { part } = req.body; // 'part_2', 'part_3', 'part_4', or 'all'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const migrations: { [key: string]: string } = {
      part_2: fs.readFileSync(path.join(__dirname, '../../../migration_part_ab'), 'utf-8'),
      part_3: fs.readFileSync(path.join(__dirname, '../../../migration_part_ac'), 'utf-8'),
      part_4: fs.readFileSync(path.join(__dirname, '../../../migration_part_ad'), 'utf-8'),
    };
    
    const results: any[] = [];
    
    if (part === 'all') {
      // Run all migrations sequentially
      for (const [key, sql] of Object.entries(migrations)) {
        console.log(`Running migration: ${key}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
          
          if (error) {
            console.error(`Error in ${key}:`, error);
            results.push({ part: key, status: 'error', error: error.message });
          } else {
            console.log(`${key} completed successfully`);
            results.push({ part: key, status: 'success', data });
          }
        } catch (err: any) {
          console.error(`Exception in ${key}:`, err);
          results.push({ part: key, status: 'error', error: err.message });
        }
      }
    } else if (migrations[part]) {
      // Run specific migration
      const sql = migrations[part];
      console.log(`Running migration: ${part}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.error(`Error in ${part}:`, error);
          return res.status(500).json({ error: error.message, part });
        }
        
        console.log(`${part} completed successfully`);
        results.push({ part, status: 'success', data });
      } catch (err: any) {
        console.error(`Exception in ${part}:`, err);
        return res.status(500).json({ error: err.message, part });
      }
    } else {
      return res.status(400).json({ error: 'Invalid part specified. Use: part_2, part_3, part_4, or all' });
    }
    
    res.json({
      message: 'Migrations executed',
      results,
      success: results.every(r => r.status === 'success')
    });
    
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/migrations/demo-users
 * Create demo users
 * Requires admin authentication
 */
router.post('/demo-users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const demoUsersSql = fs.readFileSync(
      path.join(__dirname, '../../../create_demo_users_correct.sql'),
      'utf-8'
    );
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: demoUsersSql });
    
    if (error) {
      console.error('Error creating demo users:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      message: 'Demo users created successfully',
      users: [
        { email: 'demo@example.com', role: 'USER', password: 'Demo@123456' },
        { email: 'consultant@example.com', role: 'CONSULTANT', password: 'Demo@123456' },
        { email: 'admin@example.com', role: 'ADMIN', password: 'Demo@123456' }
      ],
      data
    });
    
  } catch (error: any) {
    console.error('Demo users error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/migrations/status
 * Check migration status
 */
router.get('/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    // Check questions count
    const { count: questionsCount, error: questionsError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    // Check users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Check competences count
    const { count: competencesCount, error: competencesError } = await supabase
      .from('competences')
      .select('*', { count: 'exact', head: true });
    
    res.json({
      tables: tables?.map(t => t.table_name) || [],
      counts: {
        questions: questionsCount || 0,
        users: usersCount || 0,
        competences: competencesCount || 0
      },
      errors: {
        tables: tablesError?.message,
        questions: questionsError?.message,
        users: usersError?.message,
        competences: competencesError?.message
      },
      migrationStatus: {
        part_1: true, // Already executed
        part_2: (questionsCount || 0) > 0,
        part_3: (competencesCount || 0) > 0,
        part_4: true // Triggers/functions (hard to check)
      }
    });
    
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

