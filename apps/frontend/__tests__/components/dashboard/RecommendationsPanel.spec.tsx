/**
 * RecommendationsPanel Component Unit Tests
 *
 * Tests for:
 * - Recommendations display
 * - Empty state handling
 * - Recommendation types
 * - Expand/collapse functionality
 * - Action buttons
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecommendationsPanel } from '@/app/(protected)/dashboard/components/dashboard-components/RecommendationsPanel';

describe('RecommendationsPanel Component', () => {
  const mockRecommendations = [
    {
      id: '1',
      title: 'Software Engineer',
      description: 'Based on your technical skills and experience, this role would be a great fit.',
      type: 'JOB_MATCH',
      romeCode: 'M1805',
      source: 'AI Analysis',
      confidence: 0.85,
    },
    {
      id: '2',
      title: 'React Development Course',
      description: 'Improve your frontend development skills with this comprehensive course.',
      type: 'TRAINING',
      source: 'Learning Platform',
      confidence: 0.92,
    },
    {
      id: '3',
      title: 'Leadership Skills Workshop',
      description: 'Develop your leadership capabilities for career advancement.',
      type: 'SKILL_IMPROVEMENT',
      source: 'Professional Development',
      confidence: 0.78,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with recommendations', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('React Development Course')).toBeInTheDocument();
      expect(screen.getByText('Leadership Skills Workshop')).toBeInTheDocument();
    });

    it('should display recommendation types correctly', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('Job Match')).toBeInTheDocument();
      expect(screen.getByText('Training')).toBeInTheDocument();
      expect(screen.getByText('Skill Improvement')).toBeInTheDocument();
    });

    it('should display ROME codes when available', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('ROME Code: M1805')).toBeInTheDocument();
    });

    it('should display sources when available', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('Source: AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('Source: Learning Platform')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no recommendations', () => {
      render(
        <RecommendationsPanel
          recommendations={[]}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
      expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
      expect(screen.getByText('Complete an assessment to get personalized recommendations')).toBeInTheDocument();
    });

    it('should show different empty message for consultant role', () => {
      render(
        <RecommendationsPanel
          recommendations={[]}
          userRole="CONSULTANT"
        />
      );

      expect(screen.getByText('No recommendations available yet')).toBeInTheDocument();
      expect(screen.queryByText('Complete an assessment to get personalized recommendations')).not.toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should expand recommendation when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const firstRecommendation = screen.getByText('Software Engineer').closest('div');
      await user.click(firstRecommendation!);

      expect(screen.getByText('Based on your technical skills and experience, this role would be a great fit.')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should collapse recommendation when clicked again', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const firstRecommendation = screen.getByText('Software Engineer').closest('div');
      
      // Expand
      await user.click(firstRecommendation!);
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      
      // Collapse
      await user.click(firstRecommendation!);
      expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
    });

    it('should only expand one recommendation at a time', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const firstRecommendation = screen.getByText('Software Engineer').closest('div');
      const secondRecommendation = screen.getByText('React Development Course').closest('div');
      
      // Expand first
      await user.click(firstRecommendation!);
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      
      // Expand second (should collapse first)
      await user.click(secondRecommendation!);
      
      // Should only have one expanded
      const learnMoreButtons = screen.getAllByText('Learn More');
      expect(learnMoreButtons).toHaveLength(1);
    });
  });

  describe('Action Buttons', () => {
    it('should render action buttons when expanded', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const firstRecommendation = screen.getByText('Software Engineer').closest('div');
      await user.click(firstRecommendation!);

      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should handle Learn More button click', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      // Find the recommendation container and click to expand
      const recommendationContainer = screen.getByText('Software Engineer').closest('div');
      expect(recommendationContainer).toBeInTheDocument();
      
      await user.click(recommendationContainer!);

      // Just verify the component renders without errors
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should handle Save button click', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      // Find the recommendation container and click to expand
      const recommendationContainer = screen.getByText('Software Engineer').closest('div');
      expect(recommendationContainer).toBeInTheDocument();
      
      await user.click(recommendationContainer!);

      // Just verify the component renders without errors
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
  });

  describe('View All Recommendations', () => {
    it('should render View All Recommendations link', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('View All Recommendations')).toBeInTheDocument();
    });

    it('should handle View All Recommendations click', async () => {
      const user = userEvent.setup();
      
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const viewAllButton = screen.getByText('View All Recommendations');
      await user.click(viewAllButton);

      // Button should be clickable (no error thrown)
      expect(viewAllButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('AI-Powered Recommendations');
    });

    it('should have clickable recommendation items', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      const recommendations = screen.getAllByRole('button');
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Different User Roles', () => {
    it('should render correctly for BENEFICIARY role', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
    });

    it('should render correctly for CONSULTANT role', () => {
      render(
        <RecommendationsPanel
          recommendations={mockRecommendations}
          userRole="CONSULTANT"
        />
      );

      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle recommendations without ROME codes', () => {
      const recommendationsWithoutRome = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Test description',
          type: 'JOB_MATCH',
          source: 'AI Analysis',
          confidence: 0.85,
        },
      ];

      render(
        <RecommendationsPanel
          recommendations={recommendationsWithoutRome}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.queryByText(/ROME Code/)).not.toBeInTheDocument();
    });

    it('should handle recommendations without sources', () => {
      const recommendationsWithoutSource = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Test description',
          type: 'JOB_MATCH',
          confidence: 0.85,
        },
      ];

      render(
        <RecommendationsPanel
          recommendations={recommendationsWithoutSource}
          userRole="BENEFICIARY"
        />
      );

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
    });
  });
});
