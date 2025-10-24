import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

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
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (error || !assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Get answers for each phase
    const { data: answers } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true });

    // Calculate phase completion
    const phases = {
      preliminaire: {
        status: assessment.phase_preliminaire_completed ? 'completed' : 'in_progress',
        completed_at: assessment.phase_preliminaire_completed_at,
        progress: calculatePhaseProgress(answers || [], 1)
      },
      investigation: {
        status: assessment.phase_investigation_completed ? 'completed' : 
                assessment.phase_preliminaire_completed ? 'in_progress' : 'locked',
        completed_at: assessment.phase_investigation_completed_at,
        progress: calculatePhaseProgress(answers || [], 2)
      },
      conclusion: {
        status: assessment.phase_conclusion_completed ? 'completed' :
                assessment.phase_investigation_completed ? 'in_progress' : 'locked',
        completed_at: assessment.phase_conclusion_completed_at,
        progress: calculatePhaseProgress(answers || [], 3)
      }
    };

    res.json({
      assessment_id: assessmentId,
      current_phase: getCurrentPhase(phases),
      phases,
      overall_progress: calculateOverallProgress(phases)
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
router.post('/:assessmentId/preliminaire/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = (req as any).user.userId;

    const { error } = await supabase
      .from('assessments')
      .update({
        phase_preliminaire_completed: true,
        phase_preliminaire_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to update phase' });
    }

    res.json({ 
      message: 'Phase préliminaire completed',
      next_phase: 'investigation'
    });

  } catch (error) {
    console.error('Error completing phase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/parcours/:assessmentId/investigation/complete
 * Mark phase investigation as completed
 */
router.post('/:assessmentId/investigation/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = (req as any).user.userId;

    const { error } = await supabase
      .from('assessments')
      .update({
        phase_investigation_completed: true,
        phase_investigation_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to update phase' });
    }

    res.json({ 
      message: 'Phase investigation completed',
      next_phase: 'conclusion'
    });

  } catch (error) {
    console.error('Error completing phase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/parcours/:assessmentId/conclusion/complete
 * Mark phase conclusion as completed
 */
router.post('/:assessmentId/conclusion/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const userId = (req as any).user.userId;

    const { error } = await supabase
      .from('assessments')
      .update({
        phase_conclusion_completed: true,
        phase_conclusion_completed_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to update phase' });
    }

    res.json({ 
      message: 'Bilan de compétences completed!',
      status: 'completed'
    });

  } catch (error) {
    console.error('Error completing phase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/parcours/:assessmentId/answers
 * Save answers for current phase
 */
router.post('/:assessmentId/answers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { question_id, answer_text, step_number } = req.body;
    const userId = (req as any).user.userId;

    // Verify assessment belongs to user
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single();

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Insert or update answer
    const { data, error } = await supabase
      .from('assessment_answers')
      .upsert({
        assessment_id: assessmentId,
        question_id,
        answer_text,
        step_number,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'assessment_id,question_id'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save answer' });
    }

    res.json({ answer: data });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculatePhaseProgress(answers: any[], phase: number): number {
  const phaseAnswers = answers.filter(a => {
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
  const total = phases.preliminaire.progress + 
                phases.investigation.progress + 
                phases.conclusion.progress;
  return Math.round(total / 3);
}

export default router;

