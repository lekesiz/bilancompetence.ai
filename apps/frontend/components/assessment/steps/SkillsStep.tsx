'use client';

import { useState } from 'react';
import { FormError } from '../FormError';

interface SkillsStepProps {
  data?: {
    competencies?: Array<{
      skillName: string;
      selfAssessmentLevel: number;
      selfInterestLevel: number;
      context?: string;
    }>;
    additionalSkills?: string;
  };
  onDataChange: (data: Record<string, any>) => void;
  onSave: (answers: Record<string, any>, competencies: any[]) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const PREDEFINED_SKILLS = [
  // Technical Skills
  { name: 'JavaScript / TypeScript', category: 'Technical' },
  { name: 'React / Vue / Angular', category: 'Technical' },
  { name: 'Node.js / Express', category: 'Technical' },
  { name: 'Python', category: 'Technical' },
  { name: 'Java / C# / C++', category: 'Technical' },
  { name: 'SQL / Databases', category: 'Technical' },
  { name: 'Cloud (AWS / Azure / GCP)', category: 'Technical' },
  { name: 'Docker / Kubernetes', category: 'Technical' },
  { name: 'DevOps / CI/CD', category: 'Technical' },
  { name: 'Machine Learning / AI', category: 'Technical' },
  { name: 'Data Analysis', category: 'Technical' },
  { name: 'Mobile Development', category: 'Technical' },
  // Soft Skills
  { name: 'Leadership', category: 'Soft Skills' },
  { name: 'Communication', category: 'Soft Skills' },
  { name: 'Problem Solving', category: 'Soft Skills' },
  { name: 'Project Management', category: 'Soft Skills' },
  { name: 'Teamwork', category: 'Soft Skills' },
  { name: 'Time Management', category: 'Soft Skills' },
  { name: 'Creativity', category: 'Soft Skills' },
  { name: 'Critical Thinking', category: 'Soft Skills' },
  // Business Skills
  { name: 'Business Analysis', category: 'Business' },
  { name: 'Financial Analysis', category: 'Business' },
  { name: 'Strategic Planning', category: 'Business' },
  { name: 'Sales', category: 'Business' },
  { name: 'Marketing', category: 'Business' },
  { name: 'Negotiation', category: 'Business' },
  // Languages
  { name: 'English', category: 'Languages' },
  { name: 'Spanish', category: 'Languages' },
  { name: 'German', category: 'Languages' },
  { name: 'Italian', category: 'Languages' },
  { name: 'Mandarin', category: 'Languages' },
  { name: 'Arabic', category: 'Languages' },
];

export function SkillsStep({
  data = {},
  onDataChange,
  onSave,
  isSaving = false,
  error,
  onErrorDismiss,
}: SkillsStepProps) {
  const [competencies, setCompetencies] = useState<Array<{
    skillName: string;
    selfAssessmentLevel: number;
    selfInterestLevel: number;
    context?: string;
  }>>(data.competencies || []);

  const [additionalSkills, setAdditionalSkills] = useState(data.additionalSkills || '');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const toggleSkill = (skillName: string) => {
    const exists = competencies.find(c => c.skillName === skillName);
    if (exists) {
      setCompetencies(competencies.filter(c => c.skillName !== skillName));
    } else {
      setCompetencies([...competencies, {
        skillName,
        selfAssessmentLevel: 2,
        selfInterestLevel: 5,
      }]);
    }
  };

  const updateCompetency = (skillName: string, field: string, value: any) => {
    setCompetencies(competencies.map(c =>
      c.skillName === skillName ? { ...c, [field]: value } : c
    ));
  };

  const handleDataChange = () => {
    onDataChange({
      competencies,
      additionalSkills,
    });
  };

  const handleSave = async () => {
    const errors: string[] = [];

    if (competencies.length < 5) {
      errors.push(`Please select at least 5 skills (you have selected ${competencies.length})`);
    }

    competencies.forEach((comp, idx) => {
      if (!comp.selfAssessmentLevel || comp.selfAssessmentLevel < 1 || comp.selfAssessmentLevel > 4) {
        errors.push(`Skill ${idx + 1}: Assessment level must be 1-4`);
      }
      if (!comp.selfInterestLevel || comp.selfInterestLevel < 1 || comp.selfInterestLevel > 10) {
        errors.push(`Skill ${idx + 1}: Interest level must be 1-10`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onSave(
        { competencies, additionalSkills },
        competencies
      );
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Step 3: Skills & Competencies</h2>
        <p className="text-gray-600">Select and rate your professional skills</p>
      </div>

      <FormError
        message={error}
        errors={validationErrors.length > 0 ? validationErrors : undefined}
        onDismiss={onErrorDismiss}
      />

      {/* Skills Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select your skills (minimum 5 required) - {competencies.length} selected
        </label>

        <div className="space-y-4">
          {['Technical', 'Soft Skills', 'Business', 'Languages'].map((category) => (
            <div key={category}>
              <h4 className="font-semibold text-gray-700 text-sm mb-2">{category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PREDEFINED_SKILLS.filter(s => s.category === category).map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => {
                      toggleSkill(skill.name);
                      handleDataChange();
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition border-2 ${
                      competencies.find(c => c.skillName === skill.name)
                        ? 'bg-primary-600 text-white border-blue-600'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Skills with Ratings */}
      {competencies.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Rate Your Skills</h3>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            {competencies.map((comp) => (
              <div key={comp.skillName} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{comp.skillName}</span>
                  <button
                    onClick={() => {
                      setCompetencies(competencies.filter(c => c.skillName !== comp.skillName));
                      handleDataChange();
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Assessment Level */}
                  <div>
                    <label className="text-xs text-gray-600">
                      Self-Assessment: {comp.selfAssessmentLevel}/4
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={comp.selfAssessmentLevel}
                      onChange={(e) => {
                        updateCompetency(comp.skillName, 'selfAssessmentLevel', parseInt(e.target.value));
                        handleDataChange();
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>

                  {/* Interest Level */}
                  <div>
                    <label className="text-xs text-gray-600">
                      Interest Level: {comp.selfInterestLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={comp.selfInterestLevel}
                      onChange={(e) => {
                        updateCompetency(comp.skillName, 'selfInterestLevel', parseInt(e.target.value));
                        handleDataChange();
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Skills */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          List any additional skills not shown above
        </label>
        <textarea
          value={additionalSkills}
          onChange={(e) => {
            setAdditionalSkills(e.target.value);
            handleDataChange();
          }}
          placeholder="e.g., specific frameworks, tools, or skills..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">Optional</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          isSaving
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        {isSaving ? 'Saving Step...' : 'Save & Continue'}
      </button>
    </div>
  );
}
