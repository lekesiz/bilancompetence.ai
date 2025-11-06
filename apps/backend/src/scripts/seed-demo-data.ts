/**
 * Seed Demo Data Script
 * Creates demo accounts and sample data for testing
 */

import { pool } from '../config/neon.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Demo account credentials
const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@demo.bilancompetence.ai',
    password: 'Admin@Demo2025',
    role: 'organization_admin',
    full_name: 'Marie Dupont',
  },
  consultant: {
    email: 'consultant@demo.bilancompetence.ai',
    password: 'Consultant@Demo2025',
    role: 'consultant',
    full_name: 'Pierre Martin',
  },
  beneficiary: {
    email: 'client@demo.bilancompetence.ai',
    password: 'Client@Demo2025',
    role: 'beneficiary',
    full_name: 'Sophie Bernard',
  },
};

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Create demo organization
    console.log('📊 Creating demo organization...');
    
    // First, try to find existing organization
    let orgResult = await client.query(
      `SELECT id FROM organizations WHERE name = 'Demo Organization' LIMIT 1`
    );
    
    let organizationId: string;
    
    if (orgResult.rows.length > 0) {
      organizationId = orgResult.rows[0].id;
      console.log(`✅ Using existing organization: ${organizationId}\n`);
    } else {
      orgResult = await client.query(`
        INSERT INTO organizations (name, subscription_plan, created_at, updated_at)
        VALUES ('Demo Organization', 'PREMIUM', NOW(), NOW())
        RETURNING id
      `);
      organizationId = orgResult.rows[0].id;
      console.log(`✅ Organization created: ${organizationId}\n`);
    }

    // 2. Create demo users
    console.log('👥 Creating demo users...');
    const userIds: Record<string, string> = {};

    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Check if user exists
      let userResult = await client.query(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        [account.email]
      );

      if (userResult.rows.length > 0) {
        // Update existing user
        userResult = await client.query(
          `
          UPDATE users 
          SET 
            password_hash = $1,
            role = $2,
            full_name = $3,
            organization_id = $4,
            email_verified = true,
            updated_at = NOW()
          WHERE email = $5
          RETURNING id
        `,
          [
            hashedPassword,
            account.role,
            account.full_name,
            organizationId,
            account.email,
          ]
        );
        console.log(`✅ Updated ${account.role}: ${account.email}`);
      } else {
        // Create new user
        userResult = await client.query(
          `
          INSERT INTO users (
            email, 
            password_hash, 
            role, 
            full_name, 
            organization_id,
            email_verified,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
          RETURNING id
        `,
          [
            account.email,
            hashedPassword,
            account.role,
            account.full_name,
            organizationId,
          ]
        );
        console.log(`✅ Created ${account.role}: ${account.email}`);
      }

      userIds[key] = userResult.rows[0].id;
    }
    console.log('');

    // 3. Create sample assessments
    console.log('📝 Creating sample assessments...');
    
    // Delete existing assessments for demo users to avoid duplicates
    await client.query(
      `DELETE FROM assessments WHERE beneficiary_id = $1 OR consultant_id = $2`,
      [userIds.beneficiary, userIds.consultant]
    );
    
    const assessmentResult = await client.query(
      `
      INSERT INTO assessments (
        beneficiary_id,
        consultant_id,
        organization_id,
        title,
        description,
        status,
        assessment_type,
        created_at,
        updated_at
      )
      VALUES 
        ($1, $2, $3, 'Bilan de Compétences Complet', 
         'Évaluation complète des compétences professionnelles et personnelles',
         'in_progress', 'full', NOW(), NOW()),
        ($1, $2, $3, 'Évaluation MBTI',
         'Test de personnalité Myers-Briggs Type Indicator',
         'completed', 'mbti', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
        ($1, $2, $3, 'Évaluation RIASEC',
         'Test d''orientation professionnelle RIASEC',
         'completed', 'riasec', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),
        ($1, $2, $3, 'Analyse de Compétences Techniques',
         'Évaluation des compétences techniques et professionnelles',
         'in_progress', 'skills', NOW() - INTERVAL '3 days', NOW()),
        ($1, $2, $3, 'Bilan d''Orientation',
         'Accompagnement pour définir un projet professionnel',
         'scheduled', 'orientation', NOW() + INTERVAL '2 days', NOW())
      RETURNING id
    `,
      [userIds.beneficiary, userIds.consultant, organizationId]
    );
    console.log(`✅ Created ${assessmentResult.rows.length} sample assessments\n`);

    // 4. Create sample competencies will be created with bilans later
    // (Competencies table uses bilan_id, not assessment_id)

    // 5. Skip Qualiopi indicators creation
    // (Table structure is different - requires separate indicator management)
    console.log('⚠️  Skipping Qualiopi indicators (requires separate setup)\n');

    // 6. Skip satisfaction surveys creation
    // (Table structure needs to be verified)
    console.log('⚠️  Skipping satisfaction surveys (requires table structure verification)\n');

    // 7. Create sample bilans and sessions
    console.log('📅 Creating sample bilans and sessions...');
    
    // First, check if bilans table exists and create a bilan
    const bilansTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bilans'
      );
    `);

    if (bilansTableCheck.rows[0].exists) {
      // Delete existing bilans for demo users to avoid duplicates
      await client.query(
        `DELETE FROM bilans WHERE beneficiary_id = $1 OR consultant_id = $2`,
        [userIds.beneficiary, userIds.consultant]
      );

      // Create a bilan
      const bilanResult = await client.query(
        `
        INSERT INTO bilans (
          beneficiary_id,
          consultant_id,
          organization_id,
          status,
          start_date,
          expected_end_date,
          duration_hours,
          completion_percentage,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, 'IN_PROGRESS', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 24, 45, NOW(), NOW())
        RETURNING id
      `,
        [userIds.beneficiary, userIds.consultant, organizationId]
      );

      const bilanId = bilanResult.rows[0].id;

      // Create competencies for this bilan
      await client.query(
        `
        INSERT INTO competencies (
          bilan_id,
          skill_name,
          rome_code,
          self_assessment_level,
          consultant_assessment_level,
          frequency_of_use,
          interest_level,
          context,
          created_at,
          updated_at
        )
        VALUES 
          ($1, 'Communication orale et écrite', 'M1503', 'advanced', 'advanced', 'daily', 5,
           'Excellentes capacités de communication dans un contexte professionnel', NOW(), NOW()),
          ($1, 'Leadership et management d''équipe', 'M1302', 'intermediate', 'intermediate', 'weekly', 4,
           'Capacité à diriger des équipes de taille moyenne', NOW(), NOW()),
          ($1, 'Gestion de projet Agile', 'M1806', 'advanced', 'advanced', 'daily', 5,
           'Expérience en méthodologie Agile et Scrum', NOW(), NOW()),
          ($1, 'Analyse de données', 'M1805', 'intermediate', 'intermediate', 'weekly', 4,
           'Maîtrise d''Excel et bases de SQL', NOW(), NOW()),
          ($1, 'Résolution de problèmes', 'M1503', 'advanced', 'advanced', 'daily', 5,
           'Approche analytique et créative', NOW(), NOW())
      `,
        [bilanId]
      );

      // Create sessions for this bilan
      await client.query(
        `
        INSERT INTO sessions (
          bilan_id,
          consultant_id,
          beneficiary_id,
          session_type,
          scheduled_at,
          duration_minutes,
          attendance,
          notes,
          created_at,
          updated_at
        )
        VALUES 
          ($1, $2, $3, 'initial',
           NOW() - INTERVAL '20 days', 60, 'present', 'Premier entretien pour définir les objectifs du bilan', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
          ($1, $2, $3, 'investigation',
           NOW() - INTERVAL '15 days', 90, 'present', 'Exploration des compétences et expériences professionnelles', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days'),
          ($1, $2, $3, 'investigation',
           NOW() - INTERVAL '10 days', 90, 'present', 'Tests psychométriques MBTI et RIASEC', NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days'),
          ($1, $2, $3, 'conclusion',
           NOW() + INTERVAL '3 days', 90, NULL, 'Synthèse et élaboration du projet professionnel', NOW(), NOW()),
          ($1, $2, $3, 'conclusion',
           NOW() + INTERVAL '10 days', 90, NULL, 'Présentation du document de synthèse et plan d''action', NOW(), NOW())
        RETURNING id
      `,
        [bilanId, userIds.consultant, userIds.beneficiary]
      );
      console.log('✅ Created sample bilan, competencies, and sessions\n');
    } else {
      console.log('⚠️  Bilans table does not exist, skipping sessions creation\n');
    }

    // 8. Create sample notifications
    console.log('🔔 Creating sample notifications...');
    
    // Delete existing notifications to avoid duplicates
    await client.query(
      `DELETE FROM notifications WHERE user_id IN ($1, $2, $3)`,
      [userIds.admin, userIds.consultant, userIds.beneficiary]
    );

    await client.query(
      `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        read,
        created_at,
        updated_at
      )
      VALUES 
        ($1, 'info', 'Bienvenue sur BilanCompetence.AI',
         'Votre compte administrateur a été créé avec succès', false, NOW(), NOW()),
        ($2, 'info', 'Nouveau bénéficiaire assigné',
         'Sophie Bernard a été assignée à votre portefeuille', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        ($3, 'success', 'Évaluation MBTI complétée',
         'Vos résultats MBTI sont maintenant disponibles', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        ($3, 'info', 'Prochaine session programmée',
         'Votre prochaine session est prévue dans 3 jours', false, NOW(), NOW())
    `,
      [userIds.admin, userIds.consultant, userIds.beneficiary]
    );
    console.log('✅ Created sample notifications\n');

    // Commit transaction
    await client.query('COMMIT');

    // 9. Print demo credentials
    console.log('🎉 Demo data seeding completed!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 DEMO ACCOUNT CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('👨‍💼 ADMIN ACCOUNT:');
    console.log(`   Email: ${DEMO_ACCOUNTS.admin.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.admin.password}`);
    console.log(`   Role: Organization Administrator\n`);

    console.log('👨‍🏫 CONSULTANT ACCOUNT:');
    console.log(`   Email: ${DEMO_ACCOUNTS.consultant.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.consultant.password}`);
    console.log(`   Role: Consultant\n`);

    console.log('👤 CLIENT ACCOUNT:');
    console.log(`   Email: ${DEMO_ACCOUNTS.beneficiary.email}`);
    console.log(`   Password: ${DEMO_ACCOUNTS.beneficiary.password}`);
    console.log(`   Role: Beneficiary (Client)\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DEMO DATA SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Organization: 1`);
    console.log(`✅ Users: 3 (admin, consultant, beneficiary)`);
    console.log(`✅ Assessments: ${assessmentResult.rows.length}`);
    console.log(`⚠️  Qualiopi Indicators: Skipped`);
    console.log(`⚠️  Satisfaction Surveys: Skipped`);
    console.log(`✅ Bilans: 1`);
    console.log(`✅ Competencies: 5`);
    console.log(`✅ Sessions: 5`);
    console.log(`✅ Notifications: 4`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All demo accounts are ready to use!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding
seedDemoData()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
