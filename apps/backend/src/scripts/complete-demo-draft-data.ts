/**
 * Complete Demo Draft Data Script
 * 
 * This script fills the assessment_drafts table with realistic JSONB data
 * for the demo assessment to make dashboards display actual information.
 */

import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';

interface DemoData {
  step1: any;
  step2: any;
  step3: any;
  step4: any;
  step5: any;
}

const DEMO_DRAFT_DATA: DemoData = {
  step1: {
    personal_info: {
      full_name: 'Marie Dupont',
      email: 'client@demo.bilancompetence.ai',
      phone: '+33 6 12 34 56 78',
      birth_date: '1985-05-15',
      address: '123 Rue de la République, 75001 Paris',
      nationality: 'Française',
      marital_status: 'Mariée',
      children: 2,
    },
    career_goals: {
      short_term: 'Évoluer vers un poste de management dans les 12 prochains mois',
      medium_term: 'Devenir directrice de projet senior dans les 3 ans',
      long_term: 'Créer ma propre entreprise de conseil en gestion de projet',
      motivations: [
        'Autonomie et prise de décision',
        'Impact positif sur les équipes',
        'Développement personnel continu',
        'Équilibre vie professionnelle/personnelle',
      ],
      preferred_sectors: ['Technologie', 'Conseil', 'Innovation'],
      geographic_mobility: 'Île-de-France uniquement',
      salary_expectations: '65000-75000 EUR/an',
    },
  },
  step2: {
    skills: [
      {
        name: 'Gestion de projet Agile',
        level: 4,
        years_experience: 8,
        certifications: ['Scrum Master', 'PMP en cours'],
        last_used: '2024',
      },
      {
        name: 'Communication interpersonnelle',
        level: 4,
        years_experience: 10,
        certifications: [],
        last_used: '2024',
      },
      {
        name: 'Leadership d\'équipe',
        level: 3,
        years_experience: 5,
        certifications: [],
        last_used: '2024',
      },
      {
        name: 'Analyse de données',
        level: 3,
        years_experience: 6,
        certifications: ['Google Analytics'],
        last_used: '2024',
      },
      {
        name: 'Gestion budgétaire',
        level: 3,
        years_experience: 5,
        certifications: [],
        last_used: '2024',
      },
      {
        name: 'Anglais professionnel',
        level: 4,
        years_experience: 15,
        certifications: ['TOEIC 920'],
        last_used: '2024',
      },
    ],
    experiences: [
      {
        title: 'Chef de Projet Senior',
        company: 'TechCorp France',
        location: 'Paris',
        start_date: '2018-03',
        end_date: '2024-10',
        is_current: true,
        duration_months: 79,
        description: 'Gestion de projets de transformation digitale pour des clients grands comptes',
        achievements: [
          'Gestion simultanée de 15 projets avec un budget total de 5M€',
          'Management d\'une équipe de 10 personnes (chefs de projet junior, développeurs, designers)',
          'Amélioration de 30% de la satisfaction client sur 2 ans',
          'Mise en place de méthodologies Agile dans l\'entreprise',
        ],
        skills_used: ['Agile', 'Scrum', 'Management', 'Communication', 'Budget'],
      },
      {
        title: 'Chef de Projet',
        company: 'Digital Solutions',
        location: 'Paris',
        start_date: '2015-01',
        end_date: '2018-02',
        is_current: false,
        duration_months: 38,
        description: 'Gestion de projets web et mobile pour PME',
        achievements: [
          'Livraison de 25 projets dans les délais et budgets',
          'Formation de 5 chefs de projet junior',
          'Création de templates de gestion de projet réutilisables',
        ],
        skills_used: ['Gestion de projet', 'Web', 'Mobile', 'Formation'],
      },
      {
        title: 'Coordinatrice de Projet',
        company: 'StartupLab',
        location: 'Paris',
        start_date: '2012-06',
        end_date: '2014-12',
        is_current: false,
        duration_months: 31,
        description: 'Support aux projets innovants dans un incubateur',
        achievements: [
          'Accompagnement de 20 startups dans leur développement',
          'Organisation d\'événements networking (200+ participants)',
          'Mise en relation avec investisseurs (15 levées de fonds réussies)',
        ],
        skills_used: ['Coordination', 'Événementiel', 'Networking'],
      },
    ],
    education: [
      {
        degree: 'Master 2 Management de Projet',
        institution: 'IAE Paris',
        location: 'Paris',
        start_date: '2010-09',
        end_date: '2012-06',
        grade: 'Mention Bien',
        specialization: 'Gestion de projet digital',
      },
      {
        degree: 'Licence Économie et Gestion',
        institution: 'Université Paris Dauphine',
        location: 'Paris',
        start_date: '2007-09',
        end_date: '2010-06',
        grade: 'Mention Assez Bien',
        specialization: 'Management',
      },
    ],
  },
  step3: {
    competencies: [
      {
        skill_name: 'Communication',
        category: 'soft',
        self_assessment_level: 4,
        self_interest_level: 9,
        context: 'Animation de réunions clients, présentations executives, communication d\'équipe quotidienne',
        examples: [
          'Présentation mensuelle aux comités de direction',
          'Animation d\'ateliers de co-création avec 20+ participants',
          'Gestion de conflits au sein des équipes projet',
        ],
      },
      {
        skill_name: 'Leadership',
        category: 'soft',
        self_assessment_level: 3,
        self_interest_level: 8,
        context: 'Management d\'équipe projet, mentorat de juniors, prise de décisions stratégiques',
        examples: [
          'Management de 10 personnes en direct',
          'Mentorat de 5 chefs de projet junior',
          'Prise de décisions critiques sous pression',
        ],
      },
      {
        skill_name: 'Gestion de Projet',
        category: 'technical',
        self_assessment_level: 4,
        self_interest_level: 10,
        context: 'Méthodologies Agile/Scrum, planification, suivi budgétaire, gestion des risques',
        examples: [
          '15 projets gérés simultanément',
          'Budget total géré: 5M€',
          'Taux de réussite: 95% dans les délais',
        ],
      },
      {
        skill_name: 'Analyse de Données',
        category: 'technical',
        self_assessment_level: 3,
        self_interest_level: 7,
        context: 'Analyse de KPIs projet, reporting, tableaux de bord, data-driven decisions',
        examples: [
          'Création de dashboards de suivi projet',
          'Analyse de performance d\'équipe',
          'Reporting mensuel aux stakeholders',
        ],
      },
      {
        skill_name: 'Résolution de Problèmes',
        category: 'soft',
        self_assessment_level: 4,
        self_interest_level: 9,
        context: 'Gestion de crises projet, déblocage de situations complexes, innovation',
        examples: [
          'Résolution de blocages techniques critiques',
          'Négociation avec clients mécontents',
          'Réorganisation d\'équipes en difficulté',
        ],
      },
      {
        skill_name: 'Anglais Professionnel',
        category: 'language',
        self_assessment_level: 4,
        self_interest_level: 8,
        context: 'Réunions internationales, documentation technique, emails professionnels',
        examples: [
          'Réunions hebdomadaires avec équipes US',
          'Rédaction de specs en anglais',
          'Présentation à des clients internationaux',
        ],
      },
    ],
    strengths: [
      'Organisation et rigueur',
      'Capacité d\'adaptation',
      'Esprit d\'équipe',
      'Orientation résultats',
    ],
    areas_for_improvement: [
      'Délégation (tendance à tout vouloir contrôler)',
      'Patience face aux processus lents',
      'Prise de recul sur les échecs',
    ],
  },
  step4: {
    personality: {
      mbti_type: 'ENTJ',
      mbti_description: 'Commandant - Leader naturel, stratégique, orienté objectifs',
      riasec_code: 'ESA',
      riasec_description: 'Entreprenant, Social, Artistique',
      strengths: [
        'Stratégique et visionnaire',
        'Organisé et méthodique',
        'Communicatif et persuasif',
        'Orienté résultats',
        'Capacité à motiver les équipes',
      ],
      weaknesses: [
        'Impatience face à l\'inefficacité',
        'Difficulté à déléguer',
        'Tendance au perfectionnisme',
        'Peut être perçu comme trop direct',
      ],
      work_values: [
        'Autonomie et responsabilité',
        'Impact et résultats mesurables',
        'Innovation et créativité',
        'Développement continu',
        'Équilibre vie pro/perso',
      ],
      preferred_work_environment: [
        'Équipe dynamique et motivée',
        'Culture d\'innovation',
        'Flexibilité horaire',
        'Reconnaissance du mérite',
        'Opportunités d\'évolution',
      ],
      stress_factors: [
        'Manque d\'autonomie',
        'Processus bureaucratiques',
        'Équipes non motivées',
        'Objectifs flous',
      ],
      coping_strategies: [
        'Sport régulier (running 3x/semaine)',
        'Méditation le matin',
        'Organisation rigoureuse',
        'Discussions avec mentors',
      ],
    },
    interests: [
      'Management et leadership',
      'Innovation et nouvelles technologies',
      'Entrepreneuriat',
      'Formation et développement',
      'Lecture (business, développement personnel)',
    ],
  },
  step5: {
    action_plan: {
      immediate_actions: [
        {
          action: 'Formation certifiante PMP (Project Management Professional)',
          timeline: '3 mois',
          priority: 'high',
          resources_needed: ['Budget formation: 2500€', 'Temps étude: 10h/semaine'],
          expected_outcome: 'Certification reconnue internationalement',
        },
        {
          action: 'Mise à jour CV et profil LinkedIn',
          timeline: '2 semaines',
          priority: 'high',
          resources_needed: ['Coach CV', 'Photos professionnelles'],
          expected_outcome: 'Profil attractif pour recruteurs',
        },
        {
          action: 'Networking ciblé (5 événements professionnels)',
          timeline: '3 mois',
          priority: 'medium',
          resources_needed: ['Temps: 1 événement/mois', 'Cartes de visite'],
          expected_outcome: '20+ nouveaux contacts qualifiés',
        },
      ],
      medium_term_actions: [
        {
          action: 'Recherche active poste Directeur de Projet',
          timeline: '6-12 mois',
          priority: 'high',
          resources_needed: ['Temps: 5h/semaine', 'Abonnement LinkedIn Premium'],
          expected_outcome: 'Poste de direction dans entreprise innovante',
        },
        {
          action: 'Développement réseau professionnel',
          timeline: '6-12 mois',
          priority: 'medium',
          resources_needed: ['Participation à conférences', 'Adhésion PMI France'],
          expected_outcome: 'Réseau solide de 100+ contacts',
        },
        {
          action: 'Formation leadership et management avancé',
          timeline: '6 mois',
          priority: 'medium',
          resources_needed: ['Budget: 3000€', 'Temps: 5 jours'],
          expected_outcome: 'Compétences management renforcées',
        },
      ],
      long_term_actions: [
        {
          action: 'Création entreprise de conseil en gestion de projet',
          timeline: '3-5 ans',
          priority: 'high',
          resources_needed: [
            'Capital initial: 50000€',
            'Formation entrepreneuriat',
            'Réseau clients potentiels',
            'Statut juridique',
          ],
          expected_outcome: 'Entreprise rentable avec 5+ clients récurrents',
        },
        {
          action: 'Formation en entrepreneuriat et business development',
          timeline: '2-3 ans',
          priority: 'high',
          resources_needed: ['MBA Executive ou équivalent', 'Budget: 15000€'],
          expected_outcome: 'Compétences business complètes',
        },
        {
          action: 'Développement expertise sectorielle (Tech/Innovation)',
          timeline: '2-5 ans',
          priority: 'medium',
          resources_needed: ['Veille continue', 'Participation à écosystème startup'],
          expected_outcome: 'Expert reconnu dans le secteur',
        },
      ],
      milestones: [
        {
          milestone: 'Certification PMP obtenue',
          target_date: '2025-03-31',
          success_criteria: 'Score > 80%',
        },
        {
          milestone: 'Nouveau poste de direction',
          target_date: '2025-12-31',
          success_criteria: 'Salaire 70K€+, équipe 10+ personnes',
        },
        {
          milestone: 'Réseau professionnel établi',
          target_date: '2026-06-30',
          success_criteria: '100+ contacts LinkedIn qualifiés',
        },
        {
          milestone: 'Entreprise créée et opérationnelle',
          target_date: '2028-12-31',
          success_criteria: '5+ clients, CA 200K€+',
        },
      ],
      budget_estimate: {
        immediate: 5000,
        medium_term: 10000,
        long_term: 65000,
        total: 80000,
        funding_sources: [
          'Épargne personnelle: 30000€',
          'CPF (Compte Personnel de Formation): 5000€',
          'Prêt bancaire: 30000€',
          'Revenus activité: 15000€',
        ],
      },
      success_indicators: [
        'Satisfaction professionnelle (échelle 1-10): objectif 9+',
        'Équilibre vie pro/perso: objectif 8+',
        'Revenu annuel: objectif 70K€ puis 100K€',
        'Taille équipe managée: objectif 15+ personnes',
        'Nombre de projets réussis: objectif 20+/an',
      ],
    },
    next_steps: [
      'Inscription formation PMP (semaine prochaine)',
      'Rendez-vous coach carrière (dans 2 semaines)',
      'Mise à jour profils professionnels (ce mois)',
      'Premier événement networking (mois prochain)',
    ],
  },
};

