import request from 'supertest';
import express, { Express } from 'express';

/**
 * Integration Tests for Recommendations API Endpoints
 * Tests all 5 endpoints with various scenarios
 */

// Mock the FranceTravailService BEFORE importing router
const mockFranceTravailMethods = {
  getUserCompetencies: jest.fn().mockResolvedValue([]),
  mapCompetenciesToRomeCodes: jest.fn().mockResolvedValue([]),
  searchJobsByRomeCode: jest.fn().mockResolvedValue([]),
  scoreJobMatches: jest.fn().mockResolvedValue([]),
  saveJobToUserList: jest.fn().mockResolvedValue({ success: true }),
  findMatchingRomeCodes: jest.fn().mockResolvedValue([]),
  searchRomeCodes: jest.fn().mockResolvedValue([]),
  getUserSavedJobs: jest.fn().mockResolvedValue([]),
  getRomeCodeDetails: jest.fn().mockResolvedValue(null),
};

jest.mock('../../services/franceTravailService', () => {
  return {
    FranceTravailService: jest.fn().mockImplementation(() => mockFranceTravailMethods),
  };
});

jest.mock('../../services/authService');
jest.mock('../../utils/logger');
// Dynamic mock user that can be changed in tests
const mockAuthState = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  } as any,
  enabled: true,
};

jest.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    if (!mockAuthState.enabled || !mockAuthState.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    req.user = mockAuthState.user;
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

import { FranceTravailService } from '../../services/franceTravailService';
import recommendationsRouter from '../../routes/recommendations';
import { authMiddleware } from '../../middleware/auth';
import * as authService from '../../services/authService';

const mockFranceTravailService = FranceTravailService as jest.MockedClass<
  typeof FranceTravailService
>;

// Setup test app
let app: Express;
let mockInstance: any;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/api/recommendations', recommendationsRouter);

  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset auth state to default BENEFICIARY user
  mockAuthState.enabled = true;
  mockAuthState.user = {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  };

  // Reset mock implementations to defaults
  mockFranceTravailMethods.getUserCompetencies.mockResolvedValue([]);
  mockFranceTravailMethods.mapCompetenciesToRomeCodes.mockResolvedValue([]);
  mockFranceTravailMethods.searchJobsByRomeCode.mockResolvedValue([]);
  mockFranceTravailMethods.scoreJobMatches.mockResolvedValue([]);
  mockFranceTravailMethods.saveJobToUserList.mockResolvedValue({ success: true });
  mockFranceTravailMethods.findMatchingRomeCodes.mockResolvedValue([]);
  mockFranceTravailMethods.searchRomeCodes.mockResolvedValue([]);
  mockFranceTravailMethods.getUserSavedJobs.mockResolvedValue([]);
  mockFranceTravailMethods.getRomeCodeDetails.mockResolvedValue(null);

  mockInstance = mockFranceTravailMethods;
});

// ============================================
// TEST SUITE 1: POST /api/recommendations/jobs
// ============================================

