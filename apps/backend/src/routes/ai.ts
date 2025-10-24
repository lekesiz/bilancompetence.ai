import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Use Gemini API (from environment variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * POST /api/ai/analyze-cv
 * Analyze CV and extract competences
 */
router.post('/analyze-cv', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { cv_text, assessment_id } = req.body;

    if (!cv_text) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    // Call Gemini API for CV analysis
    const prompt = `Analyse ce CV et extrais les informations suivantes au format JSON:
{
  "competences": ["compétence 1", "compétence 2", ...],
  "experiences": [
    {
      "poste": "titre du poste",
      "entreprise": "nom entreprise",
      "duree": "durée",
      "description": "description"
    }
  ],
  "formations": [
    {
      "diplome": "nom diplôme",
      "etablissement": "nom établissement",
      "annee": "année"
    }
  ],
  "langues": ["langue 1", "langue 2"],
  "soft_skills": ["soft skill 1", "soft skill 2"]
}

CV:
${cv_text}`;

    const analysis = await callGeminiAPI(prompt);

    // Save analysis to database
    if (assessment_id) {
      await supabase
        .from('cv_analyses')
        .insert({
          assessment_id,
          cv_text,
          analysis_result: analysis,
          created_at: new Date().toISOString()
        });
    }

    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing CV:', error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
});

/**
 * POST /api/ai/job-recommendations
 * Get AI-powered job recommendations
 */
router.post('/job-recommendations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessment_id, competences, interests, values } = req.body;

    if (!competences || !Array.isArray(competences)) {
      return res.status(400).json({ error: 'Competences are required' });
    }

    const prompt = `En tant qu'expert en orientation professionnelle, recommande 5 métiers adaptés à ce profil:

Compétences: ${competences.join(', ')}
Intérêts: ${interests ? interests.join(', ') : 'Non spécifié'}
Valeurs: ${values ? values.join(', ') : 'Non spécifié'}

Pour chaque métier, fournis au format JSON:
{
  "metiers": [
    {
      "titre": "Titre du métier",
      "description": "Description courte",
      "match_score": 85,
      "competences_requises": ["compétence 1", "compétence 2"],
      "competences_manquantes": ["compétence à développer"],
      "salaire_moyen": "Fourchette salariale",
      "perspectives": "Perspectives d'évolution"
    }
  ]
}`;

    const recommendations = await callGeminiAPI(prompt);

    // Save recommendations
    if (assessment_id) {
      await supabase
        .from('job_recommendations')
        .insert({
          assessment_id,
          recommendations_data: recommendations,
          created_at: new Date().toISOString()
        });
    }

    res.json({ recommendations });

  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * POST /api/ai/analyze-personality
 * Analyze personality based on test results
 */
router.post('/analyze-personality', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { mbti_type, riasec_scores, assessment_id } = req.body;

    if (!mbti_type && !riasec_scores) {
      return res.status(400).json({ error: 'MBTI type or RIASEC scores required' });
    }

    const prompt = `En tant que psychologue du travail, analyse cette personnalité professionnelle:

Type MBTI: ${mbti_type || 'Non spécifié'}
Scores RIASEC: ${riasec_scores ? JSON.stringify(riasec_scores) : 'Non spécifié'}

Fournis une analyse au format JSON:
{
  "traits_dominants": ["trait 1", "trait 2"],
  "forces": ["force 1", "force 2"],
  "axes_developpement": ["axe 1", "axe 2"],
  "environnement_ideal": "Description de l'environnement de travail idéal",
  "style_travail": "Description du style de travail",
  "recommandations": ["recommandation 1", "recommandation 2"]
}`;

    const analysis = await callGeminiAPI(prompt);

    // Save analysis
    if (assessment_id) {
      await supabase
        .from('personality_analyses')
        .insert({
          assessment_id,
          mbti_type,
          riasec_scores,
          analysis_result: analysis,
          created_at: new Date().toISOString()
        });
    }

    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing personality:', error);
    res.status(500).json({ error: 'Failed to analyze personality' });
  }
});

/**
 * POST /api/ai/generate-action-plan
 * Generate personalized action plan
 */
router.post('/generate-action-plan', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { assessment_id, target_job, current_competences, gap_analysis } = req.body;

    if (!target_job) {
      return res.status(400).json({ error: 'Target job is required' });
    }

    const prompt = `Crée un plan d'action détaillé pour atteindre ce métier cible:

Métier cible: ${target_job}
Compétences actuelles: ${current_competences ? current_competences.join(', ') : 'À définir'}
Écarts identifiés: ${gap_analysis || 'À analyser'}

Fournis un plan au format JSON:
{
  "objectif_principal": "Objectif SMART",
  "duree_estimee": "Durée en mois",
  "etapes": [
    {
      "numero": 1,
      "titre": "Titre de l'étape",
      "description": "Description détaillée",
      "duree": "Durée",
      "actions": ["action 1", "action 2"],
      "ressources": ["ressource 1", "ressource 2"]
    }
  ],
  "formations_recommandees": [
    {
      "titre": "Titre formation",
      "organisme": "Organisme",
      "duree": "Durée",
      "cout_estime": "Coût"
    }
  ],
  "jalons": ["jalon 1", "jalon 2"]
}`;

    const actionPlan = await callGeminiAPI(prompt);

    // Save action plan
    if (assessment_id) {
      await supabase
        .from('action_plans')
        .insert({
          assessment_id,
          target_job,
          plan_data: actionPlan,
          created_at: new Date().toISOString()
        });
    }

    res.json({ action_plan: actionPlan });

  } catch (error) {
    console.error('Error generating action plan:', error);
    res.status(500).json({ error: 'Failed to generate action plan' });
  }
});

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Try to parse JSON from response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch {
      // If not JSON, return as text
      return { result: text };
    }

  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

export default router;

