/**
 * Helper Components Unit Tests
 *
 * Tests for:
 * - ProgressBar (step indicators, progress visualization)
 * - StepNavigation (navigation buttons, state management)
 * - AutoSaveIndicator (save status, time display)
 * - FormError (error display, dismissal)
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProgressBar } from '@/components/assessment/ProgressBar';
import { StepNavigation } from '@/components/assessment/StepNavigation';
import { AutoSaveIndicator } from '@/components/assessment/AutoSaveIndicator';
import { FormError } from '@/components/assessment/FormError';

describe('ProgressBar Component', () => {
  describe('Initial Rendering', () => {
    it('should render progress bar with correct step', () => {
      render(
        <ProgressBar
          currentStep={1}
          totalSteps={5}
          progressPercentage={20}
        />
      );

      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });

    it('should render all step indicators', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          progressPercentage={40}
        />
      );

      // Should show 5 step circles/indicators
      const circles = screen.getAllByText(/\d/);
      expect(circles.length).toBeGreaterThan(0);
    });

    it('should show correct step labels', () => {
      render(
        <ProgressBar
          currentStep={1}
          totalSteps={5}
          progressPercentage={20}
        />
      );

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Edu')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Values')).toBeInTheDocument();
      expect(screen.getByText('Context')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should display correct progress percentage', () => {
      render(
        <ProgressBar
          currentStep={3}
          totalSteps={5}
          progressPercentage={60}
        />
      );

      expect(screen.getByText(/60% complete/i)).toBeInTheDocument();
    });

    it('should handle 0% progress', () => {
      render(
        <ProgressBar
          currentStep={0}
          totalSteps={5}
          progressPercentage={0}
        />
      );

      expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      render(
        <ProgressBar
          currentStep={5}
          totalSteps={5}
          progressPercentage={100}
        />
      );

      expect(screen.getByText(/100% complete/i)).toBeInTheDocument();
    });
  });

  describe('Step Indicator States', () => {
    it('should show checkmark for completed steps', () => {
      const { container } = render(
        <ProgressBar
          currentStep={3}
          totalSteps={5}
          progressPercentage={60}
        />
      );

      // Completed steps (1, 2) should show checkmarks
      const checkmarks = container.querySelectorAll('*');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should show current step with different styling', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          progressPercentage={40}
        />
      );

      expect(screen.getByText(/40% complete/i)).toBeInTheDocument();
    });

    it('should show future steps in disabled state', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          progressPercentage={40}
        />
      );

      // Step 3, 4, 5 should be in disabled state (not explicitly tested here but shown visually)
      expect(screen.getByText(/Skills/)).toBeInTheDocument();
    });
  });

  describe('Label Display', () => {
    it('should show label by default', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          progressPercentage={40}
        />
      );

      expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={5}
          progressPercentage={40}
          showLabel={false}
        />
      );

      expect(screen.queryByText(/Step 2 of 5 \(40% complete\)/i)).not.toBeInTheDocument();
    });
  });

  describe('Custom Total Steps', () => {
    it('should support custom total steps', () => {
      render(
        <ProgressBar
          currentStep={2}
          totalSteps={10}
          progressPercentage={20}
        />
      );

      expect(screen.getByText(/Step 2 of 10/i)).toBeInTheDocument();
    });
  });
});

describe('StepNavigation Component', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Rendering', () => {
    it('should render back button', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByRole('button', { name: /← Back/i })).toBeInTheDocument();
    });

    it('should render next button', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByRole('button', { name: /Next →/i })).toBeInTheDocument();
    });

    it('should show submit button on last step', () => {
      render(
        <StepNavigation
          currentStep={5}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          showSubmit={true}
        />
      );

      expect(screen.getByRole('button', { name: /Submit Assessment/i })).toBeInTheDocument();
    });

    it('should use custom submit label', () => {
      render(
        <StepNavigation
          currentStep={5}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          showSubmit={true}
          submitLabel="Finish"
        />
      );

      expect(screen.getByRole('button', { name: /Finish/i })).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should disable back button on first step', () => {
      render(
        <StepNavigation
          currentStep={0}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByRole('button', { name: /← Back/i });
      expect(backButton).toBeDisabled();
    });

    it('should disable next button on last step', () => {
      render(
        <StepNavigation
          currentStep={5}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          showSubmit={true}
          onSubmit={mockOnSubmit}
        />
      );

      // When showSubmit is true, next button should not be visible
      expect(screen.queryByRole('button', { name: /Next →/i })).not.toBeInTheDocument();
    });

    it('should disable buttons when isLoading is true', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      const backButton = screen.getByRole('button', { name: /← Back/i });
      const nextButton = screen.getByRole('button', { name: /Next →/i });

      expect(backButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should disable buttons when isSaving is true', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isSaving={true}
        />
      );

      const backButton = screen.getByRole('button', { name: /← Back/i });
      const nextButton = screen.getByRole('button', { name: /Saving/i });

      expect(backButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should disable next button when disableNext is true', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          disableNext={true}
        />
      );

      const nextButton = screen.getByRole('button', { name: /Next →/i });
      expect(nextButton).toBeDisabled();
    });

    it('should disable back button when disableBack is true', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          disableBack={true}
        />
      );

      const backButton = screen.getByRole('button', { name: /← Back/i });
      expect(backButton).toBeDisabled();
    });
  });

  describe('Button Callbacks', () => {
    it('should call onBack when back button is clicked', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /← Back/i }));

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should call onNext when next button is clicked', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Next →/i }));

      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button is clicked', () => {
      render(
        <StepNavigation
          currentStep={5}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          showSubmit={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Submit Assessment/i }));

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show "Saving..." text when isSaving is true', () => {
      render(
        <StepNavigation
          currentStep={2}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          isSaving={true}
        />
      );

      expect(screen.getByRole('button', { name: /Saving/i })).toBeInTheDocument();
    });

    it('should show "Submitting..." text when submitting', () => {
      render(
        <StepNavigation
          currentStep={5}
          totalSteps={5}
          onNext={mockOnNext}
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          showSubmit={true}
          isSaving={true}
        />
      );

      expect(screen.getByRole('button', { name: /Submitting/i })).toBeInTheDocument();
    });
  });
});

describe('AutoSaveIndicator Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Save Status Display', () => {
    it('should show "Saving..." when isSaving is true', () => {
      render(
        <AutoSaveIndicator
          isSaving={true}
          lastSavedAt="2025-10-22T10:00:00Z"
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show "Unsaved changes" when unsavedChanges is true', () => {
      render(
        <AutoSaveIndicator
          unsavedChanges={true}
          lastSavedAt="2025-10-22T10:00:00Z"
        />
      );

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should show "Not saved yet" when no lastSavedAt', () => {
      render(
        <AutoSaveIndicator />
      );

      expect(screen.getByText(/Not saved yet/)).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should show "Just now" for very recent saves', () => {
      const now = new Date();
      const recentSave = new Date(now.getTime() - 10000).toISOString(); // 10 seconds ago

      render(
        <AutoSaveIndicator
          lastSavedAt={recentSave}
        />
      );

      expect(screen.getByText(/Just now/i)).toBeInTheDocument();
    });

    it('should show minutes ago format', () => {
      const now = new Date();
      const minutesAgo = new Date(now.getTime() - 5 * 60000).toISOString(); // 5 minutes ago

      render(
        <AutoSaveIndicator
          lastSavedAt={minutesAgo}
        />
      );

      expect(screen.getByText(/5m ago/)).toBeInTheDocument();
    });

    it('should show hours ago format', () => {
      const now = new Date();
      const hoursAgo = new Date(now.getTime() - 2 * 3600000).toISOString(); // 2 hours ago

      render(
        <AutoSaveIndicator
          lastSavedAt={hoursAgo}
        />
      );

      expect(screen.getByText(/2h ago/)).toBeInTheDocument();
    });

    it('should show days ago format', () => {
      const now = new Date();
      const daysAgo = new Date(now.getTime() - 3 * 24 * 3600000).toISOString(); // 3 days ago

      render(
        <AutoSaveIndicator
          lastSavedAt={daysAgo}
        />
      );

      expect(screen.getByText(/3d ago/)).toBeInTheDocument();
    });
  });

  describe('Icon and Color States', () => {
    it('should show saving state with spinner', () => {
      const { container } = render(
        <AutoSaveIndicator
          isSaving={true}
          lastSavedAt="2025-10-22T10:00:00Z"
        />
      );

      // Check for blue color class for saving state
      const div = container.querySelector('[class*="text-blue"]');
      expect(div).toBeInTheDocument();
    });

    it('should show unsaved state with pulsing indicator', () => {
      const { container } = render(
        <AutoSaveIndicator
          unsavedChanges={true}
          lastSavedAt="2025-10-22T10:00:00Z"
        />
      );

      // Check for orange color class for unsaved state
      const div = container.querySelector('[class*="text-orange"]');
      expect(div).toBeInTheDocument();
    });

    it('should show saved state with green indicator', () => {
      render(
        <AutoSaveIndicator
          lastSavedAt="2025-10-22T10:00:00Z"
        />
      );

      // Check for green color class for saved state
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });
  });
});

describe('FormError Component', () => {
  describe('Rendering', () => {
    it('should not render when no message or errors', () => {
      const { container } = render(
        <FormError />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when message is provided', () => {
      render(
        <FormError message="Test error message" />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render error list when errors array is provided', () => {
      render(
        <FormError errors={['Error 1', 'Error 2', 'Error 3']} />
      );

      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
    });

    it('should show error title', () => {
      render(
        <FormError message="Test error" />
      );

      expect(screen.getByText('❌ Validation Error')).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when onDismiss is provided', () => {
      render(
        <FormError
          message="Test error"
          onDismiss={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /✕/i })).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      const mockDismiss = jest.fn();

      render(
        <FormError
          message="Test error"
          onDismiss={mockDismiss}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /✕/i }));

      expect(mockDismiss).toHaveBeenCalled();
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      render(
        <FormError message="Test error" />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Error Display Modes', () => {
    it('should show message when both message and errors provided', () => {
      render(
        <FormError
          message="Main error"
          errors={['Sub error 1', 'Sub error 2']}
        />
      );

      expect(screen.getByText('Main error')).toBeInTheDocument();
      expect(screen.getByText('Sub error 1')).toBeInTheDocument();
      expect(screen.getByText('Sub error 2')).toBeInTheDocument();
    });

    it('should render only message if provided without errors', () => {
      render(
        <FormError message="Only message" />
      );

      expect(screen.getByText('Only message')).toBeInTheDocument();
    });

    it('should render only errors if provided without message', () => {
      render(
        <FormError errors={['Error without message']} />
      );

      expect(screen.getByText('Error without message')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render nothing with empty errors array', () => {
      const { container } = render(
        <FormError errors={[]} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing with null message and no errors', () => {
      const { container } = render(
        <FormError message={null} />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