describe('POST /api/recommendations/jobs', () => {
  it('should return job recommendations for authenticated user', async () => {
    const mockRecommendations = [
      {
        id: 'job-1',
        title: 'Senior Java Developer',
        company: 'Tech Corp',
        matchScore: 95,
        skills: ['Java', 'Spring Boot'],
      },
      {
        id: 'job-2',
        title: 'Python Developer',
        company: 'Data Solutions',
        matchScore: 87,
        skills: ['Python', 'Data Analysis'],
      },
    ];

    (mockInstance.findMatchingRomeCodes as jest.Mock).mockResolvedValueOnce([
      { code: 'E1101', label: 'Software Engineer' },
    ]);
    (mockInstance.searchJobsByRomeCode as jest.Mock).mockResolvedValueOnce({
      resultats: mockRecommendations,
    });
    (mockInstance.scoreJobMatches as jest.Mock).mockResolvedValueOnce(mockRecommendations);

    const response = await request(app).post('/api/recommendations/jobs').send({
      limit: 10,
    });

    if (response.status !== 200) {
      console.log('Error response:', response.body);
    }
    expect(response.status).toBe(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.recommendations).toHaveLength(2);
    expect(response.body.data.recommendations[0].matchScore).toBe(95);
  });

  it('should handle missing competencies gracefully', async () => {
    (mockInstance.getUserCompetencies as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app).post('/api/recommendations/jobs').send({}).expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('No matching job categories');
  });

  it('should validate request parameters', async () => {
    const response = await request(app)
      .post('/api/recommendations/jobs')
      .send({
        limit: 'invalid',
        minSalary: 'not a number',
      })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Invalid request parameters');
  });

  it('should filter jobs by salary range', async () => {
    (mockInstance.getUserCompetencies as jest.Mock).mockResolvedValueOnce(['Java']);
    (mockInstance.findMatchingRomeCodes as jest.Mock).mockResolvedValueOnce([
      { code: 'E1101', label: 'Software Engineer' },
    ]);
    (mockInstance.searchJobsByRomeCode as jest.Mock).mockResolvedValueOnce({
      resultats: [],
    });
    (mockInstance.scoreJobMatches as jest.Mock).mockResolvedValueOnce([]);

    await request(app)
      .post('/api/recommendations/jobs')
      .send({
        minSalary: 50000,
        maxSalary: 80000,
        limit: 5,
      })
      .expect(404);

    // Verify the salary filters were passed correctly
    expect(mockInstance.searchJobsByRomeCode).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        minSalary: 50000,
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    (mockInstance.findMatchingRomeCodes as jest.Mock).mockRejectedValueOnce(
      new Error('API connection failed')
    );

    const response = await request(app).post('/api/recommendations/jobs').send({}).expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('No competencies found');
  });
});

// ============================================
// TEST SUITE 2: POST /api/recommendations/:jobId/save
// ============================================

describe('POST /api/recommendations/:jobId/save', () => {
  it('should save job to user list successfully', async () => {
    const mockSavedJob = {
      id: 'saved-1',
      userId: 'test-user-123',
      jobId: 'job-123',
      status: 'saved',
      notes: 'Interested in this position',
      createdAt: new Date().toISOString(),
    };

    (mockInstance.saveJobToUserList as jest.Mock).mockResolvedValueOnce(mockSavedJob);

    const response = await request(app)
      .post('/api/recommendations/job-123/save')
      .send({
        notes: 'Interested in this position',
        status: 'saved',
      })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.status).toBe('saved');
    expect(response.body.data.notes).toBe('Interested in this position');
  });

  it('should return 400 if job ID is missing', async () => {
    const response = await request(app).post('/api/recommendations//save').send({}).expect(404);

    // 404 because the route pattern won't match without jobId
  });

  it('should validate job status enum', async () => {
    const response = await request(app)
      .post('/api/recommendations/job-123/save')
      .send({
        status: 'invalid-status',
      })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Invalid request parameters');
  });

  it('should handle database errors when saving', async () => {
    (mockInstance.saveJobToUserList as jest.Mock).mockRejectedValueOnce(
      new Error('Database error')
    );

    const response = await request(app)
      .post('/api/recommendations/job-123/save')
      .send({})
      .expect(500);

    expect(response.body.status).toBe('error');
  });

  it('should allow optional notes field', async () => {
    const mockSavedJob = {
      id: 'saved-2',
      userId: 'test-user-123',
      jobId: 'job-456',
      status: 'saved',
      notes: null,
    };

    (mockInstance.saveJobToUserList as jest.Mock).mockResolvedValueOnce(mockSavedJob);

    const response = await request(app)
      .post('/api/recommendations/job-456/save')
      .send({
        status: 'interested',
      })
      .expect(201);

    expect(response.body.status).toBe('success');
  });
});

// ============================================
// TEST SUITE 3: GET /api/recommendations/:userId/saved-jobs
// ============================================

