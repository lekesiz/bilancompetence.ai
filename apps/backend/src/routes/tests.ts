import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getMBTIQuestions,
  getRIASECQuestions,
  getTestResults,
  saveTestResult,
} from '../services/psychometricServiceNeon.js';

const router = Router();

/**
 * GET /api/tests/mbti/questions
 * Get all MBTI questions
 */
router.get('/mbti/questions', async (req: Request, res: Response) => {
  try {
    const questions = await getMBTIQuestions();
    res.json(questions || []);
  } catch (error) {
    console.error('Error fetching MBTI questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tests/riasec/questions
 * Get all RIASEC questions
 */
router.get('/riasec/questions', async (req: Request, res: Response) => {
  try {
    const questions = await getRIASECQuestions();
    res.json(questions || []);
  } catch (error) {
    console.error('Error fetching RIASEC questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tests/:assessmentId
 * Get all tests for an assessment
 */
router.get('/:assessmentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = (req as any).user.userId;

    // Get test results
    const tests = await getTestResults(assessmentId, userId);

    res.json({ tests });

  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests/:assessmentId/mbti
 * Submit MBTI test results
 */
router.post('/:assessmentId/mbti', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { answers } = req.body;
    const userId = (req as any).user.userId;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Calculate MBTI type
    const mbtiType = calculateMBTI(answers);
    const description = getMBTIDescription(mbtiType);

    // Save test result
    const test = await saveTestResult(
      assessmentId,
      'mbti',
      {
        type: mbtiType,
        description,
        answers
      },
      userId
    );

    res.json({ 
      test,
      mbti_type: mbtiType,
      description
    });

  } catch (error) {
    console.error('Error saving MBTI test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests/:assessmentId/riasec
 * Submit RIASEC test results
 */
router.post('/:assessmentId/riasec', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { answers } = req.body;
    const userId = (req as any).user.userId;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid answers format' });
    }

    // Calculate RIASEC scores
    const scores = calculateRIASEC(answers);
    const topThree = getTopThreeRIASEC(scores);

    // Save test result
    const test = await saveTestResult(
      assessmentId,
      'riasec',
      {
        scores,
        top_three: topThree,
        answers
      },
      userId
    );

    res.json({ 
      test,
      scores,
      top_three: topThree
    });

  } catch (error) {
    console.error('Error saving RIASEC test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests/:assessmentId/competences
 * Submit competences test results
 */
router.post('/:assessmentId/competences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { competences } = req.body;
    const userId = (req as any).user.userId;

    if (!competences || !Array.isArray(competences)) {
      return res.status(400).json({ error: 'Invalid competences format' });
    }

    // Save test result
    const test = await saveTestResult(
      assessmentId,
      'competences',
      {
        competences,
        top_competences: competences.filter((c: any) => c.level >= 4)
      },
      userId
    );

    res.json({ test });

  } catch (error) {
    console.error('Error saving competences test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tests/:assessmentId/valeurs
 * Submit values test results
 */
router.post('/:assessmentId/valeurs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { valeurs } = req.body;
    const userId = (req as any).user.userId;

    if (!valeurs || !Array.isArray(valeurs)) {
      return res.status(400).json({ error: 'Invalid valeurs format' });
    }

    // Save test result
    const test = await saveTestResult(
      assessmentId,
      'valeurs',
      {
        valeurs,
        top_valeurs: valeurs.slice(0, 5) // Top 5 values
      },
      userId
    );

    res.json({ test });

  } catch (error) {
    console.error('Error saving valeurs test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateMBTI(answers: any[]): string {
  // Simplified MBTI calculation
  // In production, use proper MBTI scoring algorithm
  const dimensions = {
    EI: 0, // Extraversion vs Introversion
    SN: 0, // Sensing vs Intuition
    TF: 0, // Thinking vs Feeling
    JP: 0  // Judging vs Perceiving
  };

  answers.forEach((answer, index) => {
    const dimension = Math.floor(index / 10);
    const value = answer.value || 0;
    
    if (dimension === 0) dimensions.EI += value;
    else if (dimension === 1) dimensions.SN += value;
    else if (dimension === 2) dimensions.TF += value;
    else if (dimension === 3) dimensions.JP += value;
  });

  const type = 
    (dimensions.EI > 0 ? 'E' : 'I') +
    (dimensions.SN > 0 ? 'N' : 'S') +
    (dimensions.TF > 0 ? 'T' : 'F') +
    (dimensions.JP > 0 ? 'J' : 'P');

  return type;
}

function getMBTIDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'INTJ': 'Architecte - Penseur stratégique avec soif de connaissance',
    'INTP': 'Logicien - Innovateur avec une soif de connaissance',
    'ENTJ': 'Commandant - Leader audacieux et imaginatif',
    'ENTP': 'Innovateur - Penseur curieux qui relève les défis intellectuels',
    'INFJ': 'Avocat - Idéaliste calme et mystique',
    'INFP': 'Médiateur - Poétique, gentil et altruiste',
    'ENFJ': 'Protagoniste - Leader charismatique et inspirant',
    'ENFP': 'Inspirateur - Enthousiaste, créatif et sociable',
    'ISTJ': 'Logisticien - Pratique et factuel',
    'ISFJ': 'Défenseur - Protecteur dévoué et chaleureux',
    'ESTJ': 'Directeur - Excellent administrateur',
    'ESFJ': 'Consul - Attentionné, sociable et populaire',
    'ISTP': 'Virtuose - Expérimentateur audacieux et pratique',
    'ISFP': 'Aventurier - Artiste flexible et charmant',
    'ESTP': 'Entrepreneur - Énergique et perceptif',
    'ESFP': 'Amuseur - Spontané, énergique et enthousiaste'
  };

  return descriptions[type] || 'Type de personnalité unique';
}

function calculateRIASEC(answers: any[]): any {
  const scores = {
    R: 0, // Réaliste
    I: 0, // Investigateur
    A: 0, // Artistique
    S: 0, // Social
    E: 0, // Entreprenant
    C: 0  // Conventionnel
  };

  answers.forEach((answer, index) => {
    const dimension = ['R', 'I', 'A', 'S', 'E', 'C'][index % 6];
    scores[dimension as keyof typeof scores] += answer.value || 0;
  });

  return scores;
}

function getTopThreeRIASEC(scores: any): any[] {
  const types = [
    { code: 'R', name: 'Réaliste', score: scores.R },
    { code: 'I', name: 'Investigateur', score: scores.I },
    { code: 'A', name: 'Artistique', score: scores.A },
    { code: 'S', name: 'Social', score: scores.S },
    { code: 'E', name: 'Entreprenant', score: scores.E },
    { code: 'C', name: 'Conventionnel', score: scores.C }
  ];

  return types
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export default router;

