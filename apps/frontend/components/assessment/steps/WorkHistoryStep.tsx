'use client';

import { useState } from 'react';
import { FormError } from '../FormError';

interface WorkHistoryStepProps {
  data?: {
    recentJob?: string;
    previousPositions?: string;
    importantAspects?: string;
  };
  onDataChange: (data: Record<string, any>) => void;
  onSave: (answers: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export function WorkHistoryStep({
  data = {},
  onDataChange,
  onSave,
  isSaving = false,
  error,
  onErrorDismiss,
}: WorkHistoryStepProps) {
  const [formData, setFormData] = useState({
    recentJob: data.recentJob || '',
    previousPositions: data.previousPositions || '',
    importantAspects: data.importantAspects || '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
    setValidationErrors([]); // Clear errors on change
  };

  const handleSave = async () => {
    // Validate
    const errors: string[] = [];

    if (!formData.recentJob || formData.recentJob.trim().length < 10) {
      errors.push('Recent job description must be at least 10 characters');
    }
    if (!formData.previousPositions || formData.previousPositions.trim().length < 10) {
      errors.push('Previous positions must be at least 10 characters');
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Step 1: Work History</h2>
        <p className="text-gray-600 dark:text-gray-300">Tell us about your professional background</p>
      </div>

      <FormError
        message={error}
        errors={validationErrors.length > 0 ? validationErrors : undefined}
        onDismiss={onErrorDismiss}
      />

      {/* Recent Job */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Describe Your Most Recent Job Position *
        </label>
        <textarea
          value={formData.recentJob}
          onChange={(e) => handleChange('recentJob', e.target.value)}
          placeholder="Job title, company, duration, main responsibilities..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Minimum 10 characters required</p>
      </div>

      {/* Previous Positions */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          List All Previous Positions (Reverse Chronological) *
        </label>
        <textarea
          value={formData.previousPositions}
          onChange={(e) => handleChange('previousPositions', e.target.value)}
          placeholder="Format: Job Title | Company | Years&#10;e.g., Senior Developer | TechCorp | 2020-2023&#10;Developer | StartupX | 2018-2020"
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Minimum 10 characters required</p>
      </div>

      {/* Important Aspects */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          What aspects of your work history are most important to you?
        </label>
        <textarea
          value={formData.importantAspects}
          onChange={(e) => handleChange('importantAspects', e.target.value)}
          placeholder="e.g., challenging projects, team collaboration, continuous learning..."
          rows={3}
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
