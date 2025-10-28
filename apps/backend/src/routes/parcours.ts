import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getAssessmentWithParcours,
  completePhase,
  saveAssessmentAnswer,
} from '../services/assessmentServiceNeon.js';

const router = Router();

/**
 * GET /api/parcours/:assessmentId
 * Get parcours status for an assessment
 */
router.get('/:assessmentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = (req as any).user.userId;

    // Get assessment with parcours data
    const { assessment, phases } = await getAssessmentWithParcours(assessmentId, userId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      assessment_id: assessmentId,
      current_phase: getCurrentPhase(phases),
      phases,
      overall_progress: calculateOverallProgress(phases),
    });
  } catch (error) {
    console.error('Error fetching parcours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/parcours/:assessmentId/preliminaire/complete
 * Mark phase préliminaire as completed
 */
router.post(
  '/:assessmentId/preliminaire/complete',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;
      const userId = (req as any).user.userId;

      const result = await completePhase(assessmentId, 'preliminaire', userId);

      if (!result) {
        return res.status(500).json({ error: 'Failed to update phase' });
      }

      res.json({
        message: 'Phase préliminaire completed',
        next_phase: 'investigation',
      });
    } catch (error) {
      console.error('Error completing phase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/parcours/:assessmentId/investigation/complete
 * Mark phase investigation as completed
 */
router.post(
  '/:assessmentId/investigation/complete',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;
      const userId = (req as any).user.userId;

      const result = await completePhase(assessmentId, 'investigation', userId);

      if (!result) {
        return res.status(500).json({ error: 'Failed to update phase' });
      }

      res.json({
        message: 'Phase investigation completed',
        next_phase: 'conclusion',
      });
    } catch (error) {
      console.error('Error completing phase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/parcours/:assessmentId/conclusion/complete
 * Mark phase conclusion as completed
 */
router.post(
  '/:assessmentId/conclusion/complete',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;
      const userId = (req as any).user.userId;

      const result = await completePhase(assessmentId, 'conclusion', userId);

      if (!result) {
        return res.status(500).json({ error: 'Failed to update phase' });
      }

      res.json({
        message: 'Bilan de compétences completed!',
        status: 'completed',
      });
    } catch (error) {
      console.error('Error completing phase:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/parcours/:assessmentId/answers
 * Save answers for current phase
 */
router.post('/:assessmentId/answers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { question_id, answer_text, step_number } = req.body;
    const userId = (req as any).user.userId;

    // Save answer (includes verification)
    const answer = await saveAssessmentAnswer(
      assessmentId,
      question_id,
      { answer_text, step_number },
      userId
    );

    res.json({ answer });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculatePhaseProgress(answers: any[], phase: number): number {
  const phaseAnswers = answers.filter((a) => {
    if (phase === 1) return a.step_number >= 1 && a.step_number <= 2;
    if (phase === 2) return a.step_number >= 3 && a.step_number <= 4;
    if (phase === 3) return a.step_number === 5;
    return false;
  });

  const expectedAnswers = phase === 3 ? 3 : 6; // Phase 3 has 3 questions, others have 6
  return Math.min(100, Math.round((phaseAnswers.length / expectedAnswers) * 100));
}

function getCurrentPhase(phases: any): string {
  if (!phases.preliminaire.status || phases.preliminaire.status === 'in_progress') {
    return 'preliminaire';
  }
  if (phases.investigation.status === 'in_progress') {
    return 'investigation';
  }
  if (phases.conclusion.status === 'in_progress') {
    return 'conclusion';
  }
  return 'completed';
}

function calculateOverallProgress(phases: any): number {
  const total =
    phases.preliminaire.progress + phases.investigation.progress + phases.conclusion.progress;
  return Math.round(total / 3);
}

export default router;
