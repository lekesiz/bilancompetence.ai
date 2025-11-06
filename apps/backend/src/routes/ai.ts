import { Router, Request, Response } from 'express';
import multer from 'multer';
// Temporarily disabled due to Node.js 18 compatibility issues
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { authenticateToken } from '../middleware/auth.js';
import {
  saveCVAnalysis,
  saveJobRecommendation,
  savePersonalityAnalysis,
  saveActionPlan,
} from '../services/aiAnalysisServiceNeon.js';

const router = Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  },
});

// Use Gemini API (from environment variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * @swagger
 * /api/ai/analyze-cv:
 *   post:
 *     summary: Analyze CV and extract competences
 *     description: Upload a CV file (PDF or Word) and get AI-powered analysis of skills, experience, education, and soft skills
 *     tags: [AI Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or Word document, max 5MB)
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional assessment ID to save analysis to
 *     responses:
 *       200:
 *         description: CV successfully analyzed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     competences:
 *                       type: array
 *                       items:
 *                         type: string
 *                     experiences:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           poste:
 *                             type: string
 *                           entreprise:
 *                             type: string
 *                           duree:
 *                             type: string
 *                           description:
 *                             type: string
 *                     formations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           diplome:
 *                             type: string
 *                           etablissement:
 *                             type: string
 *                           annee:
 *                             type: string
 *                     langues:
 *                       type: array
 *                       items:
 *                         type: string
 *                     soft_skills:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to analyze CV
 *       501:
 *         description: PDF analysis temporarily unavailable
 */
router.post(
  '/analyze-cv',
  authenticateToken,
  upload.single('cv'),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { assessment_id } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'CV file is required' });
      }

      // Extract text from uploaded file
      let cv_text = '';
      try {
        if (file.mimetype === 'application/pdf') {
          // Temporarily disabled due to pdf-parse compatibility issues with Node.js 18
          return res.status(501).json({
            error:
              'PDF analysis temporarily unavailable. Please upgrade to Node.js 20+ or use Word documents.',
          });
        } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          cv_text = result.value;
        } else {
          return res.status(400).json({ error: 'Unsupported file type' });
        }
      } catch (extractError) {
        console.error('Error extracting text from file:', extractError);
        return res.status(500).json({ error: 'Failed to extract text from CV file' });
      }

      if (!cv_text || cv_text.trim().length === 0) {
        return res.status(400).json({ error: 'CV file appears to be empty or unreadable' });
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
        await saveCVAnalysis(assessment_id, cv_text, analysis);
      }

      res.json({ analysis });
    } catch (error) {
      console.error('Error analyzing CV:', error);
      res.status(500).json({ error: 'Failed to analyze CV' });
    }
  }
);

/**
 * @swagger
 * /api/ai/job-recommendations:
 *   post:
 *     summary: Get AI-powered job recommendations
 *     description: Receive personalized job recommendations based on skills, interests, and values
 *     tags: [AI Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - competences
 *             properties:
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *               competences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User's competences/skills
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User's professional interests
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User's professional values
 *     responses:
 *       200:
 *         description: Job recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: object
 *                   properties:
 *                     metiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           description:
 *                             type: string
 *                           match_score:
 *                             type: number
 *                           competences_requises:
 *                             type: array
 *                             items:
 *                               type: string
 *                           competences_manquantes:
 *                             type: array
 *                             items:
 *                               type: string
 *                           salaire_moyen:
 *                             type: string
 *                           perspectives:
 *                             type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to get recommendations
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
      await saveJobRecommendation(assessment_id, recommendations);
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * @swagger
 * /api/ai/analyze-personality:
 *   post:
 *     summary: Analyze personality based on test results
 *     description: Get AI-powered personality analysis from MBTI and RIASEC test scores
 *     tags: [AI Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mbti_type:
 *                 type: string
 *                 description: MBTI personality type (e.g., INTJ, ENFP)
 *                 example: INTJ
 *               riasec_scores:
 *                 type: object
 *                 description: RIASEC test scores
 *                 properties:
 *                   R:
 *                     type: number
 *                   I:
 *                     type: number
 *                   A:
 *                     type: number
 *                   S:
 *                     type: number
 *                   E:
 *                     type: number
 *                   C:
 *                     type: number
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Personality analysis generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     traits_dominants:
 *                       type: array
 *                       items:
 *                         type: string
 *                     forces:
 *                       type: array
 *                       items:
 *                         type: string
 *                     axes_developpement:
 *                       type: array
 *                       items:
 *                         type: string
 *                     environnement_ideal:
 *                       type: string
 *                     style_travail:
 *                       type: string
 *                     recommandations:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to analyze personality
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
      await savePersonalityAnalysis(assessment_id, analysis);
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing personality:', error);
    res.status(500).json({ error: 'Failed to analyze personality' });
  }
});

/**
 * @swagger
 * /api/ai/generate-action-plan:
 *   post:
 *     summary: Generate personalized action plan
 *     description: Create a detailed action plan to achieve a target job/career with steps, training, and milestones
 *     tags: [AI Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_job
 *             properties:
 *               target_job:
 *                 type: string
 *                 description: Target job or career
 *                 example: Data Scientist
 *               current_competences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Current competences/skills
 *               gap_analysis:
 *                 type: string
 *                 description: Identified skill gaps
 *               assessment_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Action plan generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action_plan:
 *                   type: object
 *                   properties:
 *                     objectif_principal:
 *                       type: string
 *                     duree_estimee:
 *                       type: string
 *                     etapes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           numero:
 *                             type: number
 *                           titre:
 *                             type: string
 *                           description:
 *                             type: string
 *                           duree:
 *                             type: string
 *                           actions:
 *                             type: array
 *                             items:
 *                               type: string
 *                           ressources:
 *                             type: array
 *                             items:
 *                               type: string
 *                     formations_recommandees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           titre:
 *                             type: string
 *                           organisme:
 *                             type: string
 *                           duree:
 *                             type: string
 *                           cout_estime:
 *                             type: string
 *                     jalons:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Failed to generate action plan
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
      await saveActionPlan(assessment_id, actionPlan);
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
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
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
