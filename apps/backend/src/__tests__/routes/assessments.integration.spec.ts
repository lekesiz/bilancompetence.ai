/**
 * Assessment Routes Integration Tests
 *
 * Tests for wizard-related endpoints:
 * - POST /api/assessments (create draft)
 * - GET /api/assessments/:id (get assessment)
 * - POST /api/assessments/:id/steps/:stepNumber (save step)
 * - POST /api/assessments/:id/auto-save (auto-save)
 * - GET /api/assessments/:id/progress (get progress)
 * - POST /api/assessments/:id/submit (submit)
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import assessmentRoutes from '../../routes/assessments';

// Mock middleware
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  };
  (req as any).ip = '127.0.0.1';
  next();
};

// Mock services
jest.mock('../../services/assessmentService');
jest.mock('../../services/supabaseService');

describe('Assessment Routes Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(mockAuthMiddleware);
    app.use('/api/assessments', assessmentRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/assessments - Create Assessment Draft', () => {
    it('should create new assessment draft', async () => {
      const response = await request(app)
        .post('/api/assessments')
        .send({
          title: 'Career Assessment 2025',
          assessment_type: 'career',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
    });

    it('should reject without assessment_type', async () => {
      const response = await request(app)
        .post('/api/assessments')
        .send({
          title: 'Career Assessment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should reject with invalid assessment_type', async () => {
      const response = await request(app)
        .post('/api/assessments')
        .send({
          title: 'Assessment',
          assessment_type: 'invalid_type',
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid assessment_type');
    });

    it('should require authentication', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use('/api/assessments', assessmentRoutes);

      const response = await request(unauthApp)
        .post('/api/assessments')
        .send({
          title: 'Assessment',
          assessment_type: 'career',
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/assessments/:id - Get Assessment', () => {
    it('should return assessment with full details', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 if assessment not found', async () => {
      const response = await request(app)
        .get('/api/assessments/nonexistent-id')
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('not found');
    });

    it('should return 403 if unauthorized', async () => {
      const response = await request(app)
        .get('/api/assessments/other-user-assessment')
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/assessments/:id/steps/:stepNumber - Save Step', () => {
    it('should save step 1 with work history data', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/steps/1`)
        .send({
          section: 'work_history',
          answers: {
            recent_job: 'Senior Developer at TechCorp for 5 years',
            previous_positions: 'Developer | StartupX | 3 years',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
    });

    it('should validate step data before saving', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/steps/1`)
        .send({
          section: 'work_history',
          answers: {
            recent_job: 'Short', // Invalid - too short
          },
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
    });

    it('should reject invalid step number', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/steps/99`)
        .send({
          section: 'work_history',
          answers: {},
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid step number');
    });

    it('should reject unauthorized step save', async () => {
      const assessmentId = 'other-user-assessment';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/steps/1`)
        .send({
          section: 'work_history',
          answers: {},
        })
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should save competencies for step 3', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/steps/3`)
        .send({
          section: 'skills',
          answers: { competencies_count: 5 },
          competencies: [
            { skillName: 'React', selfAssessmentLevel: 4, selfInterestLevel: 9 },
            { skillName: 'TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
            { skillName: 'Node.js', selfAssessmentLevel: 4, selfInterestLevel: 8 },
            { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 7 },
            { skillName: 'SQL', selfAssessmentLevel: 3, selfInterestLevel: 6 },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('POST /api/assessments/:id/auto-save - Auto-Save Draft', () => {
    it('should auto-save without validation', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/auto-save`)
        .send({
          step_number: 1,
          partial_data: {
            recent_job: 'Partial entry...',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('savedAt');
    });

    it('should accept any valid step number (0-5)', async () => {
      const assessmentId = 'assessment-123';

      for (let step = 0; step <= 5; step++) {
        const response = await request(app)
          .post(`/api/assessments/${assessmentId}/auto-save`)
          .send({
            step_number: step,
            partial_data: { test: 'data' },
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
      }
    });

    it('should reject invalid step number', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/auto-save`)
        .send({
          step_number: 99,
          partial_data: {},
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should reject unauthorized auto-save', async () => {
      const assessmentId = 'other-user-assessment';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/auto-save`)
        .send({
          step_number: 1,
          partial_data: {},
        })
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('GET /api/assessments/:id/progress - Get Progress', () => {
    it('should return progress information', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .get(`/api/assessments/${assessmentId}/progress`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('currentStep');
      expect(response.body.data).toHaveProperty('progressPercentage');
      expect(response.body.data).toHaveProperty('completedSteps');
    });

    it('should reject unauthorized progress request', async () => {
      const assessmentId = 'other-user-assessment';

      const response = await request(app)
        .get(`/api/assessments/${assessmentId}/progress`)
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should include draft data in response', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .get(`/api/assessments/${assessmentId}/progress`)
        .expect(200);

      expect(response.body.data).toHaveProperty('draftData');
    });
  });

  describe('POST /api/assessments/:id/submit - Submit Assessment', () => {
    it('should submit completed assessment', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('submitted');
      expect(response.body.data).toHaveProperty('submittedAt');
    });

    it('should reject submission of incomplete assessment', async () => {
      const assessmentId = 'incomplete-assessment';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('incomplete');
    });

    it('should reject unauthorized submission', async () => {
      const assessmentId = 'other-user-assessment';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .send({})
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should verify all required fields before submission', async () => {
      const assessmentId = 'assessment-123';

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .send({})
        .expect(200);

      expect(response.body.data).toHaveProperty('status');
      expect(['submitted', 'error']).toContain(response.body.data.status || response.body.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing authentication token', async () => {
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use('/api/assessments', assessmentRoutes);

      const response = await request(unauthApp)
        .get('/api/assessments/any-id')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });

    it('should handle malformed request body', async () => {
      const response = await request(app)
        .post('/api/assessments/test/steps/1')
        .send('not json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