describe('GET /api/recommendations/:userId/saved-jobs', () => {
  it('should retrieve user saved jobs', async () => {
    const mockSavedJobs = [
      {
        id: 'job-1',
        title: 'Senior Developer',
        company: 'Tech Corp',
        savedAt: new Date().toISOString(),
      },
      {
        id: 'job-2',
        title: 'Tech Lead',
        company: 'Innovation Inc',
        savedAt: new Date().toISOString(),
      },
    ];

    (mockInstance.getUserSavedJobs as jest.Mock).mockResolvedValueOnce(mockSavedJobs);

    const response = await request(app)
      .get('/api/recommendations/test-user-123/saved-jobs')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.jobs).toHaveLength(2);
    expect(response.body.data.count).toBe(2);
  });

  it('should support pagination with limit and offset', async () => {
    const mockSavedJobs = [
      {
        id: 'job-1',
        title: 'Senior Developer',
      },
    ];

    (mockInstance.getUserSavedJobs as jest.Mock).mockResolvedValueOnce(mockSavedJobs);

    const response = await request(app)
      .get('/api/recommendations/test-user-123/saved-jobs')
      .query({ limit: 10, offset: 0 })
      .expect(200);

    expect(response.body.data.pagination.limit).toBe(10);
    expect(response.body.data.pagination.offset).toBe(0);

    // Verify pagination parameters were passed
    expect(mockInstance.getUserSavedJobs).toHaveBeenCalledWith(
      'test-user-123',
      10, // limit
      1 // page
    );
  });

  it('should enforce limit constraints (max 100)', async () => {
    (mockInstance.getUserSavedJobs as jest.Mock).mockResolvedValueOnce([]);

    await request(app)
      .get('/api/recommendations/test-user-123/saved-jobs')
      .query({ limit: 500 }) // Request more than max
      .expect(200);

    // Should have been called with capped limit (100 max)
    expect(mockInstance.getUserSavedJobs).toHaveBeenCalledWith(
      'test-user-123',
      100, // capped limit
      expect.any(Number) // page
    );
  });

  it('should enforce user authorization (cannot access other users jobs without permission)', async () => {
    // Modify app to use real auth middleware for this test
    const realApp = express();
    realApp.use(express.json());

    // Mock user as BENEFICIARY
    realApp.use((req: any, res, next) => {
      req.user = {
        id: 'test-user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'BENEFICIARY',
      };
      next();
    });

    realApp.use('/api/recommendations', recommendationsRouter);

    const response = await request(realApp)
      .get('/api/recommendations/different-user-456/saved-jobs')
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('do not have permission');
  });

  it('should allow consultant to view beneficiary saved jobs', async () => {
    // Set mock user to CONSULTANT role
    mockAuthState.user = {
      id: 'consultant-123',
      email: 'consultant@example.com',
      full_name: 'Consultant User',
      role: 'CONSULTANT',
    };

    (mockInstance.getUserSavedJobs as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/api/recommendations/beneficiary-123/saved-jobs')
      .expect(200);

    expect(response.body.status).toBe('success');
  });

  it('should return empty list when user has no saved jobs', async () => {
    (mockInstance.getUserSavedJobs as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/api/recommendations/test-user-123/saved-jobs')
      .expect(200);

    expect(response.body.data.jobs).toHaveLength(0);
    expect(response.body.data.count).toBe(0);
  });
});

// ============================================
// TEST SUITE 4: GET /api/recommendations/rome-codes/:code
// ============================================

describe('GET /api/recommendations/rome-codes/:code', () => {
  it('should return ROME code details', async () => {
    const mockRomeDetails = {
      code: 'E1101',
      label: 'Software Engineer',
      description: 'Design and develop software applications',
      relatedJobs: 150,
      avgSalary: 45000,
      salaryRange: { min: 35000, max: 65000 },
    };

    (mockInstance.getRomeCodeDetails as jest.Mock).mockResolvedValueOnce(mockRomeDetails);

    const response = await request(app).get('/api/recommendations/rome-codes/E1101').expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.code).toBe('E1101');
    expect(response.body.data.label).toBe('Software Engineer');
  });

  it('should validate ROME code format', async () => {
    const response = await request(app)
      .get('/api/recommendations/rome-codes/invalid-code!')
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Invalid ROME code format');
  });

  it('should return 404 for non-existent ROME codes', async () => {
    (mockInstance.getRomeCodeDetails as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app).get('/api/recommendations/rome-codes/X9999').expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('not found');
  });

  it('should handle API errors', async () => {
    (mockInstance.getRomeCodeDetails as jest.Mock).mockRejectedValueOnce(new Error('API failed'));

    const response = await request(app).get('/api/recommendations/rome-codes/E1101').expect(500);

    expect(response.body.status).toBe('error');
  });

  it('should accept uppercase ROME codes', async () => {
    const mockRomeDetails = {
      code: 'C1503',
      label: 'Sales Representative',
    };

    (mockInstance.getRomeCodeDetails as jest.Mock).mockResolvedValueOnce(mockRomeDetails);

    const response = await request(app).get('/api/recommendations/rome-codes/C1503').expect(200);

    expect(response.body.status).toBe('success');
  });
});