async function completeDemoDraftData() {
  try {
    logger.info('🚀 Starting demo draft data completion...');

    // Find the demo assessment
    const assessmentResult = await query(
      null,
      `SELECT id, beneficiary_id FROM assessments 
       WHERE title = 'Bilan de Compétences Complet' 
       AND deleted_at IS NULL
       LIMIT 1`
    );

    if (assessmentResult.length === 0) {
      logger.warn('⚠️  No demo assessment found with title "Bilan de Compétences Complet"');
      logger.info('Creating a new demo assessment...');

      // Get the demo client user
      const userResult = await query(
        null,
        `SELECT id FROM users WHERE email = 'client@demo.bilancompetence.ai' LIMIT 1`
      );

      if (userResult.length === 0) {
        logger.error('❌ Demo client user not found. Please run seed-demo-data.ts first.');
        return;
      }

      const userId = userResult[0].id;

      // Create the assessment
      const newAssessment = await query(
        null,
        `INSERT INTO assessments (
          beneficiary_id, title, description, assessment_type, status, 
          current_step, progress_percentage, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id`,
        [
          userId,
          'Bilan de Compétences Complet',
          'Assessment demo complet avec toutes les étapes remplies',
          'comprehensive',
          'COMPLETED',
          5,
          100,
        ]
      );

      const assessmentId = newAssessment[0].id;
      logger.info(`✅ Created new demo assessment: ${assessmentId}`);

      // Create draft
      await query(
        null,
        `INSERT INTO assessment_drafts (
          assessment_id, current_step_number, draft_data, auto_save_enabled, 
          last_saved_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
        [assessmentId, 5, JSON.stringify(DEMO_DRAFT_DATA), true]
      );

      logger.info('✅ Created draft with complete data');
    } else {
      const assessmentId = assessmentResult[0].id;
      logger.info(`📝 Found demo assessment: ${assessmentId}`);

      // Check if draft exists
      const draftResult = await query(
        null,
        `SELECT id FROM assessment_drafts WHERE assessment_id = $1`,
        [assessmentId]
      );

      if (draftResult.length === 0) {
        // Create draft
        await query(
          null,
          `INSERT INTO assessment_drafts (
            assessment_id, current_step_number, draft_data, auto_save_enabled,
            last_saved_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
          [assessmentId, 5, JSON.stringify(DEMO_DRAFT_DATA), true]
        );

        logger.info('✅ Created new draft with complete data');
      } else {
        // Update existing draft
        await query(
          null,
          `UPDATE assessment_drafts 
           SET draft_data = $1,
               current_step_number = 5,
               last_saved_at = NOW(),
               updated_at = NOW()
           WHERE assessment_id = $2`,
          [JSON.stringify(DEMO_DRAFT_DATA), assessmentId]
        );

        logger.info('✅ Updated existing draft with complete data');
      }

      // Update assessment status
      await query(
        null,
        `UPDATE assessments 
         SET status = 'COMPLETED',
             current_step = 5,
             progress_percentage = 100,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [assessmentId]
      );

      logger.info('✅ Updated assessment status to COMPLETED');

      // Extract and save competencies
      const competencies = DEMO_DRAFT_DATA.step3.competencies;

      // Delete existing competencies
      await query(
        null,
        `DELETE FROM assessment_competencies WHERE assessment_id = $1`,
        [assessmentId]
      );

      // Insert new competencies
      for (const comp of competencies) {
        await query(
          null,
          `INSERT INTO assessment_competencies (
            assessment_id, skill_name, category, 
            self_assessment_level, self_interest_level, context,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [
            assessmentId,
            comp.skill_name,
            comp.category,
            comp.self_assessment_level,
            comp.self_interest_level,
            comp.context,
          ]
        );
      }

      logger.info(`✅ Extracted ${competencies.length} competencies to structured table`);
    }

    logger.info('🎉 Demo draft data completion successful!');
    logger.info('');
    logger.info('📊 Summary:');
    logger.info('  - Step 1: Personal info + Career goals ✅');
    logger.info('  - Step 2: 6 skills + 3 experiences + 2 education ✅');
    logger.info('  - Step 3: 6 competencies extracted ✅');
    logger.info('  - Step 4: Personality assessment (MBTI, RIASEC) ✅');
    logger.info('  - Step 5: Complete action plan with milestones ✅');
    logger.info('');
    logger.info('✅ Assessment is now 100% complete and ready for testing!');
  } catch (error) {
    logger.error('❌ Error completing demo draft data:', error);
    throw error;
  }
}

// Run the script
completeDemoDraftData()
  .then(() => {
    logger.info('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Script failed:', error);
    process.exit(1);
  });

