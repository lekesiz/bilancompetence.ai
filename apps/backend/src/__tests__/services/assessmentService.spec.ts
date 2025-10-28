/**
 * Assessment Service Unit Tests
 *
 * Tests for wizard-related assessment service functions:
 * - createAssessmentDraft
 * - saveDraftStep
 * - autoSaveDraft
 * - getAssessmentProgress
 * - validateAssessmentStep
 * - submitAssessment
 */

import {
  createAssessmentDraft,
  saveDraftStep,
  autoSaveDraft,
  getAssessmentProgress,
  validateAssessmentStep,
  submitAssessment,
  extractAndCreateCompetencies,
  validateCompetencies,
  workHistoryStepSchema,
  educationStepSchema,
  skillsStepSchema,
  motivationsStepSchema,
  constraintsStepSchema,
} from '../../services/assessmentService';
import { supabase } from '../../services/supabaseService';

// Mock Supabase client
jest.mock('../../services/supabaseService', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table) => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
      insert: jest.fn().mockImplementation((data) => ({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: Array.isArray(data) ? { ...data[0], id: 'test-id' } : { ...data, id: 'test-id' },
            error: null,
          }),
        }),
      })),
      update: jest.fn().mockImplementation((data) => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-id', ...data },
            error: null,
          }),
        }),
      })),
    })),
  },
}));

