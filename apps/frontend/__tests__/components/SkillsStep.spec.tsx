/**
 * SkillsStep Component Unit Tests
 *
 * Tests for:
 * - Skill selection and toggling
 * - Competency rating (assessment and interest levels)
 * - Validation rules
 * - Skill removal
 * - Additional skills input
 * - Save functionality
 * - Error handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillsStep } from '@/components/assessment/steps/SkillsStep';

// Mock FormError component
jest.mock('@/components/assessment/FormError', () => ({
  FormError: ({ message, errors, onDismiss }: any) => (
    (message || (errors && errors.length > 0)) ? (
      <div data-testid="form-error">
        {message && <p>{message}</p>}
        {errors && errors.map((err: string, idx: number) => (
          <p key={idx}>{err}</p>
        ))}
        {onDismiss && (
          <button onClick={onDismiss} data-testid="error-dismiss">
            Dismiss
          </button>
        )}
      </div>
    ) : null
  ),
}));

describe('SkillsStep Component', () => {
  const mockOnDataChange = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnErrorDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  describe('Initial Rendering', () => {
    it('should render the component with title and description', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Step 3: Skills & Competencies')).toBeInTheDocument();
      expect(screen.getByText('Select and rate your professional skills')).toBeInTheDocument();
    });

    it('should display skill categories', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Technical')).toBeInTheDocument();
      expect(screen.getByText('Soft Skills')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Languages')).toBeInTheDocument();
    });

    it('should show skill selection count', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    });
  });

  describe('Skill Selection', () => {
    it('should toggle skill selection on click', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const jsButton = screen.getByRole('button', { name: /JavaScript \/ TypeScript/i });
      fireEvent.click(jsButton);

      expect(mockOnDataChange).toHaveBeenCalled();
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });

    it('should deselect skill when already selected', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const jsButton = screen.getByRole('button', { name: /JavaScript \/ TypeScript/i });
      fireEvent.click(jsButton);
      fireEvent.click(jsButton);

      expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    });

    it('should select multiple skills', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));
      fireEvent.click(screen.getByRole('button', { name: /React \/ Vue \/ Angular/i }));
      fireEvent.click(screen.getByRole('button', { name: /Python/i }));

      expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
    });

    it('should highlight selected skills', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const jsButton = screen.getByRole('button', { name: /JavaScript \/ TypeScript/i });
      fireEvent.click(jsButton);

      expect(jsButton).toHaveClass('bg-blue-600');
    });

    it('should load pre-existing competencies', () => {
      const existingData = {
        competencies: [
          { skillName: 'JavaScript / TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
          { skillName: 'React / Vue / Angular', selfAssessmentLevel: 4, selfInterestLevel: 9 },
        ],
      };

      render(
        <SkillsStep
          data={existingData}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
      // Check that skills appear in the ratings section
      const skillElements = screen.getAllByText(/JavaScript \/ TypeScript/);
      expect(skillElements.length).toBeGreaterThan(0);
    });
  });

  describe('Competency Rating', () => {
    it('should show rating inputs for selected skills', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));

      expect(screen.getByText(/Self-Assessment:/i)).toBeInTheDocument();
      expect(screen.getByText(/Interest Level:/i)).toBeInTheDocument();
    });

    it('should update assessment level', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));

      const assessmentInput = screen.getByDisplayValue('2') as HTMLInputElement;
      fireEvent.change(assessmentInput, { target: { value: '3' } });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should update interest level', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));

      const inputs = screen.getAllByRole('slider');
      const interestInput = inputs[1]; // Second slider is interest level
      fireEvent.change(interestInput, { target: { value: '7' } });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should show correct range labels for assessment level', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));

      const labels = screen.getAllByText(/Beginner|Expert/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should show correct range labels for interest level', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));

      const labels = screen.getAllByText(/Low|High/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Skill Removal', () => {
    it('should remove skill with Remove button', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();

      const removeButton = screen.getByRole('button', { name: /Remove/i });
      fireEvent.click(removeButton);

      expect(screen.getByText(/0 selected/i)).toBeInTheDocument();
    });

    it('should remove multiple skills independently', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));
      fireEvent.click(screen.getByRole('button', { name: /Python/i }));
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();

      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);

      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });
  });

  describe('Additional Skills', () => {
    it('should have textarea for additional skills', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(/e.g., specific frameworks/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should update additional skills on input', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(/e.g., specific frameworks/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Rust, Go, Solidity' } });

      expect(mockOnDataChange).toHaveBeenCalled();
    });

    it('should load existing additional skills', () => {
      const existingData = {
        additionalSkills: 'GraphQL, WebAssembly, Kubernetes',
      };

      render(
        <SkillsStep
          data={existingData}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const textarea = screen.getByPlaceholderText(/e.g., specific frameworks/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('GraphQL, WebAssembly, Kubernetes');
    });
  });

  describe('Validation', () => {
    it('should require at least 5 skills', async () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));
      fireEvent.click(screen.getByRole('button', { name: /React \/ Vue \/ Angular/i }));
      fireEvent.click(screen.getByRole('button', { name: /Python/i }));

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-error')).toBeInTheDocument();
        expect(screen.getByText(/Please select at least 5 skills/i)).toBeInTheDocument();
      });
    });

    it('should validate assessment level is between 1-4', async () => {
      render(
        <SkillsStep
          data={{
            competencies: [
              { skillName: 'JavaScript / TypeScript', selfAssessmentLevel: 0, selfInterestLevel: 5 },
              { skillName: 'React / Vue / Angular', selfAssessmentLevel: 1, selfInterestLevel: 5 },
              { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 5 },
              { skillName: 'Java / C# / C++', selfAssessmentLevel: 3, selfInterestLevel: 5 },
              { skillName: 'SQL / Databases', selfAssessmentLevel: 4, selfInterestLevel: 5 },
            ],
          }}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Assessment level must be 1-4/i)).toBeInTheDocument();
      });
    });

    it('should validate interest level is between 1-10', async () => {
      render(
        <SkillsStep
          data={{
            competencies: [
              { skillName: 'JavaScript / TypeScript', selfAssessmentLevel: 2, selfInterestLevel: 0 },
              { skillName: 'React / Vue / Angular', selfAssessmentLevel: 2, selfInterestLevel: 5 },
              { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 5 },
              { skillName: 'Java / C# / C++', selfAssessmentLevel: 2, selfInterestLevel: 5 },
              { skillName: 'SQL / Databases', selfAssessmentLevel: 2, selfInterestLevel: 5 },
            ],
          }}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Interest level must be 1-10/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when valid data is submitted', async () => {
      render(
        <SkillsStep
          data={{
            competencies: [
              { skillName: 'JavaScript / TypeScript', selfAssessmentLevel: 3, selfInterestLevel: 8 },
              { skillName: 'React / Vue / Angular', selfAssessmentLevel: 4, selfInterestLevel: 9 },
              { skillName: 'Python', selfAssessmentLevel: 2, selfInterestLevel: 7 },
              { skillName: 'Java / C# / C++', selfAssessmentLevel: 2, selfInterestLevel: 5 },
              { skillName: 'SQL / Databases', selfAssessmentLevel: 3, selfInterestLevel: 8 },
            ],
          }}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save & Continue/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should disable save button when isSaving is true', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
          isSaving={true}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Saving Step/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show loading state during save', () => {
      render(
        <SkillsStep
          data={{
            competencies: Array.from({ length: 5 }, (_, i) => ({
              skillName: `Skill ${i + 1}`,
              selfAssessmentLevel: 2,
              selfInterestLevel: 5,
            })),
          }}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
          isSaving={true}
        />
      );

      expect(screen.getByRole('button', { name: /Saving Step/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message if provided', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
          error="Network error occurred"
          onErrorDismiss={mockOnErrorDismiss}
        />
      );

      expect(screen.getByTestId('form-error')).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should call onErrorDismiss when error is dismissed', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
          error="Test error"
          onErrorDismiss={mockOnErrorDismiss}
        />
      );

      fireEvent.click(screen.getByTestId('error-dismiss'));

      expect(mockOnErrorDismiss).toHaveBeenCalled();
    });
  });

  describe('Form State', () => {
    it('should maintain form state across multiple changes', () => {
      render(
        <SkillsStep
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      // Select skills
      fireEvent.click(screen.getByRole('button', { name: /JavaScript \/ TypeScript/i }));
      fireEvent.click(screen.getByRole('button', { name: /React \/ Vue \/ Angular/i }));

      // Add additional skills
      const textarea = screen.getByPlaceholderText(/e.g., specific frameworks/i);
      fireEvent.change(textarea, { target: { value: 'Test Framework' } });

      expect(mockOnDataChange).toHaveBeenCalledTimes(3); // 2 selections + 1 textarea
    });

    it('should preserve competency ratings when toggling skills', () => {
      const existingData = {
        competencies: [
          { skillName: 'JavaScript / TypeScript', selfAssessmentLevel: 4, selfInterestLevel: 9 },
        ],
      };

      render(
        <SkillsStep
          data={existingData}
          onDataChange={mockOnDataChange}
          onSave={mockOnSave}
        />
      );

      // Verify the rating is shown
      expect(screen.getByText(/Self-Assessment: 4\/4/)).toBeInTheDocument();
      expect(screen.getByText(/Interest Level: 9\/10/)).toBeInTheDocument();
    });
  });
});
