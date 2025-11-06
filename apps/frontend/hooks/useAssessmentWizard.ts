'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface StepData {
  [key: string]: any;
}

export interface WizardState {
  assessmentId: string | null;
  currentStep: number;
  progressPercentage: number;
  completedSteps: number[];
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';
  lastSavedAt: string | null;
  draftData: Record<string, StepData>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  unsavedChanges: boolean;
}

export interface UseAssessmentWizardReturn {
  state: WizardState;
  createAssessment: (title: string, assessmentType: 'career' | 'skills' | 'comprehensive') => Promise<string>;
  loadAssessment: (assessmentId: string) => Promise<void>;
  saveStep: (stepNumber: number, section: string, answers: Record<string, any>, competencies?: any[]) => Promise<void>;
  autoSave: (stepNumber: number, partialData: Record<string, any>) => Promise<void>;
  getProgress: (assessmentId: string) => Promise<void>;
  submitAssessment: () => Promise<boolean>;
  goToStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  updateDraftData: (stepNumber: number, data: StepData) => void;
  clearError: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useAssessmentWizard(): UseAssessmentWizardReturn {
  const [state, setState] = useState<WizardState>({
    assessmentId: null,
    currentStep: 0,
    progressPercentage: 0,
    completedSteps: [],
    status: 'DRAFT',
    lastSavedAt: null,
    draftData: {},
    isLoading: false,
    isSaving: false,
    error: null,
    unsavedChanges: false,
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get headers (auth via cookies)
  // 🔒 SECURITY: Auth handled via HttpOnly cookies
  const getHeaders = () => ({
    'Content-Type': 'application/json',
  });

  /**
   * Create a new assessment
   */
  const createAssessment = useCallback(
    async (title: string, assessmentType: 'career' | 'skills' | 'comprehensive'): Promise<string> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`${API_URL}/api/assessments`, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
          body: JSON.stringify({ title, assessment_type: assessmentType }),
        });

        if (!response.ok) {
          throw new Error('Failed to create assessment');
        }

        const data = await response.json();
        const assessmentId = data.data.id;

        setState(prev => ({
          ...prev,
          assessmentId,
          status: 'DRAFT',
          currentStep: 0,
          progressPercentage: 0,
          completedSteps: [],
          draftData: {},
          unsavedChanges: false,
        }));

        return assessmentId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  /**
   * Load existing assessment
   */
  const loadAssessment = useCallback(async (assessmentId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${API_URL}/api/assessments/${assessmentId}`, {
        headers: getHeaders(),
        credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
      });

      if (!response.ok) {
        throw new Error('Failed to load assessment');
      }

      const data = await response.json();
      const assessment = data.data;

      // Restore draft data
      const draftData = assessment.draft?.draft_data || {};

      setState(prev => ({
        ...prev,
        assessmentId,
        currentStep: assessment.current_step || 0,
        progressPercentage: assessment.progress_percentage || 0,
        status: assessment.status || 'DRAFT',
        lastSavedAt: assessment.draft?.last_saved_at || null,
        draftData,
        completedSteps: [], // Will be set by getProgress
        unsavedChanges: false,
      }));

      // Get progress info
      await getProgress(assessmentId);
      toast.success('Assessment loaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assessment';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Save a complete step with validation
   */
  const saveStep = useCallback(
    async (stepNumber: number, section: string, answers: Record<string, any>, competencies?: any[]) => {
      if (!state.assessmentId) {
        throw new Error('Assessment not initialized');
      }

      setState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        const response = await api.post(`/api/assessments/${state.assessmentId}/wizard/save-step`, {
          step_number: stepNumber,
          section,
          answers,
          competencies,
        });

        if (response.status === 'success' && response.data) {
          const data = response.data;

          setState(prev => ({
            ...prev,
            progressPercentage: data.progressPercentage || prev.progressPercentage,
            currentStep: data.currentStep || prev.currentStep,
            status: 'IN_PROGRESS',
            lastSavedAt: new Date().toISOString(),
            unsavedChanges: false,
            draftData: {
              ...prev.draftData,
              [`step${stepNumber}`]: answers,
            },
          }));

          // Get updated progress info
          await getProgress(state.assessmentId);
          toast.success('Step saved successfully!');
        } else {
          throw new Error(response.message || 'Failed to save step');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save step';
        setState(prev => ({ ...prev, error: errorMessage }));
        toast.error(errorMessage);
        throw error;
      } finally {
        setState(prev => ({ ...prev, isSaving: false }));
      }
    },
    [state.assessmentId]
  );

  /**
   * Auto-save without validation
   */
  const autoSave = useCallback(
    async (stepNumber: number, partialData: Record<string, any>) => {
      if (!state.assessmentId) {
        return; // Silent fail for auto-save
      }

      try {
        const response = await api.post(`/api/assessments/${state.assessmentId}/wizard/save-step`, {
          step_number: stepNumber,
          section: 'auto_save',
          answers: partialData,
          is_auto_save: true,
        });

        if (response.status === 'success' && response.data) {
          setState(prev => ({
            ...prev,
            lastSavedAt: response.data.savedAt || new Date().toISOString(),
            unsavedChanges: false,
          }));
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        // Don't update state on auto-save error to avoid disrupting user
      }
    },
    [state.assessmentId]
  );

  /**
   * Get progress info
   */
  const getProgress = useCallback(async (assessmentId: string) => {
    try {
      const response = await api.get(`/api/assessments/${assessmentId}/progress`);

      if (response.status === 'success' && response.data) {
        const progress = response.data;

        setState(prev => ({
          ...prev,
          currentStep: progress.currentStep || prev.currentStep,
          progressPercentage: progress.progressPercentage || prev.progressPercentage,
          completedSteps: progress.completedSteps || prev.completedSteps,
          lastSavedAt: progress.lastSavedAt || prev.lastSavedAt,
          status: progress.status || prev.status,
          draftData: progress.draftData || prev.draftData,
        }));
      }
    } catch (error) {
      console.error('Failed to get progress:', error);
    }
  }, []);

  /**
   * Submit assessment
   */
  const submitAssessment = useCallback(async (): Promise<boolean> => {
    if (!state.assessmentId) {
      throw new Error('Assessment not initialized');
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await api.post(`/api/assessments/${state.assessmentId}/submit`, {});

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          status: 'SUBMITTED',
          unsavedChanges: false,
          lastSavedAt: new Date().toISOString(),
        }));

        toast.success('Assessment submitted successfully!');
        return true;
      } else {
        throw new Error(response.message || 'Failed to submit assessment');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit assessment';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return false;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.assessmentId]);

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 5) {
      setState(prev => ({ ...prev, currentStep: step }));
    }
  }, []);

  /**
   * Move to next step
   */
  const goNext = useCallback(() => {
    setState(prev => {
      if (prev.currentStep < 5) {
        return { ...prev, currentStep: prev.currentStep + 1 };
      }
      return prev;
    });
  }, []);

  /**
   * Move to previous step
   */
  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentStep > 0) {
        return { ...prev, currentStep: prev.currentStep - 1 };
      }
      return prev;
    });
  }, []);

  /**
   * Update draft data without saving
   */
  const updateDraftData = useCallback((stepNumber: number, data: StepData) => {
    setState(prev => ({
      ...prev,
      draftData: {
        ...prev.draftData,
        [`step${stepNumber}`]: data,
      },
      unsavedChanges: true,
    }));
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Setup auto-save timer
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Only auto-save if there are unsaved changes and assessment exists
    if (state.unsavedChanges && state.assessmentId && state.currentStep > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        const stepData = state.draftData[`step${state.currentStep}`];
        if (stepData) {
          autoSave(state.currentStep, stepData);
        }
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [state.unsavedChanges, state.assessmentId, state.currentStep, state.draftData, autoSave]);

  return {
    state,
    createAssessment,
    loadAssessment,
    saveStep,
    autoSave,
    getProgress,
    submitAssessment,
    goToStep,
    goNext,
    goBack,
    updateDraftData,
    clearError,
  };
}
