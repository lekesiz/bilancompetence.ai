/**
 * AssessmentCard Component Unit Tests
 *
 * Tests for:
 * - Assessment rendering
 * - Status badges
 * - Progress bars
 * - Action buttons
 * - Callback handlers
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssessmentCard } from '@/app/(protected)/dashboard/components/dashboard-components/AssessmentCard';
import { Assessment } from '@/app/(protected)/dashboard/types';

describe('AssessmentCard Component', () => {
  const mockAssessment: Assessment = {
    id: 'assessment-1',
    title: 'Career Assessment 2025',
    status: 'IN_PROGRESS',
    progress: 65,
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-10-22T14:30:00Z',
  };

  describe('Rendering', () => {
    it('should render assessment title', () => {
      render(
        <AssessmentCard assessment={mockAssessment} />
      );

      expect(screen.getByText('Career Assessment 2025')).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(
        <AssessmentCard assessment={mockAssessment} />
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should format and display creation date', () => {
      render(
        <AssessmentCard assessment={mockAssessment} />
      );

      expect(screen.getByText(/Oct 15, 2025/)).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display DRAFT status with correct color', () => {
      const draftAssessment = {
        ...mockAssessment,
        status: 'DRAFT' as const,
      };

      const { container } = render(
        <AssessmentCard assessment={draftAssessment} />
      );

      const badge = screen.getByText('Draft');
      expect(badge.parentElement).toHaveClass('bg-gray-100');
      expect(badge.parentElement).toHaveClass('text-gray-800');
    });

    it('should display IN_PROGRESS status with correct color', () => {
      const { container } = render(
        <AssessmentCard assessment={mockAssessment} />
      );

      const badge = screen.getByText('In Progress');
      expect(badge.parentElement).toHaveClass('bg-blue-100');
      expect(badge.parentElement).toHaveClass('text-blue-800');
    });

    it('should display SUBMITTED status with correct color', () => {
      const submittedAssessment = {
        ...mockAssessment,
        status: 'SUBMITTED' as const,
      };

      const { container } = render(
        <AssessmentCard assessment={submittedAssessment} />
      );

      const badge = screen.getByText('Submitted');
      expect(badge.parentElement).toHaveClass('bg-yellow-100');
      expect(badge.parentElement).toHaveClass('text-yellow-800');
    });

    it('should display COMPLETED status with correct color', () => {
      const completedAssessment = {
        ...mockAssessment,
        status: 'COMPLETED' as const,
      };

      const { container } = render(
        <AssessmentCard assessment={completedAssessment} />
      );

      const badge = screen.getByText('Completed');
      expect(badge.parentElement).toHaveClass('bg-green-100');
      expect(badge.parentElement).toHaveClass('text-green-800');
    });
  });

  describe('Progress Bar', () => {
    it('should display progress bar for IN_PROGRESS assessment', () => {
      const { container } = render(
        <AssessmentCard assessment={mockAssessment} />
      );

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('should not display progress bar for DRAFT assessment', () => {
      const draftAssessment = {
        ...mockAssessment,
        status: 'DRAFT' as const,
      };

      render(
        <AssessmentCard assessment={draftAssessment} />
      );

      // DRAFT assessments don't show progress
      const progressText = screen.queryByText('Progress');
      if (progressText) {
        expect(progressText).not.toBeInTheDocument();
      }
    });

    it('should set progress bar width correctly', () => {
      const { container } = render(
        <AssessmentCard assessment={mockAssessment} />
      );

      const progressBar = container.querySelector('[style*="width"]');
      expect(progressBar).toHaveStyle({ width: '65%' });
    });

    it('should not display progress for COMPLETED assessment', () => {
      const completedAssessment = {
        ...mockAssessment,
        status: 'COMPLETED' as const,
      };

      render(
        <AssessmentCard assessment={completedAssessment} />
      );

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should show Edit Draft button for DRAFT assessment', () => {
      const draftAssessment = {
        ...mockAssessment,
        status: 'DRAFT' as const,
      };

      render(
        <AssessmentCard assessment={draftAssessment} />
      );

      expect(screen.getByText('Edit Draft')).toBeInTheDocument();
    });

    it('should show View Results button for non-DRAFT assessment', () => {
      render(
        <AssessmentCard assessment={mockAssessment} onView={jest.fn()} />
      );

      expect(screen.getByText('View Results')).toBeInTheDocument();
    });

    it('should show Delete button when onDelete provided', () => {
      render(
        <AssessmentCard
          assessment={mockAssessment}
          onDelete={jest.fn()}
        />
      );

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not show Delete button when onDelete not provided', () => {
      render(
        <AssessmentCard assessment={mockAssessment} />
      );

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('Button Handlers', () => {
    it('should call onEdit when Edit Draft button clicked', async () => {
      const handleEdit = jest.fn();
      const user = userEvent.setup();
      const draftAssessment = {
        ...mockAssessment,
        status: 'DRAFT' as const,
      };

      render(
        <AssessmentCard
          assessment={draftAssessment}
          onEdit={handleEdit}
        />
      );

      const editButton = screen.getByText('Edit Draft');
      await user.click(editButton);

      expect(handleEdit).toHaveBeenCalled();
    });

    it('should call onView when View Results button clicked', async () => {
      const handleView = jest.fn();
      const user = userEvent.setup();

      render(
        <AssessmentCard
          assessment={mockAssessment}
          onView={handleView}
        />
      );

      const viewButton = screen.getByText('View Results');
      await user.click(viewButton);

      expect(handleView).toHaveBeenCalled();
    });

    it('should call onDelete when Delete button clicked', async () => {
      const handleDelete = jest.fn();
      const user = userEvent.setup();

      render(
        <AssessmentCard
          assessment={mockAssessment}
          onDelete={handleDelete}
        />
      );

      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(handleDelete).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have hover effect on card', () => {
      const { container } = render(
        <AssessmentCard assessment={mockAssessment} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('transition-shadow');
    });

    it('should have proper padding', () => {
      const { container } = render(
        <AssessmentCard assessment={mockAssessment} />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });
  });
});
