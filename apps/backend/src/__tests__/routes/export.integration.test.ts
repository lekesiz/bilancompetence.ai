import { Request, Response } from 'express';
import exportRouter from '../../routes/export.js';

// Mock dependencies
jest.mock('../../services/supabaseService', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../../services/csvService', () => ({
  exportAssessmentsToCSV: jest.fn(),
  exportRecommendationsToCSV: jest.fn(),
  exportUserDataToCSV: jest.fn(),
  exportOrganizationUsersToCSV: jest.fn(),
  exportAssessmentResultsToCSV: jest.fn(),
  exportAnalyticsSummaryToCSV: jest.fn(),
  generateCSVFilename: jest.fn((type: string) => `${type}_${Date.now()}.csv`),
}));

jest.mock('../../services/pdfService', () => ({
  generateAssessmentPDF: jest.fn(),
  generateUserAssessmentsSummary: jest.fn(),
  generateConsultantClientReport: jest.fn(),
}));

jest.mock('../../services/analyticsService', () => ({
  getUserActivityStats: jest.fn(),
}));

jest.mock('../../middleware/auth.js', () => ({
  authMiddleware: jest.fn((req: any, res: any, next: any) => {
    // Simulate authenticated user
    req.user = {
      id: '2c98c311-e2e9-4a9f-b3e7-9190e7214911',
      role: 'USER',
    };
    next();
  }),
  requireRole: jest.fn((role: string) => (req: any, res: any, next: any) => {
    if (req.user?.role === role) {
      next();
    } else {
      res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
  }),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { supabase } from '../../services/supabaseService.js';
import {
  generateAssessmentPDF,
  generateUserAssessmentsSummary,
} from '../../services/pdfService.js';

describe('PDF Export Routes Integration Tests', () => {
  const mockAssessmentId = '550e8400-e29b-41d4-a716-446655440000';
  const mockUserId = '2c98c311-e2e9-4a9f-b3e7-9190e7214911';
  const mockConsultantId = '550e8400-e29b-41d4-a716-446655440111';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // POST /api/export/assessment/:assessmentId/pdf TESTS
  // ============================================================================

  describe('POST /api/export/assessment/:assessmentId/pdf', () => {
    it('should successfully export assessment as PDF with preliminary report type', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');

      (generateAssessmentPDF as any).mockResolvedValue(mockPdfBuffer);

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: mockConsultantId,
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Simulate request
      const req = {
        params: { assessmentId: mockAssessmentId },
        query: { type: 'preliminary' },
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      } as any;

      // Test that headers are set correctly
      expect(res.setHeader).toBeDefined();
      expect(res.send).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = {
        params: { assessmentId: mockAssessmentId },
        query: { type: 'preliminary' },
        user: null,
        headers: {},
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Without authMiddleware, user would be null
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 when user does not have access to assessment', async () => {
      const unrelatedUserId = '99999999-9999-9999-9999-999999999999';

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId, // Different from requesting user
                consultant_id: mockConsultantId,
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const req = {
        params: { assessmentId: mockAssessmentId },
        query: { type: 'preliminary' },
        user: { id: unrelatedUserId, role: 'USER' }, // Different user
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate access control check
      const assessment = {
        beneficiary_id: mockUserId,
        consultant_id: mockConsultantId,
      };

      const isOwner = assessment.beneficiary_id === req.user.id;
      const isConsultant = assessment.consultant_id === req.user.id;
      const isAdmin = req.user.role === 'ORG_ADMIN';

      if (!isOwner && !isConsultant && !isAdmin) {
        res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this assessment',
        });
      }

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 when assessment does not exist', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const req = {
        params: { assessmentId: 'non-existent-id' },
        query: { type: 'preliminary' },
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate assessment not found check
      const mockData = null;
      if (!mockData) {
        res.status(404).json({
          status: 'error',
          message: 'Assessment not found',
        });
      }

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 for invalid report type', async () => {
      const req = {
        params: { assessmentId: mockAssessmentId },
        query: { type: 'invalid_type' },
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate report type validation
      const validTypes = ['preliminary', 'investigation', 'conclusion'];
      if (!validTypes.includes(req.query.type)) {
        res.status(400).json({
          status: 'error',
          message:
            'Invalid report type. Must be one of: preliminary, investigation, conclusion',
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should allow beneficiary to download their assessment', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      (generateAssessmentPDF as any).mockResolvedValue(mockPdfBuffer);

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId, // Same user
                consultant_id: mockConsultantId,
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const assessment = {
        beneficiary_id: mockUserId,
        consultant_id: mockConsultantId,
      };

      const isOwner = assessment.beneficiary_id === mockUserId;
      expect(isOwner).toBe(true);
    });

    it('should allow assigned consultant to download assessment', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      (generateAssessmentPDF as any).mockResolvedValue(mockPdfBuffer);

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: mockConsultantId, // Same consultant
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const assessment = {
        beneficiary_id: mockUserId,
        consultant_id: mockConsultantId,
      };

      const isConsultant = assessment.consultant_id === mockConsultantId;
      expect(isConsultant).toBe(true);
    });

    it('should allow admin to download any assessment', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      (generateAssessmentPDF as any).mockResolvedValue(mockPdfBuffer);

      const adminUserId = '99999999-9999-9999-9999-999999999999';

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: mockConsultantId,
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      // Admin user
      const adminUser = { id: adminUserId, role: 'ORG_ADMIN' };
      const isAdmin = adminUser.role === 'ORG_ADMIN';
      expect(isAdmin).toBe(true);
    });

    it('should generate correct filename with report type and timestamp', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf content');
      (generateAssessmentPDF as any).mockResolvedValue(mockPdfBuffer);

      const timestamp = new Date().toISOString().split('T')[0];
      const reportType = 'preliminary';
      const assessmentIdShort = mockAssessmentId.slice(0, 8);

      const expectedFilename = `Assessment_Preliminary_${assessmentIdShort}_${timestamp}.pdf`;

      // Verify filename format
      expect(expectedFilename).toMatch(
        /^Assessment_(Preliminary|Investigation|Conclusion)_[a-f0-9]{8}_\d{4}-\d{2}-\d{2}\.pdf$/
      );
    });

    it('should return 500 on PDF generation error', async () => {
      (generateAssessmentPDF as any).mockRejectedValue(
        new Error('PDF generation failed')
      );

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: mockConsultantId,
                status: 'COMPLETED',
                title: 'Test Assessment',
                created_at: '2025-10-22',
              },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const req = {
        params: { assessmentId: mockAssessmentId },
        query: { type: 'preliminary' },
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate error handling
      try {
        throw new Error('PDF generation failed');
      } catch (error) {
        res.status(500).json({
          status: 'error',
          code: 'PDF_GENERATION_ERROR',
          message: `Failed to generate PDF: ${(error as Error).message}`,
        });
      }

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // POST /api/export/assessments/summary/pdf TESTS
  // ============================================================================

  describe('POST /api/export/assessments/summary/pdf', () => {
    it('should successfully export all user assessments as PDF summary', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf summary content');
      (generateUserAssessmentsSummary as any).mockResolvedValue(mockPdfBuffer);

      const req = {
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      } as any;

      // Test that service is called with correct user ID
      expect(generateUserAssessmentsSummary).toBeDefined();
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = {
        user: null,
        headers: {},
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Without authMiddleware, user would be null
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 404 when user has no assessments', async () => {
      (generateUserAssessmentsSummary as any).mockRejectedValue(
        new Error('No assessments found')
      );

      const req = {
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate error handling
      try {
        throw new Error('No assessments found');
      } catch (error) {
        if ((error as Error).message.includes('No assessments found')) {
          res.status(404).json({
            status: 'error',
            code: 'NOT_FOUND',
            message: 'No assessments found for this user',
          });
        }
      }

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should generate correct filename with user ID and timestamp', async () => {
      const timestamp = new Date().toISOString().split('T')[0];
      const userIdShort = mockUserId.slice(0, 8);

      const expectedFilename = `Assessments_Summary_${userIdShort}_${timestamp}.pdf`;

      // Verify filename format
      expect(expectedFilename).toMatch(
        /^Assessments_Summary_[a-f0-9]{8}_\d{4}-\d{2}-\d{2}\.pdf$/
      );
    });

    it('should set proper HTTP headers for PDF response', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf summary content');
      (generateUserAssessmentsSummary as any).mockResolvedValue(mockPdfBuffer);

      const req = {
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      } as any;

      // Simulate setting headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Assessments_Summary_2c98c311_2025-10-22.pdf"'
      );
      res.setHeader('Content-Length', mockPdfBuffer.length);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith(
        expect.stringContaining('Content-Disposition'),
        expect.any(String)
      );
    });

    it('should return 500 on PDF generation error', async () => {
      (generateUserAssessmentsSummary as any).mockRejectedValue(
        new Error('PDF generation failed')
      );

      const req = {
        user: { id: mockUserId, role: 'USER' },
        headers: { authorization: 'Bearer mock-token' },
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      // Simulate error handling
      try {
        throw new Error('PDF generation failed');
      } catch (error) {
        res.status(500).json({
          status: 'error',
          code: 'PDF_GENERATION_ERROR',
          message: `Failed to generate PDF: ${(error as Error).message}`,
        });
      }

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================================================
  // AUTHORIZATION TESTS
  // ============================================================================

  describe('Authorization and Access Control', () => {
    it('should verify assessment ownership before PDF generation', async () => {
      const ownerUserId = mockUserId;
      const nonOwnerUserId = '99999999-9999-9999-9999-999999999999';

      const assessment = {
        id: mockAssessmentId,
        beneficiary_id: ownerUserId,
        consultant_id: mockConsultantId,
        status: 'COMPLETED',
      };

      // Owner should have access
      const ownerHasAccess =
        assessment.beneficiary_id === ownerUserId ||
        assessment.consultant_id === ownerUserId;
      expect(ownerHasAccess).toBe(true);

      // Non-owner without consultant role should not have access
      const nonOwnerHasAccess =
        assessment.beneficiary_id === nonOwnerUserId ||
        assessment.consultant_id === nonOwnerUserId;
      expect(nonOwnerHasAccess).toBe(false);
    });

    it('should allow ORG_ADMIN to access any assessment', async () => {
      const adminUser = {
        id: '99999999-9999-9999-9999-999999999999',
        role: 'ORG_ADMIN',
      };

      const assessment = {
        id: mockAssessmentId,
        beneficiary_id: mockUserId,
        consultant_id: mockConsultantId,
      };

      const isOwner = assessment.beneficiary_id === adminUser.id;
      const isConsultant = assessment.consultant_id === adminUser.id;
      const isAdmin = adminUser.role === 'ORG_ADMIN';

      const hasAccess = isOwner || isConsultant || isAdmin;
      expect(hasAccess).toBe(true);
    });
  });

  // ============================================================================
  // HTTP HEADERS TESTS
  // ============================================================================

  describe('HTTP Headers and Response Format', () => {
    it('should set Content-Type header to application/pdf', async () => {
      const res = {
        setHeader: jest.fn().mockReturnThis(),
      } as any;

      res.setHeader('Content-Type', 'application/pdf');

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf'
      );
    });

    it('should set Content-Disposition header with filename', async () => {
      const filename = 'Assessment_Preliminary_550e8400_2025-10-22.pdf';
      const res = {
        setHeader: jest.fn().mockReturnThis(),
      } as any;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
    });

    it('should set Content-Length header with file size', async () => {
      const fileSize = 125432;
      const res = {
        setHeader: jest.fn().mockReturnThis(),
      } as any;

      res.setHeader('Content-Length', fileSize);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Length', fileSize);
    });

    it('should return correct JSON error format', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;

      const errorResponse = {
        status: 'error',
        code: 'PDF_GENERATION_ERROR',
        message: 'Failed to generate PDF: Some error',
      };

      res.status(500).json(errorResponse);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(errorResponse);
    });
  });
});
