/**
 * Test Fixtures - Demo Users
 * 
 * Ces credentials correspondent aux utilisateurs créés par le script seed-demo-data.ts
 */

export const testUsers = {
  admin: {
    email: 'admin@demo.bilancompetence.ai',
    password: 'Admin@Demo2025',
    role: 'organization_admin',
    fullName: 'Marie Dupont',
  },
  consultant: {
    email: 'consultant@demo.bilancompetence.ai',
    password: 'Consultant@Demo2025',
    role: 'consultant',
    fullName: 'Pierre Martin',
  },
  client: {
    email: 'client@demo.bilancompetence.ai',
    password: 'Client@Demo2025',
    role: 'beneficiary',
    fullName: 'Sophie Bernard',
  },
};

/**
 * Legacy credentials (deprecated - à ne plus utiliser)
 */
export const legacyTestUsers = {
  demo: {
    email: 'demo@example.com',
    password: 'Demo@123456',
  },
};

/**
 * Test data pour les assessments
 */
export const testAssessments = {
  full: {
    title: 'Bilan de Compétences Complet',
    type: 'full',
    description: 'Évaluation complète des compétences professionnelles et personnelles',
  },
  mbti: {
    title: 'Évaluation MBTI',
    type: 'mbti',
    description: 'Test de personnalité Myers-Briggs Type Indicator',
  },
  riasec: {
    title: 'Évaluation RIASEC',
    type: 'riasec',
    description: "Test d'orientation professionnelle RIASEC",
  },
};

/**
 * Test data pour les compétences
 */
export const testCompetencies = [
  {
    name: 'Communication orale et écrite',
    romeCode: 'M1503',
    level: 'advanced',
    frequency: 'daily',
    interest: 5,
  },
  {
    name: "Leadership et management d'équipe",
    romeCode: 'M1302',
    level: 'intermediate',
    frequency: 'weekly',
    interest: 4,
  },
  {
    name: 'Gestion de projet Agile',
    romeCode: 'M1806',
    level: 'advanced',
    frequency: 'daily',
    interest: 5,
  },
];

/**
 * Test data pour les sessions
 */
export const testSessions = {
  initial: {
    type: 'initial',
    duration: 60,
    notes: "Premier entretien pour définir les objectifs du bilan",
  },
  investigation: {
    type: 'investigation',
    duration: 90,
    notes: "Exploration des compétences et expériences professionnelles",
  },
  conclusion: {
    type: 'conclusion',
    duration: 90,
    notes: "Synthèse et élaboration du projet professionnel",
  },
};
