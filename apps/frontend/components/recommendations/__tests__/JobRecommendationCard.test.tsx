/**
 * Unit Tests for JobRecommendationCard Component
 *
 * Tests job display, score badge, save functionality,
 * and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobRecommendationCard from '../JobRecommendationCard';
import { Job } from '@/hooks/useJobRecommendations';

describe('JobRecommendationCard', () => {
  const mockJob: Job = {
    id: 'job-1',
    title: 'Senior Developer',
    company: 'Tech Corp',
    location: 'Paris, France',
    contractType: 'CDI',
    salaryMin: 50000,
    salaryMax: 70000,
    matchScore: 95,
    matchReasons: ['Java Expert', 'Spring Boot Experience'],
    description: 'Looking for senior developer with 5+ years experience',
  };

  describe('Rendering', () => {
    it('should render job title and company', () => {
      render(<JobRecommendationCard job={mockJob} />);

      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    it('should display location and contract type', () => {
      render(<JobRecommendationCard job={mockJob} />);

      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getByText('CDI')).toBeInTheDocument();
    });

    it('should display salary range', () => {
      render(<JobRecommendationCard job={mockJob} />);

      expect(screen.getByText(/€50,000 - €70,000/)).toBeInTheDocument();
    });

    it('should display match score badge', () => {
      render(<JobRecommendationCard job={mockJob} showScore={true} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('should not show score when showScore is false', () => {
      render(<JobRecommendationCard job={mockJob} showScore={false} />);

      expect(screen.queryByText('95%')).not.toBeInTheDocument();
    });

    it('should display match reasons', () => {
      render(<JobRecommendationCard job={mockJob} />);

      expect(screen.getByText(/Java Expert/)).toBeInTheDocument();
      expect(screen.getByText(/Spring Boot Experience/)).toBeInTheDocument();
    });
  });

  describe('Score Colors', () => {
    it('should apply green color for 90%+ score', () => {
      const job: Job = { ...mockJob, matchScore: 95 };
      const { container } = render(<JobRecommendationCard job={job} />);

      const badge = container.querySelector('[class*="bg-green"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply blue color for 75-89% score', () => {
      const job: Job = { ...mockJob, matchScore: 80 };
      const { container } = render(<JobRecommendationCard job={job} />);

      const badge = container.querySelector('[class*="bg-blue"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply orange color for 60-74% score', () => {
      const job: Job = { ...mockJob, matchScore: 65 };
      const { container } = render(<JobRecommendationCard job={job} />);

      const badge = container.querySelector('[class*="bg-orange"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when save button is clicked', async () => {
      const onSave = jest.fn();
      render(<JobRecommendationCard job={mockJob} onSave={onSave} />);

      const saveButton = screen.getByText(/Save Job/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(mockJob.id);
      });
    });

    it('should show "Saved" when isSaved is true', () => {
      render(<JobRecommendationCard job={mockJob} isSaved={true} />);

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('should have different styling when saved', () => {
      const { container: containerSaved } = render(
        <JobRecommendationCard job={mockJob} isSaved={true} />
      );

      const savedButton = containerSaved.querySelector('[class*="bg-green"]');
      expect(savedButton).toBeInTheDocument();
    });

    it('should disable save button during loading', async () => {
      const onSave = jest.fn(
        () =>
          new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<JobRecommendationCard job={mockJob} onSave={onSave} />);

      const saveButton = screen.getByText(/Save Job/i) as HTMLButtonElement;
      fireEvent.click(saveButton);

      expect(saveButton.disabled).toBe(true);

      await waitFor(() => {
        expect(saveButton.disabled).toBe(false);
      });
    });
  });

  describe('View Details Functionality', () => {
    it('should call onViewDetails when Details button is clicked', () => {
      const onViewDetails = jest.fn();
      render(<JobRecommendationCard job={mockJob} onViewDetails={onViewDetails} />);

      const detailsButton = screen.getByText(/Details/i);
      fireEvent.click(detailsButton);

      expect(onViewDetails).toHaveBeenCalledWith(mockJob);
    });

    it('should not error if onViewDetails is not provided', () => {
      const { container } = render(<JobRecommendationCard job={mockJob} />);

      const detailsButton = screen.getByText(/Details/i);
      expect(() => fireEvent.click(detailsButton)).not.toThrow();
    });
  });

  describe('Optional Fields', () => {
    it('should handle missing location gracefully', () => {
      const job: Job = { ...mockJob, location: undefined };
      const { container } = render(<JobRecommendationCard job={job} />);

      expect(container.textContent).not.toContain('📍');
    });

    it('should handle missing salary', () => {
      const job: Job = { ...mockJob, salaryMin: undefined, salaryMax: undefined };
      render(<JobRecommendationCard job={job} />);

      expect(screen.queryByText(/€/)).not.toBeInTheDocument();
    });

    it('should handle missing match reasons', () => {
      const job: Job = { ...mockJob, matchReasons: undefined };
      const { container } = render(<JobRecommendationCard job={job} />);

      expect(container.textContent).not.toContain('Why it matches');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button elements', () => {
      render(<JobRecommendationCard job={mockJob} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<JobRecommendationCard job={mockJob} />);

      expect(container.querySelector('h3')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      const { container } = render(<JobRecommendationCard job={mockJob} />);

      expect(container.querySelector('[class*="md"]')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long job title', () => {
      const job: Job = {
        ...mockJob,
        title: 'A'.repeat(100),
      };
      render(<JobRecommendationCard job={job} />);

      expect(screen.getByText(/A+/)).toBeInTheDocument();
    });

    it('should handle many match reasons', () => {
      const reasons = Array.from({ length: 10 }, (_, i) => `Skill ${i + 1}`);
      const job: Job = { ...mockJob, matchReasons: reasons };
      render(<JobRecommendationCard job={job} />);

      expect(screen.getByText('+7 more')).toBeInTheDocument();
    });

    it('should format salary with thousand separators', () => {
      const job: Job = { ...mockJob, salaryMin: 150000, salaryMax: 200000 };
      render(<JobRecommendationCard job={job} />);

      expect(screen.getByText(/150,000/)).toBeInTheDocument();
      expect(screen.getByText(/200,000/)).toBeInTheDocument();
    });
  });
});
