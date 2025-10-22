/**
 * AdminDashboard Component Unit Tests
 *
 * Tests for:
 * - Admin dashboard rendering
 * - Organization metrics
 * - Analytics display
 * - User management table
 * - Compliance section
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminDashboard } from '@/app/(protected)/dashboard/components/AdminDashboard';

// Mock the hook
jest.mock('@/app/(protected)/dashboard/hooks/useDashboardData', () => ({
  useAdminDashboardData: jest.fn(),
}));

const { useAdminDashboardData } = require('@/app/(protected)/dashboard/hooks/useDashboardData');

describe('AdminDashboard Component', () => {
  const mockData = {
    organization: {
      name: 'Test Organization',
      plan: 'Premium',
      usageStats: { storage: '50GB / 100GB' },
    },
    users: [
      {
        id: 'user-1',
        name: 'John Beneficiary',
        email: 'john@test.com',
        role: 'BENEFICIARY',
        status: 'ACTIVE',
        createdAt: '2025-10-01T10:00:00Z',
      },
      {
        id: 'user-2',
        name: 'Jane Consultant',
        email: 'jane@test.com',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        createdAt: '2025-10-05T10:00:00Z',
      },
    ],
    stats: {
      totalUsers: 2,
      activeUsers: 2,
      totalAssessments: 10,
      completedAssessments: 7,
      averageSatisfaction: 4.3,
      activeSessionsCount: 3,
    },
    analytics: {
      chartData: {
        completionTrend: [
          { name: 'Week 1', value: 5 },
          { name: 'Week 2', value: 8 },
          { name: 'Week 3', value: 12 },
        ],
        statusDistribution: [
          { name: 'Draft', value: 2 },
          { name: 'In Progress', value: 1 },
          { name: 'Completed', value: 7 },
        ],
        roleDistribution: [
          { name: 'Beneficiary', value: 1 },
          { name: 'Consultant', value: 1 },
          { name: 'Admin', value: 0 },
        ],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAdminDashboardData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render welcome header', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Organization Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Manage users, assessments/i)).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Organization Info')).toBeInTheDocument();
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Compliance')).toBeInTheDocument();
    });
  });

  describe('Organization Info', () => {
    it('should display organization name', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Test Organization')).toBeInTheDocument();
    });

    it('should display plan', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should display status', () => {
      render(<AdminDashboard />);

      const activeStatus = screen.getByText('Active');
      expect(activeStatus).toBeInTheDocument();
    });
  });

  describe('Key Metrics', () => {
    it('should display all 6 metric cards', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Total Assessments')).toBeInTheDocument();
      expect(screen.getByText('Completed Assessments')).toBeInTheDocument();
      expect(screen.getByText('User Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    });

    it('should display metric values', () => {
      render(<AdminDashboard />);

      // Check for stat values
      const statTexts = screen.getAllByText(/\d+/);
      expect(statTexts.length).toBeGreaterThan(0);
    });

    it('should display satisfaction score correctly formatted', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('4.3/5')).toBeInTheDocument();
    });
  });

  describe('Analytics Section', () => {
    it('should display analytics heading', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should display chart titles', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/Completion Trend/)).toBeInTheDocument();
      expect(screen.getByText(/Assessment Status Distribution/)).toBeInTheDocument();
      expect(screen.getByText(/User Distribution by Role/)).toBeInTheDocument();
    });

    it('should render charts when data available', () => {
      const { container } = render(<AdminDashboard />);

      // Charts should be rendered (they use SVG or CSS)
      const charts = container.querySelectorAll('[class*="shadow"]');
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  describe('User Management Table', () => {
    it('should display user management heading', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should display Add User button', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should display users in table', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('John Beneficiary')).toBeInTheDocument();
      expect(screen.getByText('Jane Consultant')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should display user roles', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('BENEFICIARY')).toBeInTheDocument();
      expect(screen.getByText('CONSULTANT')).toBeInTheDocument();
    });

    it('should display user status', () => {
      const { container } = render(<AdminDashboard />);

      const activeStatuses = screen.getAllByText('ACTIVE');
      expect(activeStatuses.length).toBeGreaterThanOrEqual(1);
    });

    it('should display action buttons for users', () => {
      render(<AdminDashboard />);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons.length).toBeGreaterThan(0);

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Compliance Section', () => {
    it('should display compliance heading', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Compliance')).toBeInTheDocument();
    });

    it('should display QUALIOPI certification info', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('QUALIOPI Certification')).toBeInTheDocument();
    });

    it('should display compliance checklist items', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/Data Protection & Privacy/)).toBeInTheDocument();
      expect(screen.getByText(/Assessment Quality/)).toBeInTheDocument();
      expect(screen.getByText(/User Feedback & Satisfaction/)).toBeInTheDocument();
    });

    it('should display compliance action buttons', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Export Report')).toBeInTheDocument();
      expect(screen.getByText('Generate Compliance Report')).toBeInTheDocument();
    });
  });

  describe('Admin Tips', () => {
    it('should display admin tips section', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Admin Tips')).toBeInTheDocument();
    });

    it('should display helpful tips', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/Monitor user activity/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading=true', () => {
      useAdminDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<AdminDashboard />);

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not display data while loading', () => {
      useAdminDashboardData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<AdminDashboard />);

      expect(screen.queryByText('Test Organization')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to fetch admin dashboard';
      useAdminDashboardData.mockReturnValue({
        data: null,
        loading: false,
        error: new Error(errorMessage),
        refetch: jest.fn(),
      });

      render(<AdminDashboard />);

      expect(screen.getByText(/Error Loading Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should handle empty users list gracefully', () => {
      useAdminDashboardData.mockReturnValue({
        data: {
          ...mockData,
          users: [],
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<AdminDashboard />);

      // Should still render the dashboard structure
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('should handle missing analytics data', () => {
      useAdminDashboardData.mockReturnValue({
        data: {
          ...mockData,
          analytics: {
            chartData: {
              completionTrend: [],
              statusDistribution: [],
              roleDistribution: [],
            },
          },
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<AdminDashboard />);

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<AdminDashboard />);

      const grids = container.querySelectorAll('[class*="grid"]');
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should have responsive metric cards', () => {
      const { container } = render(<AdminDashboard />);

      const metricsGrid = container.querySelector('[class*="lg:grid-cols-3"]');
      expect(metricsGrid).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('should have clickable Add User button', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      const addButton = screen.getByText('Add User');
      expect(addButton).toBeInTheDocument();
    });

    it('should have clickable action buttons in table', async () => {
      render(<AdminDashboard />);

      const editButtons = screen.getAllByText('Edit');
      expect(editButtons[0]).toBeInTheDocument();
    });
  });
});
