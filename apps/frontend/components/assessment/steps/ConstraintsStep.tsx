'use client';

import { useState } from 'react';
import { FormError } from '../FormError';

interface ConstraintsStepProps {
  data?: {
    geographicPreferences?: string[];
    contractTypes?: string[];
    salaryExpectations?: string;
    otherConstraints?: string;
  };
  onDataChange: (data: Record<string, any>) => void;
  onSave: (answers: Record<string, any>) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const GEOGRAPHIC_PREFERENCES = [
  'Remote / Work from home',
  'Île-de-France (Paris region)',
  'Auvergne-Rhône-Alpes',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Hauts-de-France',
  'Bourgogne-Franche-Comté',
  'Normandie',
  'Brittany',
  'Pays de la Loire',
  'Centre-Val de Loire',
  'Provence-Alpes-Côte d\'Azur',
  'Corsica',
  'Alsace',
  'International',
];

const CONTRACT_TYPES = [
  'CDI (Permanent contract)',
  'CDD (Fixed-term contract)',
  'Interim (Temporary)',
  'Freelance / Consultant',
  'Entrepreneur / Startup',
  'Part-time',
  'Apprenticeship',
];

const SALARY_RANGES = [
  { value: 'under_25k', label: 'Under €25,000' },
  { value: '25k_35k', label: '€25,000 - €35,000' },
  { value: '35k_50k', label: '€35,000 - €50,000' },
  { value: '50k_70k', label: '€50,000 - €70,000' },
  { value: '70k_100k', label: '€70,000 - €100,000' },
  { value: '100k_150k', label: '€100,000 - €150,000' },
  { value: 'over_150k', label: 'Over €150,000' },
  { value: 'no_preference', label: 'Prefer not to specify' },
];

export function ConstraintsStep({
  data = {},
  onDataChange,
  onSave,
  isSaving = false,
  error,
  onErrorDismiss,
}: ConstraintsStepProps) {
  const [geographicPreferences, setGeographicPreferences] = useState<string[]>(
    data.geographicPreferences || []
  );
  const [contractTypes, setContractTypes] = useState<string[]>(
    data.contractTypes || []
  );
  const [salaryExpectations, setSalaryExpectations] = useState(
    data.salaryExpectations || ''
  );
  const [otherConstraints, setOtherConstraints] = useState(
    data.otherConstraints || ''
  );

  const toggleGeographic = (pref: string) => {
    setGeographicPreferences(
      geographicPreferences.includes(pref)
        ? geographicPreferences.filter(p => p !== pref)
        : [...geographicPreferences, pref]
    );
  };

  const toggleContract = (contract: string) => {
    setContractTypes(
      contractTypes.includes(contract)
        ? contractTypes.filter(c => c !== contract)
        : [...contractTypes, contract]
    );
  };

  const handleDataChange = () => {
    onDataChange({
      geographicPreferences,
      contractTypes,
      salaryExpectations,
      otherConstraints,
    });
  };

  const handleSave = async () => {
    try {
      await onSave({
        geographicPreferences,
        contractTypes,
        salaryExpectations,
        otherConstraints,
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Step 5: Constraints & Context</h2>
        <p className="text-gray-600 dark:text-gray-300">What are your work constraints and preferences?</p>
      </div>

      <FormError
        message={error}
        errors={undefined}
        onDismiss={onErrorDismiss}
      />

      {/* Geographic Preferences */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Geographic preferences (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {GEOGRAPHIC_PREFERENCES.map((pref) => (
            <button
              key={pref}
              onClick={() => {
                toggleGeographic(pref);
                handleDataChange();
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${
                geographicPreferences.includes(pref)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 hover:border-indigo-400'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Types */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Types of employment contracts you're interested in
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CONTRACT_TYPES.map((contract) => (
            <button
              key={contract}
              onClick={() => {
                toggleContract(contract);
                handleDataChange();
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${
                contractTypes.includes(contract)
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 hover:border-pink-400'
              }`}
            >
              {contract}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Expectations */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Salary expectations
        </label>
        <select
          value={salaryExpectations}
          onChange={(e) => {
            setSalaryExpectations(e.target.value);
            handleDataChange();
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">-- Select your salary range --</option>
          {SALARY_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Optional</p>
      </div>

      {/* Other Constraints */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Are there any other constraints or conditions important for your next role?
        </label>
        <textarea
          value={otherConstraints}
          onChange={(e) => {
            setOtherConstraints(e.target.value);
            handleDataChange();
          }}
          placeholder="e.g., Specific working hours, technology stack preferences, team size, company culture, benefits..."
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
