'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCsrfToken } from '@/lib/csrfHelper';
import { useTranslations } from 'next-intl';

interface ParcoursPhase {
  status: 'locked' | 'in_progress' | 'completed';
  progress: number;
  completed_at?: string;
}

interface ParcoursData {
  assessment_id: string;
  current_phase: string;
  overall_progress: number;
  phases: {
    preliminaire: ParcoursPhase;
    investigation: ParcoursPhase;
    conclusion: ParcoursPhase;
  };
}

export default function BeneficiaireDashboard() {
  const router = useRouter();
  const t = useTranslations('dashboard.beneficiary');
  const tCommon = useTranslations('common');
  const [parcours, setParcours] = useState<ParcoursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentId, setAssessmentId] = useState<string>('');

  useEffect(() => {
    loadParcours();
  }, []);

  const loadParcours = async () => {
    try {
      // 🔒 SECURITY: HttpOnly cookies (GET request doesn't need CSRF token)
      const assessmentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
        credentials: 'include', // Send HttpOnly cookies automatically
      });

      // Backend returns 401 if not authenticated
      if (assessmentsRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!assessmentsRes.ok) throw new Error('Failed to load assessments');

      const assessmentsData = await assessmentsRes.json();
      const activeAssessment = assessmentsData.assessments?.[0];

      if (!activeAssessment) {
        // No assessment yet, create one
        // 🔒 SECURITY: HttpOnly cookies + CSRF token for POST
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        const csrfToken = getCsrfToken();
        if (csrfToken) {
          headers['x-csrf-token'] = csrfToken;
        }

        const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assessments`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            title: 'Mon Bilan de Compétences',
            status: 'in_progress'
          })
        });

        if (!createRes.ok) throw new Error('Failed to create assessment');
        const newAssessment = await createRes.json();
        setAssessmentId(newAssessment.assessment.id);

        // Load parcours for new assessment
        await loadParcoursData(newAssessment.assessment.id);
      } else {
        setAssessmentId(activeAssessment.id);
        await loadParcoursData(activeAssessment.id);
      }

    } catch (error) {
      console.error('Error loading parcours:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParcoursData = async (id: string) => {
    try {
      // 🔒 SECURITY: HttpOnly cookies (GET request doesn't need CSRF token)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcours/${id}`, {
        credentials: 'include', // Send HttpOnly cookies automatically
      });

      if (res.ok) {
        const data = await res.json();
        setParcours(data);
      }
    } catch (error) {
      console.error('Error loading parcours data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">{t('loadingJourney')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-textSecondary">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Overall Progress */}
        {parcours && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-textPrimary">
                {t('overallProgress')}
              </h2>
              <span className="text-3xl font-bold text-primary">
                {parcours.overall_progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${parcours.overall_progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Phase Préliminaire */}
          <PhaseCard
            title={t('phasePreliminaryTitle')}
            description={t('phasePreliminaryDesc')}
            phase={parcours?.phases.preliminaire}
            phaseNumber={1}
            assessmentId={assessmentId}
            link="/dashboard/beneficiaire/parcours/preliminaire"
            t={t}
          />

          {/* Phase Investigation */}
          <PhaseCard
            title={t('phaseInvestigationTitle')}
            description={t('phaseInvestigationDesc')}
            phase={parcours?.phases.investigation}
            phaseNumber={2}
            assessmentId={assessmentId}
            link="/dashboard/beneficiaire/parcours/investigation"
            t={t}
          />

          {/* Phase Conclusion */}
          <PhaseCard
            title={t('phaseConclusionTitle')}
            description={t('phaseConclusionDesc')}
            phase={parcours?.phases.conclusion}
            phaseNumber={3}
            assessmentId={assessmentId}
            link="/dashboard/beneficiaire/parcours/conclusion"
            t={t}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title={t('psychometricTests')}
            description={t('psychometricTestsDesc')}
            icon="📊"
            link={`/dashboard/beneficiaire/tests/${assessmentId}`}
          />
          <ActionCard
            title={t('mySkills')}
            description={t('mySkillsDesc')}
            icon="💼"
            link="/dashboard/beneficiaire/competences"
          />
          <ActionCard
            title={t('careerPaths')}
            description={t('careerPathsDesc')}
            icon="🎯"
            link="/dashboard/beneficiaire/pistes-metiers"
          />
          <ActionCard
            title={t('myActionPlan')}
            description={t('myActionPlanDesc')}
            icon="📋"
            link="/dashboard/beneficiaire/plan-action"
          />
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  title,
  description,
  phase,
  phaseNumber,
  assessmentId,
  link,
  t
}: {
  title: string;
  description: string;
  phase?: ParcoursPhase;
  phaseNumber: number;
  assessmentId: string;
  link: string;
  t: any;
}) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'locked': return 'bg-gray-100 text-gray-600 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-600 dark:text-gray-300';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return t('statusCompleted');
      case 'in_progress': return t('statusInProgress');
      case 'locked': return t('statusLocked');
      default: return t('statusNotStarted');
    }
  };

  const isLocked = phase?.status === 'locked';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${isLocked ? 'opacity-60' : 'hover:shadow-lg transition-shadow'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {phaseNumber}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(phase?.status)}`}>
          {getStatusText(phase?.status)}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold text-textPrimary mb-2">{title}</h3>
      <p className="text-textSecondary text-sm mb-4">{description}</p>
      
      {phase && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${phase.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-textSecondary mb-4">{phase.progress}% {t('progressCompleted')}</p>
        </>
      )}

      {!isLocked && assessmentId && (
        <Link
          href={link}
          className="block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {phase?.status === 'completed' ? t('review') : t('continue')}
        </Link>
      )}

      {isLocked && (
        <button
          disabled
          className="block w-full text-center bg-gray-300 text-gray-600 dark:text-gray-300 py-2 rounded-lg cursor-not-allowed"
        >
          🔒 {t('locked')}
        </button>
      )}
    </div>
  );
}

function ActionCard({ title, description, icon, link }: { title: string; description: string; icon: string; link: string }) {
  return (
    <Link href={link} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-textPrimary mb-2">{title}</h3>
      <p className="text-textSecondary text-sm">{description}</p>
    </Link>
  );
}