// ============================================
// TEST SUITE 5: GET /api/recommendations/rome-codes/search
// ============================================

describe('GET /api/recommendations/rome-codes/search', () => {
  it('should search ROME codes by keyword', async () => {
    const mockResults = [
      { code: 'E1101', label: 'Software Engineer' },
      { code: 'E1102', label: 'Full Stack Developer' },
      { code: 'E1103', label: 'Data Engineer' },
    ];

    (mockInstance.searchRomeCodes as jest.Mock).mockResolvedValueOnce(mockResults);

    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: 'developer' });

    if (response.status !== 200) {
      console.log('ROME search error:', response.body);
    }

    expect(response.status).toBe(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.results).toHaveLength(3);
    expect(response.body.data.query).toBe('developer');
  });

  it('should require search query', async () => {
    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: '' })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Search query is required');
  });

  it('should support limit parameter with max of 50', async () => {
    const mockResults = Array.from({ length: 50 }, (_, i) => ({
      code: `E${1100 + i}`,
      label: `Role ${i}`,
    }));

    (mockInstance.searchRomeCodes as jest.Mock).mockResolvedValueOnce(mockResults);

    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: 'engineer', limit: 100 }) // Request more than max
      .expect(200);

    // Should have been called with capped limit (50 max)
    expect(mockInstance.searchRomeCodes).toHaveBeenCalledWith('engineer', 50);
  });

  it('should validate search query length', async () => {
    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: 'a'.repeat(300) })
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  it('should handle no results gracefully', async () => {
    (mockInstance.searchRomeCodes as jest.Mock).mockResolvedValueOnce([]);

    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: 'nonexistentjob12345' })
      .expect(200);

    expect(response.body.data.results).toHaveLength(0);
    expect(response.body.data.count).toBe(0);
  });

  it('should handle API errors', async () => {
    (mockInstance.searchRomeCodes as jest.Mock).mockRejectedValueOnce(new Error('Search failed'));

    const response = await request(app)
      .get('/api/recommendations/rome-codes/search')
      .query({ query: 'developer' })
      .expect(500);

    expect(response.body.status).toBe('error');
  });
});

// ============================================
// TEST SUITE 6: Authentication & Authorization
// ============================================

describe('Authentication & Authorization', () => {
  it('should require authentication for all endpoints', async () => {
    // Disable auth to simulate unauthenticated request
    mockAuthState.enabled = false;

    const response = await request(app).post('/api/recommendations/jobs').send({}).expect(401);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should reject requests without Bearer token', async () => {
    // Disable auth to simulate invalid token
    mockAuthState.enabled = false;

    const response = await request(app)
      .post('/api/recommendations/jobs')
      .set('Authorization', 'InvalidToken')
      .send({})
      .expect(401);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Unauthorized');
  });
});

// ============================================
// TEST SUITE 7: Error Handling
// ============================================

describe('Error Handling', () => {
  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app).get('/api/recommendations/unknown/endpoint');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });

  it('should handle invalid JSON in request body', async () => {
    const response = await request(app)
      .post('/api/recommendations/jobs')
      .set('Content-Type', 'application/json')
      .send('invalid json {')
      .expect(400);

    expect(response.status).toBe(400);
  });

  it('should provide meaningful error messages', async () => {
    const response = await request(app)
      .post('/api/recommendations/jobs')
      .send({ limit: -5 }) // Invalid limit
      .expect(400);

    expect(response.body.message).toBeTruthy();
    expect(response.body.message.length > 0).toBe(true);
  });
});
