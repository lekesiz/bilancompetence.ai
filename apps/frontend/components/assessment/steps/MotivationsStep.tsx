'use client';

import { useState } from 'react';
import { FormError } from '../FormError';

interface MotivationsStepProps {
  data?: {
    topValues?: string[];
    careerGoals?: string[];
    motivationDescription?: string;
  };
  onDataChange: (data: Record<string, any>) => void;
  onSave: (answers: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const CAREER_VALUES = [
  'Autonomy & Independence',
  'Continuous Learning & Growth',
  'Work-Life Balance',
  'Financial Security',
  'Making an Impact',
  'Creativity & Innovation',
  'Collaboration & Teamwork',
  'Recognition & Prestige',
  'Helping Others',
  'Stability & Security',
  'Flexibility',
  'Entrepreneurship',
];

const CAREER_GOALS = [
  'Leadership Position',
  'Subject Matter Expert',
  'Entrepreneurship / Startup',
  'Higher Education / Teaching',
  'Career Advancement',
  'Career Change',
  'Stay Current with Technology',
  'Work Internationally',
  'Remote Work Opportunities',
  'Social Impact',
  'Financial Independence',
  'Work Flexibility',
];

export function MotivationsStep({
  data = {},
  onDataChange,
  onSave,
  isSaving = false,
  error,
  onErrorDismiss,
}: MotivationsStepProps) {
  const [topValues, setTopValues] = useState<string[]>(data.topValues || []);
  const [careerGoals, setCareerGoals] = useState<string[]>(data.careerGoals || []);
  const [motivationDescription, setMotivationDescription] = useState(
    data.motivationDescription || ''
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const toggleValue = (value: string) => {
    setTopValues(
      topValues.includes(value)
        ? topValues.filter(v => v !== value)
        : [...topValues, value]
    );
  };

  const toggleGoal = (goal: string) => {
    setCareerGoals(
      careerGoals.includes(goal)
        ? careerGoals.filter(g => g !== goal)
        : [...careerGoals, goal]
    );
  };

  const handleDataChange = () => {
    onDataChange({
      topValues,
      careerGoals,
      motivationDescription,
    });
  };

  const handleSave = async () => {
    const errors: string[] = [];

    if (topValues.length === 0) {
      errors.push('Please select at least one value');
    }
    if (careerGoals.length === 0) {
      errors.push('Please select at least one career goal');
    }
    if (!motivationDescription || motivationDescription.trim().length < 20) {
      errors.push('Motivation description must be at least 20 characters');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onSave({
        topValues,
        careerGoals,
        motivationDescription,
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Step 4: Motivations & Values</h2>
        <p className="text-gray-600">What drives your career decisions?</p>
      </div>

      <FormError
        message={error}
        errors={validationErrors.length > 0 ? validationErrors : undefined}
        onDismiss={onErrorDismiss}
      />

      {/* Career Values */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          What are your top career values? (Select at least 1)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAREER_VALUES.map((value) => (
            <button
              key={value}
              onClick={() => {
                toggleValue(value);
                handleDataChange();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 text-center ${
                topValues.includes(value)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-green-400'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {topValues.length > 0 && (
          <p className="text-xs text-gray-600 mt-2">Selected: {topValues.length}</p>
        )}
      </div>

      {/* Career Goals */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          What are your top career goals? (Select at least 1)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAREER_GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => {
                toggleGoal(goal);
                handleDataChange();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 text-center ${
                careerGoals.includes(goal)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-purple-400'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
        {careerGoals.length > 0 && (
          <p className="text-xs text-gray-600 mt-2">Selected: {careerGoals.length}</p>
        )}
      </div>

      {/* Motivation Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Describe your ideal work environment and what motivates you *
        </label>
        <textarea
          value={motivationDescription}
          onChange={(e) => {
            setMotivationDescription(e.target.value);
            handleDataChange();
          }}
          placeholder="e.g., I thrive in collaborative environments where I can contribute to innovative projects. I'm motivated by continuous learning opportunities and the ability to make a tangible impact..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isSaving
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSaving ? 'Saving Step...' : 'Save & Continue'}
      </button>
    </div>
  );
}
