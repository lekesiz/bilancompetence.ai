'use client';

import { useState } from 'react';
import { FormError } from '../FormError';

interface EducationStepProps {
  data?: {
    highestLevel?: string;
    fieldOfStudy?: string;
    certifications?: string;
    currentEducation?: string;
  };
  onDataChange: (data: Record<string, any>) => void;
  onSave: (answers: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export function EducationStep({
  data = {},
  onDataChange,
  onSave,
  isSaving = false,
  error,
  onErrorDismiss,
}: EducationStepProps) {
  const [formData, setFormData] = useState({
    highestLevel: data.highestLevel || '',
    fieldOfStudy: data.fieldOfStudy || '',
    certifications: data.certifications || '',
    currentEducation: data.currentEducation || '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const educationLevels = [
    { value: 'bac', label: 'Baccalauréat' },
    { value: 'bac+2', label: 'Bac+2 (DEUG, BTS, DUT)' },
    { value: 'bac+3', label: 'Bac+3 (Licence)' },
    { value: 'bac+5', label: 'Bac+5 (Master, Ingénieur)' },
    { value: 'bac+8', label: 'Bac+8+ (Doctorat)' },
  ];

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    setValidationErrors([]);
  };

  const handleSave = async () => {
    const errors: string[] = [];

    if (!formData.highestLevel) {
      errors.push('Please select your highest education level');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Step 2: Education</h2>
        <p className="text-gray-600 dark:text-gray-300">Tell us about your educational background</p>
      </div>

      <FormError
        message={error}
        errors={validationErrors.length > 0 ? validationErrors : undefined}
        onDismiss={onErrorDismiss}
      />

      {/* Highest Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          What is your highest level of education? *
        </label>
        <select
          value={formData.highestLevel}
          onChange={(e) => handleChange('highestLevel', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">-- Select an option --</option>
          {educationLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* Field of Study */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          What is your field of study?
        </label>
        <input
          type="text"
          value={formData.fieldOfStudy}
          onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
          placeholder="e.g., Computer Science, Business Administration, Engineering..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Optional</p>
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Do you have any professional certifications or qualifications?
        </label>
        <textarea
          value={formData.certifications}
          onChange={(e) => handleChange('certifications', e.target.value)}
          placeholder="e.g., AWS Solutions Architect, PMP, SCRUM Master, etc."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Optional</p>
      </div>

      {/* Current Education */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Are you currently pursuing any education or training?
        </label>
        <input
          type="text"
          value={formData.currentEducation}
          onChange={(e) => handleChange('currentEducation', e.target.value)}
          placeholder="e.g., Online course, University degree, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Optional</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isSaving
            ? 'bg-gray-300 text-gray-500 dark:text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {isSaving ? 'Saving Step...' : 'Save & Continue'}
      </button>
    </div>
  );
}
