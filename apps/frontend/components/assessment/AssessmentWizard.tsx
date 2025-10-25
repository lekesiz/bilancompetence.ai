'use client';

import { useEffect, useState } from 'react';
import { useAssessmentWizard } from '@/hooks/useAssessmentWizard';
import { ProgressBar } from './ProgressBar';
import { StepNavigation } from './StepNavigation';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { FormError } from './FormError';
import { WorkHistoryStep } from './steps/WorkHistoryStep';
import { EducationStep } from './steps/EducationStep';
import { SkillsStep } from './steps/SkillsStep';
import { MotivationsStep } from './steps/MotivationsStep';
import { ConstraintsStep } from './steps/ConstraintsStep';

interface AssessmentWizardProps {
  assessmentId?: string;
  initialStep?: number;
  onComplete?: (assessmentId: string) => void;
}

export function AssessmentWizard({
  assessmentId,
  initialStep = 1,
  onComplete,
}: AssessmentWizardProps) {
  const wizard = useAssessmentWizard();
  const { state, loadAssessment, goToStep, goNext, goBack, saveStep, submitAssessment, clearError, updateDraftData } = wizard;
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [stepData, setStepData] = useState<Record<string, any>>({});

  // Load assessment if ID provided
  useEffect(() => {
    if (assessmentId) {
      loadAssessment(assessmentId).catch(err => console.error(err));
    } else {
      goToStep(initialStep);
    }
  }, [assessmentId]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.unsavedChanges && state.currentStep > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.unsavedChanges, state.currentStep]);

  const handleDataChange = (data: Record<string, any>) => {
    setStepData(data);
    updateDraftData(state.currentStep, data);
  };

  const handleSaveStep = async () => {
    try {
      const section = ['', 'work_history', 'education', 'skills', 'motivations', 'constraints'][state.currentStep];

      // Convert stepData to answers format expected by API
      let answers: Record<string, any> = {};
      let competencies: any[] | undefined;

      // Format data based on step
      if (state.currentStep === 1) {
        answers = {
          'recent_job': stepData.recentJob,
          'previous_positions': stepData.previousPositions,
          'important_aspects': stepData.importantAspects,
        };
      } else if (state.currentStep === 2) {
        answers = {
          'highest_level': stepData.highestLevel,
          'field_of_study': stepData.fieldOfStudy,
          'certifications': stepData.certifications,
          'current_education': stepData.currentEducation,
        };
      } else if (state.currentStep === 3) {
        answers = {
          'competencies_count': stepData.competencies?.length || 0,
          'additional_skills': stepData.additionalSkills,
        };
        competencies = stepData.competencies;
      } else if (state.currentStep === 4) {
        answers = {
          'top_values': stepData.topValues?.join(','),
          'career_goals': stepData.careerGoals?.join(','),
          'motivation_description': stepData.motivationDescription,
        };
      } else if (state.currentStep === 5) {
        answers = {
          'geographic_preferences': stepData.geographicPreferences?.join(','),
          'contract_types': stepData.contractTypes?.join(','),
          'salary_expectations': stepData.salaryExpectations,
          'other_constraints': stepData.otherConstraints,
        };
      }

      await saveStep(state.currentStep, section, answers, competencies);
      goNext();
    } catch (err) {
      console.error('Error saving step:', err);
    }
  };

  const handleSubmit = async () => {
    const success = await submitAssessment();
    if (success && onComplete) {
      onComplete(state.assessmentId!);
    }
  };

  // Show intro screen if no assessment created yet
  if (!state.assessmentId && state.currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Assessment Wizard</h1>
          <p className="text-gray-600 mb-6">
            Complete this 5-step assessment to get personalized career recommendations based on your skills, experience, and goals.
          </p>

          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-700">What's included:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Work history & experience</li>
              <li>✓ Education & certifications</li>
              <li>✓ Skills assessment</li>
              <li>✓ Values & motivations</li>
              <li>✓ Preferences & constraints</li>
            </ul>
          </div>

          <button
            onClick={() => goToStep(1)}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Assessment Wizard</h1>
              <p className="text-gray-600 mt-1">Step {state.currentStep} of 5</p>
            </div>
            <AutoSaveIndicator
              lastSavedAt={state.lastSavedAt}
              isSaving={state.isSaving}
              unsavedChanges={state.unsavedChanges}
            />
          </div>

          <ProgressBar
            currentStep={state.currentStep}
            totalSteps={5}
            progressPercentage={state.progressPercentage}
            showLabel={true}
          />
        </div>

        {/* Error Display */}
        {state.error && (
          <FormError message={state.error} onDismiss={clearError} />
        )}

        {/* Unsaved Changes Warning */}
        {state.unsavedChanges && state.currentStep > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ You have unsaved changes. Click "Save & Continue" to save before moving to the next step.
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {state.currentStep === 1 && (
            <WorkHistoryStep
              data={state.draftData.step1}
              onDataChange={handleDataChange}
              onSave={handleSaveStep}
              isSaving={state.isSaving}
              error={state.error}
              onErrorDismiss={clearError}
            />
          )}

          {state.currentStep === 2 && (
            <EducationStep
              data={state.draftData.step2}
              onDataChange={handleDataChange}
              onSave={handleSaveStep}
              isSaving={state.isSaving}
              error={state.error}
              onErrorDismiss={clearError}
            />
          )}

          {state.currentStep === 3 && (
            <SkillsStep
              data={state.draftData.step3}
              onDataChange={handleDataChange}
              onSave={handleSaveStep}
              isSaving={state.isSaving}
              error={state.error}
              onErrorDismiss={clearError}
            />
          )}

          {state.currentStep === 4 && (
            <MotivationsStep
              data={state.draftData.step4}
              onDataChange={handleDataChange}
              onSave={handleSaveStep}
              isSaving={state.isSaving}
              error={state.error}
              onErrorDismiss={clearError}
            />
          )}

          {state.currentStep === 5 && (
            <ConstraintsStep
              data={state.draftData.step5}
              onDataChange={handleDataChange}
              onSave={handleSaveStep}
              isSaving={state.isSaving}
              error={state.error}
              onErrorDismiss={clearError}
            />
          )}
        </div>

        {/* Navigation */}
        <StepNavigation
          currentStep={state.currentStep}
          totalSteps={5}
          onNext={() => {}}
          onBack={goBack}
          onSubmit={state.currentStep === 5 ? handleSubmit : undefined}
          isLoading={state.isLoading}
          isSaving={state.isSaving}
          disableNext={false}
          disableBack={state.currentStep === 1}
          showSubmit={state.currentStep === 5}
        />

        {/* Summary on Last Step */}
        {state.currentStep === 5 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-blue-900 mb-4">Summary</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✓ {state.progressPercentage}% of assessment completed</p>
              <p>✓ All required information has been collected</p>
              <p>✓ Click "Submit Assessment" below to send for review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
