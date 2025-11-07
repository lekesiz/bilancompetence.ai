/**
 * Psychometric Scoring Service
 * Handles scoring logic for MBTI and RIASEC personality/vocational tests
 */

import { pool } from '../config/neon.js';
import { supabase } from '../config/supabase.js';

// ============================================================================
// MBTI SCORING
// ============================================================================

interface MBTIResponse {
  question_id: string;
  value: number; // 1-5 Likert scale
}

interface MBTIDimensionScore {
  dimension: string;
  pole1: string;
  pole2: string;
  pole1Score: number;
  pole2Score: number;
  result: string; // The dominant pole (E/I, S/N, T/F, J/P)
  percentage: number; // Percentage towards the dominant pole
}

interface MBTIResult {
  type: string; // e.g., "INTJ"
  dimensions: MBTIDimensionScore[];
  description: string;
}

/**
 * Calculate MBTI personality type from user responses
 */
export async function calculateMBTI(responses: MBTIResponse[]): Promise<MBTIResult> {
  // Fetch all MBTI questions with metadata
  const result = await pool.query(
    `SELECT id, metadata FROM assessment_questions WHERE section = $1`,
    ['mbti_personality']
  );

  const questions = result.rows;

  if (!questions || questions.length === 0) {
    throw new Error('Failed to fetch MBTI questions');
  }

  // Initialize dimension scores
  const dimensionScores = {
    'E/I': { E: 0, I: 0 },
    'S/N': { S: 0, N: 0 },
    'T/F': { T: 0, F: 0 },
    'J/P': { J: 0, P: 0 },
  };

  // Calculate scores for each dimension
  for (const response of responses) {
    const question = questions.find((q) => q.id === response.question_id);
    if (!question || !question.metadata) continue;

    const { dimension, pole } = question.metadata as { dimension: string; pole: string };

    if (dimension && pole && dimensionScores[dimension as keyof typeof dimensionScores]) {
      // For Likert scale 1-5:
      // 1-2 = disagree (inverse pole), 3 = neutral, 4-5 = agree (this pole)
      const score = response.value; // 1-5

      if (score >= 4) {
        // Agree with this pole
        const dimensionScore = dimensionScores[dimension as keyof typeof dimensionScores] as Record<string, number>;
        dimensionScore[pole] = (dimensionScore[pole] || 0) + (score - 3);
      } else if (score <= 2) {
        // Disagree with this pole (favor the opposite)
        const oppositePole = getOppositePole(dimension, pole);
        const dimensionScore = dimensionScores[dimension as keyof typeof dimensionScores] as Record<string, number>;
        dimensionScore[oppositePole] = (dimensionScore[oppositePole] || 0) + (3 - score);
      }
      // score === 3 (neutral) adds nothing
    }
  }

  // Determine personality type
  const dimensions: MBTIDimensionScore[] = [];
  let personalityType = '';

  for (const [dim, scores] of Object.entries(dimensionScores)) {
    const [pole1, pole2] = dim.split('/');
    const pole1Score = scores[pole1 as keyof typeof scores] || 0;
    const pole2Score = scores[pole2 as keyof typeof scores] || 0;
    const total = pole1Score + pole2Score;

    const dominant = pole1Score >= pole2Score ? pole1 : pole2;
    const dominantScore = pole1Score >= pole2Score ? pole1Score : pole2Score;
    const percentage = total > 0 ? Math.round((dominantScore / total) * 100) : 50;

    dimensions.push({
      dimension: dim,
      pole1,
      pole2,
      pole1Score,
      pole2Score,
      result: dominant,
      percentage,
    });

    personalityType += dominant;
  }

  return {
    type: personalityType,
    dimensions,
    description: getMBTIDescription(personalityType),
  };
}

/**
 * Get the opposite pole for a given dimension and pole
 */
function getOppositePole(dimension: string, pole: string): string {
  const opposites: Record<string, Record<string, string>> = {
    'E/I': { E: 'I', I: 'E' },
    'S/N': { S: 'N', N: 'S' },
    'T/F': { T: 'F', F: 'T' },
    'J/P': { J: 'P', P: 'J' },
  };
  return opposites[dimension]?.[pole] || pole;
}

/**
 * Get MBTI personality type description
 */
function getMBTIDescription(type: string): string {
  const descriptions: Record<string, string> = {
    INTJ: 'Architecte - Stratège imaginatif avec un plan pour tout',
    INTP: 'Logicien - Penseur innovant avec une soif inextinguible de connaissances',
    ENTJ: 'Commandant - Leader audacieux, imaginatif et volontaire',
    ENTP: 'Innovateur - Penseur intelligent et curieux qui relève tous les défis intellectuels',
    INFJ: 'Avocat - Idéaliste calme et mystique, mais très inspirant',
    INFP: 'Médiateur - Poétique, gentil et altruiste, toujours prêt à défendre une bonne cause',
    ENFJ: 'Protagoniste - Leader charismatique et inspirant, capable de captiver son audience',
    ENFP: 'Inspirateur - Esprit libre enthousiaste, créatif et sociable',
    ISTJ: 'Logisticien - Pratique et factuel, fiable et organisé',
    ISFJ: 'Défenseur - Protecteur dévoué, prêt à défendre ses proches',
    ESTJ: 'Directeur - Excellent administrateur, inégalé pour gérer les choses',
    ESFJ: 'Consul - Très attentionné, sociable et populaire, toujours prêt à aider',
    ISTP: 'Virtuose - Expérimentateur audacieux et pratique, maître de tous les outils',
    ISFP: 'Aventurier - Artiste flexible et charmant, toujours prêt à explorer',
    ESTP: 'Entrepreneur - Intelligent, énergique et très perspicace',
    ESFP: "Amuseur - Spontané, énergique et enthousiaste, la vie n'est jamais ennuyeuse",
  };
  return descriptions[type] || 'Type de personnalité unique';
}

