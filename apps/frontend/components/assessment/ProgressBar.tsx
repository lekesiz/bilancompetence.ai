'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  progressPercentage: number;
  showLabel?: boolean;
}

export function ProgressBar({
  currentStep,
  totalSteps = 5,
  progressPercentage,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step < currentStep
                  ? 'bg-green-500 text-white'
                  : step === currentStep
                  ? 'bg-primary-600 text-white ring-2 ring-blue-300'
                  : 'bg-gray-300 text-gray-600 dark:text-gray-300'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            <span className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-300">
              {['', 'Work', 'Edu', 'Skills', 'Values', 'Context'][step]}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress label */}
      {showLabel && (
        <div className="text-center mt-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Step {currentStep} of {totalSteps} ({progressPercentage}% complete)
          </span>
        </div>
      )}
    </div>
  );
}
