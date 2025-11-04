import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as aiService from '../../services/aiAnalysisServiceNeon.js';
import * as neonConfig from '../../config/neon.js';

// Mock the neon config
jest.mock('../../config/neon.js');
jest.mock('../../utils/logger.js');

describe('AI Analysis Service (Neon)', () => {
  const mockAssessmentId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '987e6543-e21b-34d5-b678-123456789abc';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveCVAnalysis', () => {
    it('should save CV analysis to database successfully', async () => {
      const cvText = 'Sample CV content with experience and skills...';
      const analysisResult = {
        competences: ['JavaScript', 'React', 'Node.js'],
        experiences: [
          {
            poste: 'Senior Developer',
            entreprise: 'Tech Corp',
            duree: '3 years',
            description: 'Led development team',
          },
        ],
        formations: [
          {
            diplome: 'Master in Computer Science',
            etablissement: 'University',
            annee: '2020',
          },
        ],
        langues: ['Français', 'Anglais'],
        soft_skills: ['Leadership', 'Communication'],
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, cvText, analysisResult, mockUserId);

      expect(mockQuery).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('INSERT INTO cv_analyses'),
        expect.arrayContaining([
          mockAssessmentId,
          cvText,
          JSON.stringify(analysisResult),
        ])
      );
    });

    it('should save CV analysis without userId', async () => {
      const cvText = 'Sample CV';
      const analysisResult = { competences: ['JavaScript'] };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, cvText, analysisResult);

      expect(mockQuery).toHaveBeenCalledWith(
        null,
        expect.stringContaining('INSERT INTO cv_analyses'),
        expect.any(Array)
      );
    });

    it('should handle database errors', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      (neonConfig.query as jest.Mock) = mockQuery;

      await expect(
        aiService.saveCVAnalysis(mockAssessmentId, 'text', {}, mockUserId)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle empty analysis result', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, 'text', {});

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('saveJobRecommendation', () => {
    it('should save job recommendations successfully', async () => {
      const recommendations = {
        metiers: [
          {
            titre: 'Full Stack Developer',
            description: 'Develop web applications',
            match_score: 85,
            competences_requises: ['JavaScript', 'React', 'Node.js'],
            competences_manquantes: ['Docker', 'Kubernetes'],
            salaire_moyen: '45-60k€',
            perspectives: 'Excellent growth potential',
          },
          {
            titre: 'Frontend Developer',
            description: 'Create user interfaces',
            match_score: 78,
            competences_requises: ['JavaScript', 'React', 'CSS'],
            competences_manquantes: ['TypeScript'],
            salaire_moyen: '40-55k€',
            perspectives: 'Good demand',
          },
        ],
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveJobRecommendation(mockAssessmentId, recommendations, mockUserId);

      expect(mockQuery).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('INSERT INTO job_recommendations'),
        expect.arrayContaining([mockAssessmentId, JSON.stringify(recommendations)])
      );
    });

    it('should handle empty recommendations', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveJobRecommendation(mockAssessmentId, { metiers: [] });

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle database constraint violations', async () => {
      const mockQuery = jest
        .fn()
        .mockRejectedValue(new Error('duplicate key value violates unique constraint'));
      (neonConfig.query as jest.Mock) = mockQuery;

      await expect(
        aiService.saveJobRecommendation(mockAssessmentId, { metiers: [] })
      ).rejects.toThrow();
    });
  });

  describe('savePersonalityAnalysis', () => {
    it('should save personality analysis successfully', async () => {
      const analysisResult = {
        traits_dominants: ['Analytical', 'Creative', 'Methodical'],
        forces: ['Problem solving', 'Innovation', 'Team collaboration'],
        axes_developpement: ['Time management', 'Public speaking'],
        environnement_ideal: 'Collaborative, innovative, flexible work environment',
        style_travail: 'Independent with regular team interactions',
        recommandations: [
          'Focus on project management skills',
          'Develop leadership capabilities',
        ],
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.savePersonalityAnalysis(mockAssessmentId, analysisResult, mockUserId);

      expect(mockQuery).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('INSERT INTO personality_analyses'),
        expect.arrayContaining([mockAssessmentId, JSON.stringify(analysisResult)])
      );
    });

    it('should save personality analysis without userId', async () => {
      const analysisResult = { traits_dominants: ['Analytical'] };
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.savePersonalityAnalysis(mockAssessmentId, analysisResult);

      expect(mockQuery).toHaveBeenCalledWith(
        null,
        expect.stringContaining('INSERT INTO personality_analyses'),
        expect.any(Array)
      );
    });

    it('should handle invalid assessment ID', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('invalid input syntax for type uuid'));
      (neonConfig.query as jest.Mock) = mockQuery;

      await expect(
        aiService.savePersonalityAnalysis('invalid-id', {})
      ).rejects.toThrow();
    });
  });

  describe('saveActionPlan', () => {
    it('should save action plan successfully', async () => {
      const actionPlan = {
        objectif_principal: 'Become a Full Stack Developer within 12 months',
        duree_estimee: '12 months',
        etapes: [
          {
            numero: 1,
            titre: 'Learn React fundamentals',
            description: 'Complete React course and build projects',
            duree: '2 months',
            actions: ['Take online course', 'Build 3 projects', 'Practice daily'],
            ressources: ['React documentation', 'Udemy courses', 'GitHub'],
          },
          {
            numero: 2,
            titre: 'Master Node.js backend',
            description: 'Learn server-side development',
            duree: '3 months',
            actions: ['Learn Express.js', 'Database design', 'API development'],
            ressources: ['Node.js docs', 'MongoDB University'],
          },
        ],
        formations_recommandees: [
          {
            titre: 'Full Stack JavaScript Bootcamp',
            organisme: 'Le Wagon',
            duree: '9 weeks',
            cout_estime: '6,500€',
          },
        ],
        jalons: [
          'Complete first React project',
          'Deploy first full-stack app',
          'Get first developer job',
        ],
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveActionPlan(mockAssessmentId, actionPlan, mockUserId);

      expect(mockQuery).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('INSERT INTO action_plans'),
        expect.arrayContaining([mockAssessmentId, JSON.stringify(actionPlan)])
      );
    });

    it('should save minimal action plan', async () => {
      const actionPlan = {
        objectif_principal: 'Career change',
        etapes: [],
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveActionPlan(mockAssessmentId, actionPlan);

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle database timeout errors', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('query timeout'));
      (neonConfig.query as jest.Mock) = mockQuery;

      await expect(aiService.saveActionPlan(mockAssessmentId, {})).rejects.toThrow('query timeout');
    });
  });

  describe('getCVAnalysis', () => {
    it('should retrieve CV analysis successfully', async () => {
      const mockAnalysis = {
        competences: ['JavaScript', 'Python'],
        experiences: [],
        formations: [],
      };

      const mockQuery = jest.fn().mockResolvedValue([
        { analysis_result: JSON.stringify(mockAnalysis) },
      ]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getCVAnalysis(mockAssessmentId, mockUserId);

      expect(result).toEqual(mockAnalysis);
      expect(mockQuery).toHaveBeenCalledWith(
        mockUserId,
        expect.stringContaining('SELECT analysis_result FROM cv_analyses'),
        [mockAssessmentId]
      );
    });

    it('should return null when no analysis exists', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getCVAnalysis(mockAssessmentId);

      expect(result).toBeNull();
    });

    it('should parse JSON correctly', async () => {
      const complexAnalysis = {
        competences: ['A', 'B', 'C'],
        nested: { field: { deep: 'value' } },
      };

      const mockQuery = jest.fn().mockResolvedValue([
        { analysis_result: JSON.stringify(complexAnalysis) },
      ]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getCVAnalysis(mockAssessmentId);

      expect(result).toEqual(complexAnalysis);
      expect(result.nested.field.deep).toBe('value');
    });

    it('should handle malformed JSON', async () => {
      const mockQuery = jest.fn().mockResolvedValue([{ analysis_result: 'invalid json {' }]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await expect(aiService.getCVAnalysis(mockAssessmentId)).rejects.toThrow();
    });
  });

  describe('getJobRecommendations', () => {
    it('should retrieve job recommendations successfully', async () => {
      const mockRecommendations = {
        metiers: [{ titre: 'Developer', match_score: 90 }],
      };

      const mockQuery = jest.fn().mockResolvedValue([
        { recommendations: JSON.stringify(mockRecommendations) },
      ]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getJobRecommendations(mockAssessmentId, mockUserId);

      expect(result).toEqual(mockRecommendations);
    });

    it('should return null when no recommendations exist', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getJobRecommendations(mockAssessmentId);

      expect(result).toBeNull();
    });
  });

  describe('getPersonalityAnalysis', () => {
    it('should retrieve personality analysis successfully', async () => {
      const mockAnalysis = {
        traits_dominants: ['Analytical'],
        forces: ['Problem solving'],
      };

      const mockQuery = jest.fn().mockResolvedValue([
        { analysis_result: JSON.stringify(mockAnalysis) },
      ]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getPersonalityAnalysis(mockAssessmentId);

      expect(result).toEqual(mockAnalysis);
    });

    it('should return null when no analysis exists', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getPersonalityAnalysis(mockAssessmentId);

      expect(result).toBeNull();
    });
  });

  describe('getActionPlan', () => {
    it('should retrieve action plan successfully', async () => {
      const mockPlan = {
        objectif_principal: 'Career goal',
        etapes: [{ numero: 1, titre: 'Step 1' }],
      };

      const mockQuery = jest.fn().mockResolvedValue([
        { action_plan: JSON.stringify(mockPlan) },
      ]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getActionPlan(mockAssessmentId);

      expect(result).toEqual(mockPlan);
    });

    it('should return null when no action plan exists', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      const result = await aiService.getActionPlan(mockAssessmentId);

      expect(result).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle special characters in CV text', async () => {
      const cvText = "CV with special chars: <script>alert('xss')</script> & 'quotes' \"double\"";
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, cvText, {});

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle very large analysis results', async () => {
      const largeAnalysis = {
        competences: Array(1000).fill('Skill'),
        experiences: Array(100).fill({ poste: 'Job', entreprise: 'Company' }),
      };

      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, 'text', largeAnalysis);

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle concurrent save operations', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await Promise.all([
        aiService.saveCVAnalysis(mockAssessmentId, 'cv1', {}),
        aiService.saveJobRecommendation(mockAssessmentId, {}),
        aiService.savePersonalityAnalysis(mockAssessmentId, {}),
        aiService.saveActionPlan(mockAssessmentId, {}),
      ]);

      expect(mockQuery).toHaveBeenCalledTimes(4);
    });

    it('should handle null and undefined values gracefully', async () => {
      const mockQuery = jest.fn().mockResolvedValue([]);
      (neonConfig.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, '', null as any);

      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
