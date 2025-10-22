/**
 * Assessment Detail Page - PDF Download Functionality Tests
 * Tests for handleDownloadPDF and canDownloadPDF functions
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssessmentPage from '@/app/(protected)/assessments/[id]/page';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('AssessmentPage - PDF Download Functionality', () => {
  const mockAssessmentId = '550e8400-e29b-41d4-a716-446655440000';
  const mockToken = 'mock-jwt-token';

  const mockAssessment = {
    id: mockAssessmentId,
    title: 'Career Assessment',
    description: 'Comprehensive career assessment',
    status: 'COMPLETED',
    assessment_type: 'comprehensive',
    current_step: 5,
    progress_percentage: 100,
    created_at: '2025-10-01T10:00:00Z',
    submitted_at: '2025-10-15T14:30:00Z',
    completed_at: '2025-10-20T09:00:00Z',
    competencies: [
      {
        id: '1',
        skill_name: 'Project Management',
        category: 'technical',
        self_assessment_level: 4,
        self_interest_level: 9,
      },
    ],
  };

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'BENEFICIARY',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('accessToken', mockToken);

    (useParams as jest.Mock).mockReturnValue({
      id: mockAssessmentId,
    });

    (useRouter as jest.Mock).mockReturnValue({
      back: jest.fn(),
      push: jest.fn(),
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    // Mock fetch for assessment data
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url.includes('/api/assessments/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockAssessment }),
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('canDownloadPDF()', () => {
    it('should show PDF button for COMPLETED assessment', async () => {
      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });
    });

    it('should show PDF button for SUBMITTED assessment', async () => {
      const submitted = { ...mockAssessment, status: 'SUBMITTED' };
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: submitted }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });
    });

    it('should NOT show PDF button for DRAFT assessment', async () => {
      const draft = { ...mockAssessment, status: 'DRAFT' };
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: draft }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Download PDF/i)).not.toBeInTheDocument();
      });
    });

    it('should NOT show PDF button for IN_PROGRESS assessment', async () => {
      const inProgress = { ...mockAssessment, status: 'IN_PROGRESS' };
      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: inProgress }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Download PDF/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('handleDownloadPDF()', () => {
    it('should show report type selector when download button is clicked', async () => {
      const user = userEvent.setup();
      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Preliminary Report/i)).toBeInTheDocument();
      });
    });

    it('should fetch PDF with correct endpoint and report type', async () => {
      const user = userEvent.setup();
      const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/') && url.includes('?type=preliminary')) {
          return Promise.resolve({
            ok: true,
            blob: async () => mockPdfBlob,
            headers: {
              get: (header) => {
                if (header === 'Content-Disposition') {
                  return 'attachment; filename="Assessment_Preliminary_550e8400_2025-10-22.pdf"';
                }
                return null;
              },
            },
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/export/assessment/' + mockAssessmentId),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
            }),
          })
        );
      });
    });

    it('should show loading state while PDF is generating', async () => {
      const user = userEvent.setup();
      let resolveResponse: any;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });

      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return responsePromise;
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Generating/i)).toBeInTheDocument();
      });

      // Resolve the fetch
      const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      resolveResponse({
        ok: true,
        blob: async () => mockPdfBlob,
        headers: {
          get: () => null,
        },
      });

      // Loading state should clear
      await waitFor(() => {
        expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument();
      });
    });

    it('should handle 403 Forbidden error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return Promise.resolve({
            ok: false,
            status: 403,
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument();
      });
    });

    it('should handle 404 Not Found error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(screen.getByText(/Assessment not found/i)).toBeInTheDocument();
      });
    });

    it('should handle 401 Unauthorized error', async () => {
      localStorage.clear();
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
      });
    });

    it('should handle 500 Server Error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ message: 'PDF generation failed' }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(screen.getByText(/Server error while generating PDF/i)).toBeInTheDocument();
      });
    });

    it('should dismiss error message when Dismiss button is clicked', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(screen.getByText(/Assessment not found/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByText(/Dismiss/i);
      await user.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/Assessment not found/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Report Type Selection', () => {
    it('should enable/disable report types based on assessment status', async () => {
      const user = userEvent.setup();
      const preliminary = { ...mockAssessment, status: 'PRELIMINARY' };

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: preliminary }),
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        const selector = screen.getByText(/Select Report Type/i).closest('div');
        expect(selector).toBeInTheDocument();
      });

      // Investigation should be disabled for PRELIMINARY status
      const investigationRadio = screen.getByLabelText(/Investigation Report/i) as HTMLInputElement;
      expect(investigationRadio.disabled).toBe(true);

      // Conclusion should be disabled for PRELIMINARY status
      const conclusionRadio = screen.getByLabelText(/Conclusion Report/i) as HTMLInputElement;
      expect(conclusionRadio.disabled).toBe(true);
    });

    it('should only enable Conclusion for COMPLETED assessment', async () => {
      const user = userEvent.setup();

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const conclusionRadio = screen.getByLabelText(/Conclusion Report/i) as HTMLInputElement;
      expect(conclusionRadio.disabled).toBe(false);
    });
  });

  describe('Filename Handling', () => {
    it('should extract filename from Content-Disposition header', async () => {
      const user = userEvent.setup();
      const mockPdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      const expectedFilename = 'Assessment_Preliminary_550e8400_2025-10-22.pdf';

      const mockCreateElement = document.createElement;
      const mockLink = { href: '', download: '', click: jest.fn() };

      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockLink as any;
        return mockCreateElement.call(document, tag);
      });

      (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/assessments/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAssessment }),
          });
        }
        if (url.includes('/api/export/assessment/')) {
          return Promise.resolve({
            ok: true,
            blob: async () => mockPdfBlob,
            headers: {
              get: (header) => {
                if (header === 'Content-Disposition') {
                  return `attachment; filename="${expectedFilename}"`;
                }
                return null;
              },
            },
          });
        }
        return Promise.reject(new Error('Not mocked'));
      });

      render(<AssessmentPage />);

      await waitFor(() => {
        expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
      });

      const downloadButton = screen.getByText(/Download PDF/i);
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Select Report Type/i)).toBeInTheDocument();
      });

      const downloadInDropdownButton = screen.getAllByText(/Download/i)[1];
      await user.click(downloadInDropdownButton);

      await waitFor(() => {
        expect(mockLink.download).toContain('Assessment_Preliminary');
      });
    });
  });
});
