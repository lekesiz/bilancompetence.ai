/**
 * AssessmentWizard Component Unit Tests
 *
 * Tests for:
 * - Rendering and layout
 * - Step navigation
 * - Data flow and state management
 * - Auto-save integration
 * - Form submission
 * - Error handling
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AssessmentWizard } from '@/components/assessment/AssessmentWizard';

// Mock the useAssessmentWizard hook
jest.mock('@/hooks/useAssessmentWizard', () => ({
  useAssessmentWizard: jest.fn(),
}));

// Mock child components
jest.mock('@/components/assessment/ProgressBar', () => ({
  ProgressBar: ({ currentStep, progressPercentage }: any) => (
    <div data-testid="progress-bar">
      Step {currentStep}, {progressPercentage}%
    </div>
  ),
}));

jest.mock('@/components/assessment/StepNavigation', () => ({
  StepNavigation: ({ currentStep, onBack, showSubmit, onSubmit }: any) => (
    <div data-testid="step-navigation">
      <button onClick={onBack} data-testid="back-button">
        Back
      </button>
      {showSubmit && (
        <button onClick={onSubmit} data-testid="submit-button">
          Submit
        </button>
      )}
      {!showSubmit && (
        <button onClick={() => {}} data-testid="next-button">
          Next
        </button>
      )}
    </div>
  ),
}));

jest.mock('@/components/assessment/AutoSaveIndicator', () => ({
  AutoSaveIndicator: ({ isSaving, lastSavedAt }: any) => (
    <div data-testid="auto-save-indicator">
      {isSaving ? 'Saving...' : `Saved ${lastSavedAt || 'never'}`}
    </div>
  ),
}));

jest.mock('@/components/assessment/FormError', () => ({
  FormError: ({ message, onDismiss }: any) => (
    message ? (
      <div data-testid="form-error">
        {message}
        {onDismiss && (
          <button onClick={onDismiss} data-testid="error-dismiss">
            Dismiss
          </button>
        )}
      </div>
    ) : null
  ),
}));

// Mock step components
jest.mock('@/components/assessment/steps/WorkHistoryStep', () => ({
  WorkHistoryStep: ({ onDataChange, onSave }: any) => (
    <div data-testid="work-history-step">
      <button onClick={() => onDataChange({ test: 'data' })} data-testid="change-work">
        Change Work
      </button>
      <button onClick={onSave} data-testid="save-work">
        Save Work
      </button>
    </div>
  ),
}));

jest.mock('@/components/assessment/steps/EducationStep', () => ({
  EducationStep: ({ onDataChange, onSave }: any) => (
    <div data-testid="education-step">
      <button onClick={() => onDataChange({ test: 'edu' })} data-testid="change-edu">
        Change Edu
      </button>
    </div>
  ),
}));

jest.mock('@/components/assessment/steps/SkillsStep', () => ({
  SkillsStep: ({ onDataChange, onSave }: any) => (
    <div data-testid="skills-step">
      <button onClick={() => onDataChange({ test: 'skills' })} data-testid="change-skills">
        Change Skills
      </button>
    </div>
  ),
}));

jest.mock('@/components/assessment/steps/MotivationsStep', () => ({
  MotivationsStep: ({ onDataChange, onSave }: any) => (
    <div data-testid="motivations-step">
      <button onClick={() => onDataChange({ test: 'motivations' })} data-testid="change-motivations">
        Change Motivations
      </button>
    </div>
  ),
}));

jest.mock('@/components/assessment/steps/ConstraintsStep', () => ({
  ConstraintsStep: ({ onDataChange, onSave }: any) => (
    <div data-testid="constraints-step">
      <button onClick={() => onDataChange({ test: 'constraints' })} data-testid="change-constraints">
        Change Constraints
      </button>
    </div>
  ),
}));

const { useAssessmentWizard } = require('@/hooks/useAssessmentWizard');

describe('AssessmentWizard Component', () => {
  const mockWizardState = {
    assessmentId: null,
    currentStep: 0,
    progressPercentage: 0,
    completedSteps: [],
    status: 'DRAFT',
    draftData: {},
    isLoading: false,
    isSaving: false,
    error: null,
    unsavedChanges: false,
    lastSavedAt: null,
  };

  const mockWizardMethods = {
    loadAssessment: jest.fn(),
    goToStep: jest.fn(),
    goNext: jest.fn(),
    goBack: jest.fn(),
    saveStep: jest.fn(),
    submitAssessment: jest.fn(),
    clearError: jest.fn(),
    updateDraftData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAssessmentWizard.mockReturnValue({
      state: { ...mockWizardState },
      ...mockWizardMethods,
    });
  });

  describe('Initial Rendering', () => {
    it('should show intro screen when no assessment created', () => {
      render(<AssessmentWizard />);

      expect(screen.getByText('Assessment Wizard')).toBeInTheDocument();
      expect(screen.getByText(/Complete this 5-step assessment/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Assessment/i })).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, isLoading: true, assessmentId: 'test-123', currentStep: 1 },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByText('Loading assessment...')).toBeInTheDocument();
    });

    it('should show work history step when currentStep is 1', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 1, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('work-history-step')).toBeInTheDocument();
    });

    it('should show education step when currentStep is 2', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 2, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('education-step')).toBeInTheDocument();
    });

    it('should show skills step when currentStep is 3', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 3, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('skills-step')).toBeInTheDocument();
    });

    it('should show motivations step when currentStep is 4', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 4, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('motivations-step')).toBeInTheDocument();
    });

    it('should show constraints step when currentStep is 5', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 5, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('constraints-step')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call goToStep(1) when Start Assessment is clicked', () => {
      render(<AssessmentWizard />);

      fireEvent.click(screen.getByRole('button', { name: /Start Assessment/i }));

      expect(mockWizardMethods.goToStep).toHaveBeenCalledWith(1);
    });

    it('should call goBack when back button is clicked', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 2, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      fireEvent.click(screen.getByTestId('back-button'));

      expect(mockWizardMethods.goBack).toHaveBeenCalled();
    });

    it('should load assessment if assessmentId prop is provided', async () => {
      mockWizardMethods.loadAssessment.mockResolvedValue(undefined);
      useAssessmentWizard.mockReturnValue({
        state: mockWizardState,
        ...mockWizardMethods,
      });

      await act(async () => {
        render(<AssessmentWizard assessmentId="test-id-123" />);
      });

      expect(mockWizardMethods.loadAssessment).toHaveBeenCalledWith('test-id-123');
    });
  });

  describe('Data Management', () => {
    it('should call updateDraftData when step data changes', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 1, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      fireEvent.click(screen.getByTestId('change-work'));

      expect(mockWizardMethods.updateDraftData).toHaveBeenCalledWith(1, { test: 'data' });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error state is set', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 1,
          assessmentId: 'test-123',
          error: 'Test error message',
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('form-error')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should call clearError when error dismiss is clicked', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 1,
          assessmentId: 'test-123',
          error: 'Test error',
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      fireEvent.click(screen.getByTestId('error-dismiss'));

      expect(mockWizardMethods.clearError).toHaveBeenCalled();
    });
  });

  describe('Unsaved Changes Warning', () => {
    it('should show unsaved changes warning', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 2,
          assessmentId: 'test-123',
          unsavedChanges: true,
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
    });

    it('should not show unsaved warning when on step 0', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 0,
          unsavedChanges: true,
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
    });
  });

  describe('Auto-Save Indicator', () => {
    it('should render auto-save indicator with state', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 1,
          assessmentId: 'test-123',
          lastSavedAt: '2025-10-22T10:00:00Z',
          isSaving: false,
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('auto-save-indicator')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar with correct values', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 2,
          assessmentId: 'test-123',
          progressPercentage: 40,
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveTextContent('Step 2, 40%');
    });
  });

  describe('Submit Functionality', () => {
    it('should show submit button on last step', () => {
      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 5, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should call submitAssessment when submit is clicked', async () => {
      mockWizardMethods.submitAssessment.mockResolvedValue(true);

      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 5, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      const mockOnComplete = jest.fn();
      render(<AssessmentWizard onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockWizardMethods.submitAssessment).toHaveBeenCalled();
      });
    });

    it('should call onComplete callback after successful submission', async () => {
      mockWizardMethods.submitAssessment.mockResolvedValue(true);

      useAssessmentWizard.mockReturnValue({
        state: { ...mockWizardState, currentStep: 5, assessmentId: 'test-123' },
        ...mockWizardMethods,
      });

      const mockOnComplete = jest.fn();
      render(<AssessmentWizard onComplete={mockOnComplete} />);

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('test-123');
      });
    });
  });

  describe('Initial Step Props', () => {
    it('should go to initialStep when no assessmentId provided', () => {
      render(<AssessmentWizard initialStep={3} />);

      expect(mockWizardMethods.goToStep).toHaveBeenCalledWith(3);
    });

    it('should default to step 1 when no initialStep provided', () => {
      render(<AssessmentWizard />);

      // Start Assessment button will call goToStep(1)
      fireEvent.click(screen.getByRole('button', { name: /Start Assessment/i }));

      expect(mockWizardMethods.goToStep).toHaveBeenCalledWith(1);
    });
  });

  describe('Summary Display', () => {
    it('should show summary on last step', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 5,
          assessmentId: 'test-123',
          progressPercentage: 100,
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
      expect(screen.getByText(/100% of assessment completed/i)).toBeInTheDocument();
    });

    it('should not show summary on earlier steps', () => {
      useAssessmentWizard.mockReturnValue({
        state: {
          ...mockWizardState,
          currentStep: 3,
          assessmentId: 'test-123',
        },
        ...mockWizardMethods,
      });

      render(<AssessmentWizard />);

      expect(screen.queryByText(/Summary/i)).not.toBeInTheDocument();
    });
  });
});
