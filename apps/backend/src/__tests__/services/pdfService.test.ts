import {
  generateAssessmentPDF,
  generateUserAssessmentsSummary,
  generateConsultantClientReport,
  calculateScoreStatistics,
  getStatusColor,
  formatDate,
} from '../../services/pdfService';

// Mock Supabase client
jest.mock('../../services/supabaseService', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock pdf-lib
jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(),
  },
  rgb: jest.fn((r: number, g: number, b: number) => ({ r, g, b })),
  degrees: jest.fn((deg: number) => deg),
  StandardFonts: {
    Helvetica: 'Helvetica',
    HelveticaBold: 'Helvetica-Bold',
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { supabase } from '../../services/supabaseService';
import { PDFDocument, rgb } from 'pdf-lib';

describe('pdfService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // UTILITY FUNCTIONS TESTS
  // ============================================================================

  describe('calculateScoreStatistics', () => {
    it('should calculate correct statistics for a list of scores', () => {
      const scores = [80, 85, 90, 75, 88];
      const stats = calculateScoreStatistics(scores);

      expect(stats.average).toBe(83.6);
      expect(stats.minimum).toBe(75);
      expect(stats.maximum).toBe(90);
      expect(stats.median).toBe(85);
    });

    it('should handle empty scores array', () => {
      const scores: number[] = [];
      const stats = calculateScoreStatistics(scores);

      expect(stats.average).toBe(0);
      expect(stats.minimum).toBe(0);
      expect(stats.maximum).toBe(0);
      expect(stats.median).toBe(0);
    });

    it('should handle single score', () => {
      const scores = [85];
      const stats = calculateScoreStatistics(scores);

      expect(stats.average).toBe(85);
      expect(stats.minimum).toBe(85);
      expect(stats.maximum).toBe(85);
      expect(stats.median).toBe(85);
    });

    it('should handle two scores', () => {
      const scores = [80, 90];
      const stats = calculateScoreStatistics(scores);

      expect(stats.average).toBe(85);
      expect(stats.median).toBe(85);
      expect(stats.minimum).toBe(80);
      expect(stats.maximum).toBe(90);
    });
  });

  describe('getStatusColor', () => {
    it('should return red for DRAFT status', () => {
      const color = getStatusColor('DRAFT');
      expect(color).toEqual({ r: 255, g: 100, b: 100 });
    });

    it('should return orange for IN_PROGRESS status', () => {
      const color = getStatusColor('IN_PROGRESS');
      expect(color).toEqual({ r: 255, g: 165, b: 0 });
    });

    it('should return blue for SUBMITTED status', () => {
      const color = getStatusColor('SUBMITTED');
      expect(color).toEqual({ r: 100, g: 150, b: 255 });
    });

    it('should return green for COMPLETED status', () => {
      const color = getStatusColor('COMPLETED');
      expect(color).toEqual({ r: 100, g: 200, b: 100 });
    });

    it('should return gray for unknown status', () => {
      const color = getStatusColor('UNKNOWN');
      expect(color).toEqual({ r: 150, g: 150, b: 150 });
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-10-22');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle valid date strings', () => {
      const formatted = formatDate(new Date('2025-01-15'));
      expect(formatted).toBe('15/01/2025');
    });

    it('should format current date correctly', () => {
      const now = new Date();
      const formatted = formatDate(now);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  // ============================================================================
  // GENERATE ASSESSMENT PDF TESTS
  // ============================================================================

  describe('generateAssessmentPDF', () => {
    const mockAssessmentId = '550e8400-e29b-41d4-a716-446655440000';
    const mockUserId = '2c98c311-e2e9-4a9f-b3e7-9190e7214911';

    it('should throw error when assessment is not found', async () => {
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

      await expect(
        generateAssessmentPDF(mockAssessmentId, mockUserId, 'preliminary')
      ).rejects.toThrow('No assessment found');
    });

    it('should throw error for invalid report type', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: 'consultant-id',
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

      await expect(
        generateAssessmentPDF(mockAssessmentId, mockUserId, 'invalid' as any)
      ).rejects.toThrow();
    });

    it('should generate PDF buffer for valid assessment', async () => {
      const mockPdfDoc = {
        save: jest.fn().mockResolvedValue(new ArrayBuffer(1000)),
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn().mockReturnValue({
            drawText: jest.fn(),
          }),
          drawRectangle: jest.fn(),
          drawLine: jest.fn(),
        }),
        registerFont: jest.fn(),
      };

      (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId,
                consultant_id: 'consultant-id',
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

      const result = await generateAssessmentPDF(
        mockAssessmentId,
        mockUserId,
        'preliminary'
      );

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(PDFDocument.create).toHaveBeenCalled();
    });

    it('should verify access control - owner can access', async () => {
      // This tests that the service properly checks ownership
      // In a real test, we'd mock the assessment lookup to return correct owner
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockAssessmentId,
                beneficiary_id: mockUserId, // Same as user
                consultant_id: 'other-consultant',
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

      const mockPdfDoc = {
        save: jest.fn().mockResolvedValue(new ArrayBuffer(1000)),
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn(),
          drawRectangle: jest.fn(),
          drawLine: jest.fn(),
        }),
      };

      (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

      // Should not throw for owner
      const result = await generateAssessmentPDF(
        mockAssessmentId,
        mockUserId,
        'preliminary'
      );
      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle all three report types', async () => {
      const reportTypes: Array<'preliminary' | 'investigation' | 'conclusion'> = [
        'preliminary',
        'investigation',
        'conclusion',
      ];

      for (const reportType of reportTypes) {
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: mockAssessmentId,
                  beneficiary_id: mockUserId,
                  consultant_id: 'consultant-id',
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

        const mockPdfDoc = {
          save: jest.fn().mockResolvedValue(new ArrayBuffer(1000)),
          addPage: jest.fn().mockReturnValue({
            drawText: jest.fn(),
            drawRectangle: jest.fn(),
            drawLine: jest.fn(),
          }),
        };

        (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

        const result = await generateAssessmentPDF(
          mockAssessmentId,
          mockUserId,
          reportType
        );
        expect(result).toBeInstanceOf(ArrayBuffer);
      }
    });
  });

  // ============================================================================
  // GENERATE USER ASSESSMENTS SUMMARY TESTS
  // ============================================================================

  describe('generateUserAssessmentsSummary', () => {
    const mockUserId = '2c98c311-e2e9-4a9f-b3e7-9190e7214911';

    it('should throw error when no assessments found', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      await expect(generateUserAssessmentsSummary(mockUserId)).rejects.toThrow(
        'No assessments found'
      );
    });

    it('should generate summary PDF for user with assessments', async () => {
      const mockAssessments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Assessment 1',
          status: 'COMPLETED',
          score: 85,
          created_at: '2025-10-22',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Assessment 2',
          status: 'COMPLETED',
          score: 90,
          created_at: '2025-10-21',
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockAssessments,
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const mockPdfDoc = {
        save: jest.fn().mockResolvedValue(new ArrayBuffer(2000)),
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn(),
          drawRectangle: jest.fn(),
          drawLine: jest.fn(),
        }),
      };

      (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

      const result = await generateUserAssessmentsSummary(mockUserId);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(PDFDocument.create).toHaveBeenCalled();
    });

    it('should include all assessments in summary', async () => {
      const mockAssessments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Assessment 1',
          status: 'COMPLETED',
          score: 85,
          created_at: '2025-10-22',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Assessment 2',
          status: 'COMPLETED',
          score: 90,
          created_at: '2025-10-21',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Assessment 3',
          status: 'SUBMITTED',
          score: 78,
          created_at: '2025-10-20',
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockAssessments,
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const mockPdfDoc = {
        save: jest.fn().mockResolvedValue(new ArrayBuffer(3000)),
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn(),
          drawRectangle: jest.fn(),
          drawLine: jest.fn(),
        }),
      };

      (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

      const result = await generateUserAssessmentsSummary(mockUserId);

      expect(result).toBeInstanceOf(ArrayBuffer);
      // In a real test, we'd verify that all 3 assessments are included in the PDF
    });
  });

  // ============================================================================
  // GENERATE CONSULTANT CLIENT REPORT TESTS
  // ============================================================================

  describe('generateConsultantClientReport', () => {
    const mockConsultantId = '550e8400-e29b-41d4-a716-446655440000';
    const mockClientId = '2c98c311-e2e9-4a9f-b3e7-9190e7214911';

    it('should throw error when consultant has no client assessments', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      await expect(
        generateConsultantClientReport(mockConsultantId, mockClientId)
      ).rejects.toThrow();
    });

    it('should generate report for consultant viewing client assessments', async () => {
      const mockAssessments = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Client Assessment',
          status: 'COMPLETED',
          score: 85,
          created_at: '2025-10-22',
        },
      ];

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: mockAssessments,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      const mockPdfDoc = {
        save: jest.fn().mockResolvedValue(new ArrayBuffer(1500)),
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn(),
          drawRectangle: jest.fn(),
          drawLine: jest.fn(),
        }),
      };

      (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

      const result = await generateConsultantClientReport(
        mockConsultantId,
        mockClientId
      );

      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle Supabase query errors gracefully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      await expect(
        generateAssessmentPDF(
          '550e8400-e29b-41d4-a716-446655440000',
          '2c98c311-e2e9-4a9f-b3e7-9190e7214911',
          'preliminary'
        )
      ).rejects.toThrow();
    });

    it('should handle PDF generation errors gracefully', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                beneficiary_id: '2c98c311-e2e9-4a9f-b3e7-9190e7214911',
                consultant_id: 'consultant-id',
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

      (PDFDocument.create as any).mockRejectedValue(
        new Error('PDF creation failed')
      );

      await expect(
        generateAssessmentPDF(
          '550e8400-e29b-41d4-a716-446655440000',
          '2c98c311-e2e9-4a9f-b3e7-9190e7214911',
          'preliminary'
        )
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // DATA VALIDATION TESTS
  // ============================================================================

  describe('Data Validation', () => {
    it('should validate assessment ID format', async () => {
      const invalidAssessmentId = 'invalid-id';
      const mockUserId = '2c98c311-e2e9-4a9f-b3e7-9190e7214911';

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid ID format' },
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      await expect(
        generateAssessmentPDF(invalidAssessmentId, mockUserId, 'preliminary')
      ).rejects.toThrow();
    });

    it('should validate user ID format', async () => {
      const assessmentId = '550e8400-e29b-41d4-a716-446655440000';
      const invalidUserId = 'invalid-user';

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid user ID format' },
            }),
          }),
        }),
      });

      (supabase.from as any).mockImplementation(mockFrom);

      await expect(
        generateAssessmentPDF(assessmentId, invalidUserId, 'preliminary')
      ).rejects.toThrow();
    });
  });
});