// ============================================================================
// RIASEC SCORING
// ============================================================================

interface RIASECResponse {
  question_id: string;
  value: number; // 1-5 interest scale
}

interface RIASECDimensionScore {
  dimension: string;
  category: string;
  score: number;
  percentage: number;
}

interface RIASECResult {
  code: string; // e.g., "SAE" (top 3 dimensions)
  dimensions: RIASECDimensionScore[];
  topInterests: string[];
  description: string;
}

/**
 * Calculate RIASEC vocational interests from user responses
 */
export async function calculateRIASEC(responses: RIASECResponse[]): Promise<RIASECResult> {
  // Fetch all RIASEC questions with metadata
  const result = await pool.query(
    `SELECT id, metadata FROM assessment_questions WHERE section = $1`,
    ['riasec_interests']
  );

  const questions = result.rows;

  if (!questions || questions.length === 0) {
    throw new Error('Failed to fetch RIASEC questions');
  }

  // Initialize dimension scores
  const dimensionScores: Record<string, { category: string; score: number }> = {
    R: { category: 'Réaliste', score: 0 },
    I: { category: 'Investigateur', score: 0 },
    A: { category: 'Artistique', score: 0 },
    S: { category: 'Social', score: 0 },
    E: { category: 'Entreprenant', score: 0 },
    C: { category: 'Conventionnel', score: 0 },
  };

  // Calculate scores for each dimension
  for (const response of responses) {
    const question = questions.find((q) => q.id === response.question_id);
    if (!question || !question.metadata) continue;

    const { dimension } = question.metadata as { dimension: string; category: string };

    if (dimension && dimensionScores[dimension]) {
      // RIASEC uses interest scale 1-5, directly add the value
      dimensionScores[dimension].score += response.value;
    }
  }

  // Calculate total score for percentage
  const totalScore = Object.values(dimensionScores).reduce((sum, dim) => sum + dim.score, 0);

  // Sort dimensions by score (descending)
  const sortedDimensions = Object.entries(dimensionScores)
    .map(([dim, data]) => ({
      dimension: dim,
      category: data.category,
      score: data.score,
      percentage: totalScore > 0 ? Math.round((data.score / totalScore) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score);

  // RIASEC code is the top 3 dimensions
  const riasecCode = sortedDimensions
    .slice(0, 3)
    .map((d) => d.dimension)
    .join('');

  const topInterests = sortedDimensions.slice(0, 3).map((d) => d.category);

  return {
    code: riasecCode,
    dimensions: sortedDimensions,
    topInterests,
    description: getRIASECDescription(riasecCode),
  };
}

/**
 * Get RIASEC code description
 */
function getRIASECDescription(code: string): string {
  const descriptions: Record<string, string> = {
    // Common RIASEC codes
    RIA: "Profil technique et analytique - Idéal pour l'ingénierie et la recherche appliquée",
    RIC: 'Profil technique et organisé - Parfait pour la maintenance et la gestion technique',
    RAI: "Profil créatif et technique - Adapté au design industriel et à l'architecture",
    IAS: 'Profil intellectuel et créatif - Excellent pour la recherche en sciences humaines',
    IAR: 'Profil scientifique et pratique - Idéal pour les sciences appliquées',
    ISA: 'Profil analytique et social - Parfait pour la psychologie et le conseil',
    ASI: "Profil créatif et social - Adapté à l'enseignement artistique et au design",
    AIS: "Profil créatif et analytique - Excellent pour l'architecture et le design UX",
    SAE: 'Profil social et entrepreneurial - Idéal pour le management et les RH',
    SAI: "Profil social et intellectuel - Parfait pour l'éducation et la formation",
    SEA: "Profil social et leader - Adapté au management d'équipe et au coaching",
    EAS: 'Profil entrepreneurial et créatif - Excellent pour le marketing et la communication',
    ESA: "Profil leader et social - Idéal pour la gestion d'équipe et les ventes",
    ECS: 'Profil entrepreneurial et organisé - Parfait pour la gestion de projet',
    CSE: 'Profil organisé et entrepreneurial - Adapté à la comptabilité et la finance',
    CES: "Profil organisé et leader - Excellent pour l'administration et la gestion",
  };

  return descriptions[code] || `Profil ${code} - Combinaison unique d'intérêts professionnels`;
}

// ============================================================================
// SAVE RESULTS TO DATABASE
// ============================================================================

/**
 * Save MBTI results to database
 */
export async function saveMBTIResult(
  userId: string,
  assessmentId: string,
  result: MBTIResult
): Promise<void> {
  const { error } = await supabase.from('personality_analyses').insert({
    user_id: userId,
    assessment_id: assessmentId,
    test_type: 'MBTI',
    personality_type: result.type,
    dimensions: result.dimensions,
    description: result.description,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save MBTI result: ${error.message}`);
  }
}

/**
 * Save RIASEC results to database
 */
export async function saveRIASECResult(
  userId: string,
  assessmentId: string,
  result: RIASECResult
): Promise<void> {
  const { error } = await supabase.from('personality_analyses').insert({
    user_id: userId,
    assessment_id: assessmentId,
    test_type: 'RIASEC',
    personality_type: result.code,
    dimensions: result.dimensions,
    description: result.description,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to save RIASEC result: ${error.message}`);
  }
}

export default {
  calculateMBTI,
  calculateRIASEC,
  saveMBTIResult,
  saveRIASECResult,
};
