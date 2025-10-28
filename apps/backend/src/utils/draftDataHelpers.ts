/**
 * Draft Data Helpers - Utilities for managing JSONB assessment draft data
 * 
 * The assessment system uses a JSONB-based architecture where all wizard responses
 * are stored in assessment_drafts.draft_data as a flexible JSON object.
 * 
 * Structure:
 * {
 *   step1: { personal_info: {...}, career_goals: {...} },
 *   step2: { skills: [...], experiences: [...] },
 *   step3: { competencies: [...] },
 *   step4: { personality: {...} },
 *   step5: { action_plan: {...} }
 * }
 */

export interface DraftData {
  step1?: {
    personal_info?: any;
    career_goals?: any;
  };
  step2?: {
    skills?: any[];
    experiences?: any[];
  };
  step3?: {
    competencies?: any[];
  };
  step4?: {
    personality?: any;
  };
  step5?: {
    action_plan?: any;
  };
}

export interface CompletionStats {
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  completedStepsList: number[];
  missingStepsList: number[];
}

/**
 * Calculate completion statistics from draft data
 */
export function calculateCompletion(draftData: DraftData): CompletionStats {
  const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
  const completedStepsList: number[] = [];
  const missingStepsList: number[] = [];

  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const stepData = draftData[step as keyof DraftData];

    if (stepData && typeof stepData === 'object' && Object.keys(stepData).length > 0) {
      completedStepsList.push(stepNumber);
    } else {
      missingStepsList.push(stepNumber);
    }
  });

  return {
    totalSteps: 5,
    completedSteps: completedStepsList.length,
    percentage: Math.round((completedStepsList.length / 5) * 100),
    completedStepsList,
    missingStepsList,
  };
}

/**
 * Extract competencies from step3 of draft data
 */
export function extractCompetenciesFromDraft(draftData: DraftData): any[] {
  if (draftData.step3 && draftData.step3.competencies && Array.isArray(draftData.step3.competencies)) {
    return draftData.step3.competencies;
  }
  return [];
}

/**
 * Validate step data based on step number
 */
export function validateStepData(stepNumber: number, stepData: any): boolean {
  if (!stepData || typeof stepData !== 'object') {
    return false;
  }

  switch (stepNumber) {
    case 1:
      // Step 1: Personal info and career goals
      return !!(stepData.personal_info || stepData.career_goals);

    case 2:
      // Step 2: Skills and experiences
      return !!(stepData.skills || stepData.experiences);

    case 3:
      // Step 3: Competencies
      return !!(stepData.competencies && Array.isArray(stepData.competencies));

    case 4:
      // Step 4: Personality assessment
      return !!stepData.personality;

    case 5:
      // Step 5: Action plan
      return !!stepData.action_plan;

    default:
      return false;
  }
}

/**
 * Merge new step data into existing draft data
 */
export function mergeDraftData(
  existingDraft: DraftData,
  stepNumber: number,
  newStepData: any
): DraftData {
  const stepKey = `step${stepNumber}` as keyof DraftData;

  return {
    ...existingDraft,
    [stepKey]: {
      ...(existingDraft[stepKey] || {}),
      ...newStepData,
    },
  };
}

/**
 * Get current step number based on draft data completion
 */
export function getCurrentStep(draftData: DraftData): number {
  const completion = calculateCompletion(draftData);

  if (completion.completedSteps === 0) {
    return 0;
  }

  // Return the next incomplete step, or 5 if all complete
  if (completion.missingStepsList.length > 0) {
    return Math.min(...completion.missingStepsList);
  }

  return 5;
}

/**
 * Check if assessment is complete (all steps filled)
 */
export function isAssessmentComplete(draftData: DraftData): boolean {
  const completion = calculateCompletion(draftData);
  return completion.completedSteps === 5;
}

/**
 * Get step status for wizard navigation
 */
export function getStepStatus(draftData: DraftData, stepNumber: number): 'completed' | 'current' | 'pending' {
  const completion = calculateCompletion(draftData);
  const currentStep = getCurrentStep(draftData);

  if (completion.completedStepsList.includes(stepNumber)) {
    return 'completed';
  }

  if (stepNumber === currentStep) {
    return 'current';
  }

  return 'pending';
}

/**
 * Initialize empty draft data structure
 */
export function initializeDraftData(): DraftData {
  return {
    step1: {},
    step2: {},
    step3: {},
    step4: {},
    step5: {},
  };
}

/**
 * Sanitize draft data (remove sensitive info if needed)
 */
export function sanitizeDraftData(draftData: DraftData, includePersonalInfo: boolean = true): DraftData {
  if (includePersonalInfo) {
    return draftData;
  }

  const sanitized = { ...draftData };

  if (sanitized.step1 && sanitized.step1.personal_info) {
    sanitized.step1 = {
      ...sanitized.step1,
      personal_info: {
        ...sanitized.step1.personal_info,
        email: '[REDACTED]',
        phone: '[REDACTED]',
        address: '[REDACTED]',
      },
    };
  }

  return sanitized;
}

/**
 * Count total items in draft data (skills, experiences, competencies, etc.)
 */
export function countDraftItems(draftData: DraftData): {
  skills: number;
  experiences: number;
  competencies: number;
  totalItems: number;
} {
  const skillsCount = draftData.step2?.skills?.length || 0;
  const experiencesCount = draftData.step2?.experiences?.length || 0;
  const competenciesCount = draftData.step3?.competencies?.length || 0;

  return {
    skills: skillsCount,
    experiences: experiencesCount,
    competencies: competenciesCount,
    totalItems: skillsCount + experiencesCount + competenciesCount,
  };
}

/**
 * Generate summary of draft data for analytics
 */
export function generateDraftSummary(draftData: DraftData): {
  completion: CompletionStats;
  items: ReturnType<typeof countDraftItems>;
  hasPersonalInfo: boolean;
  hasCareerGoals: boolean;
  hasPersonality: boolean;
  hasActionPlan: boolean;
} {
  return {
    completion: calculateCompletion(draftData),
    items: countDraftItems(draftData),
    hasPersonalInfo: !!(draftData.step1?.personal_info && Object.keys(draftData.step1.personal_info).length > 0),
    hasCareerGoals: !!(draftData.step1?.career_goals && Object.keys(draftData.step1.career_goals).length > 0),
    hasPersonality: !!(draftData.step4?.personality && Object.keys(draftData.step4.personality).length > 0),
    hasActionPlan: !!(draftData.step5?.action_plan && Object.keys(draftData.step5.action_plan).length > 0),
  };
}

