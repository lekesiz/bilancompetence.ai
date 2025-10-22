'use client';

interface StepNavigationProps {
  currentStep: number;
  totalSteps?: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  disableNext?: boolean;
  disableBack?: boolean;
  showSubmit?: boolean;
  submitLabel?: string;
}

export function StepNavigation({
  currentStep,
  totalSteps = 5,
  onNext,
  onBack,
  onSubmit,
  isLoading = false,
  isSaving = false,
  disableNext = false,
  disableBack = false,
  showSubmit = false,
  submitLabel = 'Submit Assessment',
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onBack}
        disabled={isFirstStep || disableBack || isLoading || isSaving}
        className={`px-6 py-2 rounded-lg font-medium transition ${
          isFirstStep || disableBack || isLoading || isSaving
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
        }`}
      >
        ← Back
      </button>

      <div className="text-center text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>

      <div className="flex gap-3">
        {isLastStep && showSubmit && onSubmit ? (
          <button
            onClick={onSubmit}
            disabled={isLoading || isSaving}
            className={`px-8 py-2 rounded-lg font-medium transition ${
              isLoading || isSaving
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSaving ? 'Submitting...' : submitLabel}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={isLastStep || disableNext || isLoading || isSaving}
            className={`px-8 py-2 rounded-lg font-medium transition ${
              isLastStep || disableNext || isLoading || isSaving
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
