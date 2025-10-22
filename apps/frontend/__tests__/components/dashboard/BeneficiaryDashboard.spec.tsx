/**
 * BeneficiaryDashboard Component Unit Tests
 *
 * Tests for:
 * - Dashboard rendering
 * - Stats display
 * - Assessment list
 * - Recommendations display
 * - Error and empty states
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BeneficiaryDashboard } from '@/app/(protected)/dashboard/components/BeneficiaryDashboard';

// Mock the hook
jest.mock('@/app/(protected)/dashboard/hooks/useDashboardData', () => ({
  useBeneficiaryDashboardData: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const { useBeneficiaryDashboardData } = require('@/app/(protected)/dashboard/hooks/useDashboardData');

describe('BeneficiaryDashboard Component', () => {
  const mockData = {
    bilans: [
      {
        id: 'assessment-1',
        title: 'Career Assessment 2025',
        status: 'IN_PROGRESS' as const,
        progress: 65,
        createdAt: '2025-10-15T10:00:00Z',
        updatedAt: '2025-10-22T14:30:00Z',
      },
      {
        id: 'assessment-2',
        title: 'Skills Assessment',
        status: 'COMPLETED' as const,
        progress: 100,
        createdAt: '2025-10-10T10:00:00Z',
        updatedAt: '2025-10-20T15:00:00Z',
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        title: 'Software Engineer',
        description: 'Based on your skills in programming',
        type: 'JOB_MATCH' as const,
        romeCode: 'M1805',
        source: 'AI',
        createdAt: '2025-10-22T10:00:00Z',
      },
    ],
    stats: {
      totalAssessments: 2,
      completedAssessments: 1,
      pendingAssessments: 1,
      averageSatisfaction: 4.5,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useBeneficiaryDashboardData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render welcome header', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText(/Welcome back!/i)).toBeInTheDocument();
      expect(screen.getByText(/assessment progress/i)).toBeInTheDocument();
    });

    it('should render Your Progress section', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Your Progress')).toBeInTheDocument();
    });

    it('should render Your Assessments section', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Your Assessments')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should display all 4 stat cards', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Total Assessments')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Score')).toBeInTheDocument();
    });

    it('should display correct stat values', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('2')).toBeInTheDocument(); // Total assessments
      expect(screen.getByText('1')).toBeInTheDocument(); // Completed
      expect(screen.getByText('4.5/5')).toBeInTheDocument(); // Satisfaction
    });
  });

  describe('Assessment List', () => {
    it('should display all assessments', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Career Assessment 2025')).toBeInTheDocument();
      expect(screen.getByText('Skills Assessment')).toBeInTheDocument();
    });

    it('should display assessment status badges', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display assessment action buttons', () => {
      render(<BeneficiaryDashboard />);

      const viewButtons = screen.getAllByText('View Results');
      expect(viewButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Recommendations Section', () => {
    it('should display recommendations when available', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
    });

    it('should display recommendation title', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should display recommendation type', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Job Match')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading=true', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<BeneficiaryDashboard />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not display content while loading', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.queryByText('Career Assessment 2025')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load dashboard data';
      useBeneficiaryDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.getByText(/Error Loading Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no assessments exist', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: {
          ...mockData,
          bilans: [],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.getByText('No assessments yet')).toBeInTheDocument();
      expect(screen.getByText(/Start your first assessment/i)).toBeInTheDocument();
    });

    it('should show CTA button in empty state', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: {
          ...mockData,
          bilans: [],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Create Your First Assessment')).toBeInTheDocument();
    });

    it('should show recommendation prompt when assessments exist but no recommendations', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: {
          ...mockData,
          recommendations: [],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.getByText(/Get Personalized Recommendations/i)).toBeInTheDocument();
    });
  });

  describe('Footer Links', () => {
    it('should display help footer', () => {
      render(<BeneficiaryDashboard />);

      expect(screen.getByText(/Need help?/i)).toBeInTheDocument();
    });

    it('should have link to help center', () => {
      render(<BeneficiaryDashboard />);

      const helpLink = screen.getByRole('link', { name: /help center/i });
      expect(helpLink).toHaveAttribute('href', '/help');
    });

    it('should have link to contact support', () => {
      render(<BeneficiaryDashboard />);

      const contactLink = screen.getByRole('link', { name: /contact support/i });
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('Navigation', () => {
    it('should have navigation links to create assessment', () => {
      useBeneficiaryDashboardData.mockReturnValue({
        data: {
          ...mockData,
          bilans: [],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      const createLinks = screen.getAllByText(/assessment/i).filter(el =>
        el.textContent?.includes('Create')
      );
      expect(createLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid for stats', () => {
      const { container } = render(<BeneficiaryDashboard />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-4');
    });

    it('should have responsive spacing', () => {
      const { container } = render(<BeneficiaryDashboard />);

      const sections = container.querySelectorAll('[class*="space-y"]');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Data Types', () => {
    it('should handle assessments with optional dates', () => {
      const assessmentWithoutDates = {
        ...mockData.bilans[0],
        submittedAt: undefined,
        completedAt: undefined,
      };

      useBeneficiaryDashboardData.mockReturnValue({
        data: {
          ...mockData,
          bilans: [assessmentWithoutDates],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<BeneficiaryDashboard />);

      expect(screen.getByText('Career Assessment 2025')).toBeInTheDocument();
    });
  });
});
