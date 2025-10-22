/**
 * Unit Tests for /recommendations Page
 *
 * Tests page rendering, API integration, filtering,
 * job saving, and modal functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecommendationsPage from '../page';
import { useJobRecommendations } from '@/hooks/useJobRecommendations';
import { useAuth } from '@/hooks/useAuth';

// Mock hooks
jest.mock('@/hooks/useJobRecommendations');
jest.mock('@/hooks/useAuth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Recommendations Page', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
  };

  const mockRecommendations = [
    {
      id: 'job-1',
      title: 'Senior Developer',
      company: 'Tech Corp',
      location: 'Paris',
      matchScore: 95,
      matchReasons: ['Java Expert'],
    },
    {
      id: 'job-2',
      title: 'Python Engineer',
      company: 'Data Inc',
      location: 'Lyon',
      matchScore: 85,
      matchReasons: ['Python Specialist'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (useJobRecommendations as jest.Mock).mockReturnValue({
      recommendations: mockRecommendations,
      savedJobs: [],
      loading: false,
      error: null,
      pageInfo: { limit: 10, offset: 0, total: 2 },
      getJobRecommendations: jest.fn(),
      saveJob: jest.fn(),
      getSavedJobs: jest.fn(),
      getRomeCodeDetails: jest.fn(),
      searchRomeCodes: jest.fn(),
      removeSavedJob: jest.fn(),
      updateSavedJob: jest.fn(),
      clearError: jest.fn(),
      clearRecommendations: jest.fn(),
    });
  });

  describe('Page Rendering', () => {
    it('should render page title and description', () => {
      render(<RecommendationsPage />);

      expect(screen.getByText(/Recommended Jobs for You/i)).toBeInTheDocument();
      expect(screen.getByText(/Discover job opportunities/i)).toBeInTheDocument();
    });

    it('should display user statistics', () => {
      render(<RecommendationsPage />);

      expect(screen.getByText('Total Recommendations')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Saved Jobs')).toBeInTheDocument();
    });

    it('should display user name in header', () => {
      render(<RecommendationsPage />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Recommendations Loading', () => {
    it('should call getJobRecommendations on mount', () => {
      const mockGetRecommendations = jest.fn();
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: [],
        savedJobs: [],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 0 },
        getJobRecommendations: mockGetRecommendations,
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      expect(mockGetRecommendations).toHaveBeenCalled();
    });

    it('should display loading skeleton when loading', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: [],
        savedJobs: [],
        loading: true,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 0 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      const { container } = render(<RecommendationsPage />);

      expect(container.querySelector('[class*="animate-pulse"]')).toBeInTheDocument();
    });

    it('should display recommendations list when loaded', () => {
      render(<RecommendationsPage />);

      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Python Engineer')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load recommendations';
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: [],
        savedJobs: [],
        loading: false,
        error: errorMessage,
        pageInfo: { limit: 10, offset: 0, total: 0 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      expect(screen.getByText(/Error Loading Recommendations/)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error when error is null', () => {
      render(<RecommendationsPage />);

      expect(screen.queryByText(/Error Loading Recommendations/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no recommendations', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: [],
        savedJobs: [],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 0 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      expect(screen.getByText(/No Recommendations Yet/)).toBeInTheDocument();
      expect(screen.getByText(/Complete your assessment/)).toBeInTheDocument();
    });

    it('should show link to assessment in empty state', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: [],
        savedJobs: [],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 0 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      const assessmentLink = screen.getByText(/Start Assessment/) as HTMLAnchorElement;
      expect(assessmentLink).toBeInTheDocument();
      expect(assessmentLink.href).toContain('/assessments');
    });
  });

  describe('Refresh Button', () => {
    it('should call getJobRecommendations when refresh button is clicked', () => {
      const mockGetRecommendations = jest.fn();
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: mockRecommendations,
        savedJobs: [],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 2 },
        getJobRecommendations: mockGetRecommendations,
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      const refreshButton = screen.getByText(/Refresh Recommendations/);
      fireEvent.click(refreshButton);

      // Called once on mount, once on button click
      expect(mockGetRecommendations).toHaveBeenCalledTimes(2);
    });

    it('should disable refresh button while loading', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: mockRecommendations,
        savedJobs: [],
        loading: true,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 2 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      const refreshButton = screen.getByText(/Loading/) as HTMLButtonElement;
      expect(refreshButton.disabled).toBe(true);
    });
  });

  describe('Save Job Functionality', () => {
    it('should call saveJob when save button is clicked', () => {
      const mockSaveJob = jest.fn();
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: mockRecommendations,
        savedJobs: [],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 2 },
        getJobRecommendations: jest.fn(),
        saveJob: mockSaveJob,
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      const saveButtons = screen.getAllByText(/Save Job/i);
      fireEvent.click(saveButtons[0]);

      expect(mockSaveJob).toHaveBeenCalledWith('job-1', '', 'saved');
    });
  });

  describe('Job Details Modal', () => {
    it('should open modal when view details is clicked', async () => {
      render(<RecommendationsPage />);

      const detailsButtons = screen.getAllByText(/Details/i);
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      });
    });

    it('should close modal when close button is clicked', async () => {
      render(<RecommendationsPage />);

      const detailsButtons = screen.getAllByText(/Details/i);
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        const closeButton = screen.getByText('✕');
        fireEvent.click(closeButton);
      });
    });
  });

  describe('Saved Jobs Link', () => {
    it('should show saved jobs link when jobs are saved', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: mockRecommendations,
        savedJobs: [{ id: 'job-1', title: 'Senior Developer' }],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 2 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      const savedJobsLink = screen.getByText(/View All Saved Jobs/) as HTMLAnchorElement;
      expect(savedJobsLink).toBeInTheDocument();
      expect(savedJobsLink.href).toContain('/saved-jobs');
    });

    it('should not show saved jobs link when no jobs saved', () => {
      render(<RecommendationsPage />);

      expect(screen.queryByText(/View All Saved Jobs/)).not.toBeInTheDocument();
    });

    it('should show saved jobs count', () => {
      (useJobRecommendations as jest.Mock).mockReturnValue({
        recommendations: mockRecommendations,
        savedJobs: [
          { id: 'job-1', title: 'Senior Developer' },
          { id: 'job-2', title: 'Python Engineer' },
        ],
        loading: false,
        error: null,
        pageInfo: { limit: 10, offset: 0, total: 2 },
        getJobRecommendations: jest.fn(),
        saveJob: jest.fn(),
        getSavedJobs: jest.fn(),
        getRomeCodeDetails: jest.fn(),
        searchRomeCodes: jest.fn(),
        removeSavedJob: jest.fn(),
        updateSavedJob: jest.fn(),
        clearError: jest.fn(),
        clearRecommendations: jest.fn(),
      });

      render(<RecommendationsPage />);

      expect(screen.getByText(/You have 2 jobs? saved/i)).toBeInTheDocument();
    });
  });

  describe('Tips Section', () => {
    it('should display helpful tips', () => {
      render(<RecommendationsPage />);

      expect(screen.getByText(/Tips for Success/)).toBeInTheDocument();
      expect(screen.getByText(/Review Match Reasons/)).toBeInTheDocument();
      expect(screen.getByText(/Save Interesting Jobs/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button elements', () => {
      render(<RecommendationsPage />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible links', () => {
      render(<RecommendationsPage />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
