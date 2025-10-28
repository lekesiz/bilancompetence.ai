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
    first_name: 'Marie',
    last_name: 'Dupont',
  },
  consultant: {
    email: 'consultant@demo.bilancompetence.ai',
    password: 'Consultant@Demo2025',
    role: 'consultant',
    first_name: 'Pierre',
    last_name: 'Martin',
  },
  beneficiary: {
    email: 'client@demo.bilancompetence.ai',
    password: 'Client@Demo2025',
    role: 'beneficiary',
    first_name: 'Sophie',
    last_name: 'Bernard',
  },
};

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  const client = await pool.connect();

  try {
    // 1. Create demo organization
    console.log('📊 Creating demo organization...');
    const orgResult = await client.query(`
      INSERT INTO organizations (name, subscription_tier, created_at, updated_at)
      VALUES ('Demo Organization', 'premium', NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `);
    const organizationId = orgResult.rows[0].id;
    console.log(`✅ Organization created: ${organizationId}\n`);

    // 2. Create demo users
    console.log('👥 Creating demo users...');
    const userIds: Record<string, string> = {};

    for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
      const hashedPassword = await bcrypt.hash(account.password, 10);

      const userResult = await client.query(
        `
        INSERT INTO users (
          email, 
          password_hash, 
          role, 
          first_name, 
          last_name, 
          organization_id,
          email_verified,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE 
        SET 
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
        RETURNING id
      `,
        [
          account.email,
          hashedPassword,
          account.role,
          account.first_name,
          account.last_name,
          organizationId,
        ]
      );

      userIds[key] = userResult.rows[0].id;
      console.log(`✅ ${account.role}: ${account.email}`);
    }
    console.log('');

    // 3. Create sample assessments
    console.log('📝 Creating sample assessments...');
    const assessmentResult = await client.query(
      `
      INSERT INTO assessments (
        user_id,
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
         'completed', 'mbti', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING
      RETURNING id
    `,
      [userIds.beneficiary, userIds.consultant, organizationId]
    );
    console.log(`✅ Created ${assessmentResult.rows.length} sample assessments\n`);

    // 4. Create sample competencies
    if (assessmentResult.rows.length > 0) {
      console.log('🎯 Creating sample competencies...');
      const assessmentId = assessmentResult.rows[0].id;

      await client.query(
        `
        INSERT INTO assessment_competencies (
          assessment_id,
          competency_name,
          category,
          level,
          evidence,
          created_at,
          updated_at
        )
        VALUES 
          ($1, 'Communication', 'soft_skills', 'advanced',
           'Excellentes capacités de communication écrite et orale', NOW(), NOW()),
          ($1, 'Leadership', 'soft_skills', 'intermediate',
           'Capacité à diriger des équipes de taille moyenne', NOW(), NOW()),
          ($1, 'Gestion de Projet', 'technical', 'advanced',
           'Expérience en méthodologie Agile et Scrum', NOW(), NOW()),
          ($1, 'Analyse de Données', 'technical', 'intermediate',
           'Maîtrise d''Excel et bases de SQL', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
        [assessmentId]
      );
      console.log('✅ Created sample competencies\n');
    }

    // 5. Create Qualiopi indicators
    console.log('📋 Creating Qualiopi indicators...');
    await client.query(
      `
      INSERT INTO qualiopi_indicators (
        organization_id,
        indicator_number,
        title,
        description,
        category,
        status,
        compliance_level,
        evidence_count,
        last_audit_date,
        created_at,
        updated_at
      )
      VALUES 
        ($1, '1.1', 'Information du public sur les prestations',
         'L''organisme diffuse une information accessible au public',
         'information', 'compliant', 95, 5, NOW() - INTERVAL '30 days', NOW(), NOW()),
        ($1, '2.1', 'Analyse du besoin du bénéficiaire',
         'L''organisme analyse le besoin du bénéficiaire',
         'training_design', 'compliant', 88, 3, NOW() - INTERVAL '30 days', NOW(), NOW()),
        ($1, '3.1', 'Adéquation des moyens pédagogiques',
         'L''organisme s''assure de l''adéquation des moyens',
         'training_delivery', 'in_progress', 75, 2, NOW() - INTERVAL '30 days', NOW(), NOW())
      ON CONFLICT (organization_id, indicator_number) 
      DO UPDATE SET 
        compliance_level = EXCLUDED.compliance_level,
        evidence_count = EXCLUDED.evidence_count,
        updated_at = NOW()
    `,
      [organizationId]
    );
    console.log('✅ Created Qualiopi indicators\n');

    // 6. Create satisfaction surveys
    console.log('📊 Creating satisfaction surveys...');
    const surveyAssessmentId =
      assessmentResult.rows.length > 1
        ? assessmentResult.rows[1].id
        : assessmentResult.rows[0]?.id;

    if (surveyAssessmentId) {
      await client.query(
        `
        INSERT INTO satisfaction_surveys (
          organization_id,
          assessment_id,
          user_id,
          consultant_id,
          overall_satisfaction,
          would_recommend,
          comments,
          submitted_at,
          created_at,
          updated_at
        )
        VALUES 
          ($1, $2, $3, $4, 5, true,
           'Excellent accompagnement, très professionnel et à l''écoute',
           NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING
      `,
        [organizationId, surveyAssessmentId, userIds.beneficiary, userIds.consultant]
      );
      console.log('✅ Created satisfaction surveys\n');
    }

    // 7. Print demo credentials
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
    console.log('✅ All demo accounts are ready to use!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
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