describe('AssessmentService - Wizard Functions', () => {
  const testBeneficiaryId = 'beneficiary-123';
  const testAssessmentId = 'assessment-456';
  const testUserId = 'user-789';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssessmentDraft', () => {
    it('should create a new assessment draft successfully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              beneficiary_id: testBeneficiaryId,
              status: 'DRAFT',
              current_step: 0,
              progress_percentage: 0,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createAssessmentDraft(testBeneficiaryId, 'career', 'Career Assessment');

      expect(result.id).toBe(testAssessmentId);
      expect(result.status).toBe('DRAFT');
      expect(result.current_step).toBe(0);
      expect(result.progress_percentage).toBe(0);
    });

    it('should create assessment with default title if not provided', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              title: 'Career Assessment',
              beneficiary_id: testBeneficiaryId,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const result = await createAssessmentDraft(testBeneficiaryId, 'skills');

      expect(result.id).toBe(testAssessmentId);
      expect(supabase.from).toHaveBeenCalledWith('assessments');
    });

    it('should throw error if creation fails', async () => {
      const mockError = new Error('Database error');
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(mockError),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      await expect(createAssessmentDraft(testBeneficiaryId, 'career')).rejects.toThrow();
    });

    it('should accept all assessment types', async () => {
      const types = ['career', 'skills', 'comprehensive'];

      for (const type of types) {
        const mockInsert = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: testAssessmentId, assessment_type: type },
              error: null,
            }),
          }),
        });

        (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

        const result = await createAssessmentDraft(testBeneficiaryId, type as any);
        expect(result.id).toBe(testAssessmentId);
      }
    });
  });

  describe('validateAssessmentStep', () => {
    it('should validate work history step successfully', async () => {
      const validData = {
        recentJob: 'Senior Developer at TechCorp for 5 years',
        previousPositions: 'Developer | StartupX | 3 years\nJunior Dev | Agency | 1 year',
      };

      const result = await validateAssessmentStep(1, 'work_history', validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject work history with short job description', async () => {
      const invalidData = {
        recentJob: 'Short', // Less than 10 chars
        previousPositions: 'Developer | StartupX | 3 years',
      };

      const result = await validateAssessmentStep(1, 'work_history', invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should validate education step successfully', async () => {
      const validData = {
        highestLevel: 'bac+5',
        fieldOfStudy: 'Computer Science',
      };

      const result = await validateAssessmentStep(2, 'education', validData);

      expect(result.valid).toBe(true);
    });

    it('should reject education with invalid level', async () => {
      const invalidData = {
        highestLevel: 'invalid_level',
      };

      const result = await validateAssessmentStep(2, 'education', invalidData);

      expect(result.valid).toBe(false);
    });

    it('should validate skills step with minimum 5 competencies', async () => {
      const validData = {
        competencies: [
          { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
          { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
          { skillName: 'Node.js', selfAssessmentLevel: 4, selfInterestLevel: 8 },
          { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 7 },
          { skillName: 'SQL', selfAssessmentLevel: 3, selfInterestLevel: 6 },
        ],
      };

      const result = await validateAssessmentStep(3, 'skills', validData);

      expect(result.valid).toBe(true);
    });

    it('should reject skills step with less than 5 competencies', async () => {
      const invalidData = {
        competencies: [
          { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
          { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
        ],
      };

      const result = await validateAssessmentStep(3, 'skills', invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate motivations step successfully', async () => {
      const validData = {
        topValues: ['Growth', 'Autonomy'],
        careerGoals: ['Leadership', 'Expertise'],
        motivationDescription:
          'This is a long enough motivation description with meaningful content.',
      };

      const result = await validateAssessmentStep(4, 'motivations', validData);

      expect(result.valid).toBe(true);
    });

    it('should reject motivations with short description', async () => {
      const invalidData = {
        topValues: ['Growth'],
        careerGoals: ['Leadership'],
        motivationDescription: 'Short',
      };

      const result = await validateAssessmentStep(4, 'motivations', invalidData);

      expect(result.valid).toBe(false);
    });

    it('should validate constraints step (all optional)', async () => {
      const validData = {
        geographicPreferences: ['Remote', 'Paris'],
        contractTypes: ['CDI'],
      };

      const result = await validateAssessmentStep(5, 'constraints', validData);

      expect(result.valid).toBe(true);
    });

    it('should validate empty constraints step (all optional)', async () => {
      const emptyData = {};

      const result = await validateAssessmentStep(5, 'constraints', emptyData);

      expect(result.valid).toBe(true);
    });
  });

  describe('saveDraftStep', () => {
    it('should save a draft step with validation', async () => {
      const mockUpsert = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: testAssessmentId,
                current_step: 1,
                progress_percentage: 20,
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'assessment_answers') {
          return { upsert: mockUpsert };
        }
        if (table === 'assessments') {
          return { update: mockUpsert };
        }
        return { upsert: jest.fn() };
      });

      const answers = {
        recentJob: 'Senior Developer at TechCorp for 5 years',
        previousPositions: 'Developer | StartupX | 3 years',
      };

      const result = await saveDraftStep(testAssessmentId, 1, 'work_history', answers);

      expect(result.progressPercentage).toBeDefined();
      expect(result.currentStep).toBeDefined();
    });

    it('should reject invalid step data', async () => {
      const invalidAnswers = {
        recentJob: 'Short',
      };

      await expect(
        saveDraftStep(testAssessmentId, 1, 'work_history', invalidAnswers)
      ).rejects.toThrow();
    });

    it('should save competencies for skills step', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: testAssessmentId, progress_percentage: 60, current_step: 3 },
              error: null,
            }),
          }),
        }),
      });

      const mockUpsert = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: testAssessmentId },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'assessments') {
          return { update: mockUpdate };
        }
        return { upsert: mockUpsert };
      });

      const competencies = [
        { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
        { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
        { skillName: 'Node.js', selfAssessmentLevel: 4, selfInterestLevel: 8 },
        { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 7 },
        { skillName: 'SQL', selfAssessmentLevel: 3, selfInterestLevel: 6 },
      ];

      const answers = {
        competencies: competencies,
        additionalSkills: 'Additional skills description',
      };

      await saveDraftStep(testAssessmentId, 3, 'skills', answers, competencies);

      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('autoSaveDraft', () => {
    it('should auto-save partial data without validation', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'draft-id', draft_data: {} },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const partialData = { recentJob: 'Partial entry...' };

      const result = await autoSaveDraft(testAssessmentId, 1, partialData);

      expect(result.savedAt).toBeDefined();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should update existing draft with merged data', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              draft_data: { step1: { recentJob: 'Existing data' } },
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const partialData = { additionalField: 'new data' };

      const result = await autoSaveDraft(testAssessmentId, 1, partialData);

      expect(result.savedAt).toBeDefined();
    });
  });

  describe('getAssessmentProgress', () => {
    it('should return progress information', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              current_step: 2,
              progress_percentage: 40,
              status: 'IN_PROGRESS',
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAssessmentProgress(testAssessmentId);

      expect(result.assessmentId).toBe(testAssessmentId);
      expect(result.currentStep).toBe(2);
      expect(result.progressPercentage).toBe(40);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should include completed steps array', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              current_step: 3,
              completed_steps: [1, 2, 3],
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getAssessmentProgress(testAssessmentId);

      expect(result.completedSteps).toBeDefined();
      expect(Array.isArray(result.completedSteps)).toBe(true);
    });
  });

  describe('submitAssessment', () => {
    it('should submit assessment successfully when all steps are complete', async () => {
      const mockGetSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              beneficiary_id: testBeneficiaryId,
              status: 'IN_PROGRESS',
            },
            error: null,
          }),
        }),
      });

      const mockUpdateSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { status: 'SUBMITTED' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'assessment_answers') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: [{ id: 'answer-1' }],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === 'assessments') {
          return { select: mockGetSelect, update: mockUpdateSelect };
        }
        if (table === 'assessment_drafts') {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        }
        return { select: mockGetSelect };
      });

      const result = await submitAssessment(testAssessmentId, testBeneficiaryId);

      expect(result.status).toBe('submitted');
      expect(result.submittedAt).toBeDefined();
    });

    it('should reject submission if assessment not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(submitAssessment(testAssessmentId, testBeneficiaryId)).rejects.toThrow(
        'Assessment not found'
      );
    });

    it('should reject submission if not all steps completed', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              beneficiary_id: testBeneficiaryId,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(submitAssessment(testAssessmentId, testBeneficiaryId)).rejects.toThrow(
        'Assessment incomplete'
      );
    });

    it('should reject submission if unauthorized user', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: testAssessmentId,
              beneficiary_id: 'different-user-id',
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(submitAssessment(testAssessmentId, testBeneficiaryId)).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('extractAndCreateCompetencies', () => {
    it('should extract and create competencies', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'competency-1',
              skill_name: 'React',
              self_assessment_level: 4,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const skillsData = [
        { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
        { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
      ];

      const result = await extractAndCreateCompetencies(testAssessmentId, skillsData);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('validateCompetencies', () => {
    it('should validate competencies format', async () => {
      const validCompetencies = [
        { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
        { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
      ];

      const result = await validateCompetencies(validCompetencies);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject competencies with invalid levels', async () => {
      const invalidCompetencies = [
        { skillName: 'React', selfAssessmentLevel: 5, selfInterestLevel: 9 }, // Invalid level (> 4)
        { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 11 }, // Invalid interest (> 10)
      ];

      const result = await validateCompetencies(invalidCompetencies);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject empty competencies array', async () => {
      const result = await validateCompetencies([]);

      expect(result.valid).toBe(false);
    });
  });

  describe('Validation Schemas', () => {
    it('should have workHistoryStepSchema defined', () => {
      expect(workHistoryStepSchema).toBeDefined();
    });

    it('should have educationStepSchema defined', () => {
      expect(educationStepSchema).toBeDefined();
    });

    it('should have skillsStepSchema defined', () => {
      expect(skillsStepSchema).toBeDefined();
    });

    it('should have motivationsStepSchema defined', () => {
      expect(motivationsStepSchema).toBeDefined();
    });

    it('should have constraintsStepSchema defined', () => {
      expect(constraintsStepSchema).toBeDefined();
    });
  });
});
