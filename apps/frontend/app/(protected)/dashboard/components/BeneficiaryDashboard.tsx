'use client';

import Link from 'next/link';
import { useBeneficiaryDashboardData } from '../hooks/useDashboardData';
import {
  StatCard,
  AssessmentCard,
  RecommendationsPanel,
  ChartPlaceholder,
} from './dashboard-components';
import { Plus, TrendingUp, Target, Award, Sparkles } from 'lucide-react';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

export function BeneficiaryDashboard() {
  const { data, loading, error } = useBeneficiaryDashboardData();

  if (error) {
    return (
      <Card variant="default" className="border-2 border-red-200 dark:border-red-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400">Erreur de chargement</h2>
          </div>
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      </Card>
    );
  }

  const stats = data?.stats || {
    totalAssessments: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
  };

  const assessments = data?.bilans || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="space-y-section">
      {/* Welcome Section - Design System v3 */}
      <Card variant="gradient" className="relative overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent-yellow" />
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              Bienvenue !
            </span>
          </div>
          <h1 className="text-hero-mobile md:text-hero font-bold text-white mb-4">
            Bon retour sur votre espace
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Suivez votre progression, découvrez vos recommandations personnalisées et continuez votre parcours professionnel
          </p>
        </div>
      </Card>

      {/* Quick Stats - Design System v3 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-8 h-8 text-primary-600" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Votre progression
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="blue-light" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              {stats.totalAssessments > 0 && (
                <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-full">
                  +12%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Bilans
            </p>
            {loading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalAssessments}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Depuis le début
            </p>
          </Card>

          <Card variant="purple-light" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {stats.completedAssessments > 0 && (
                <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-full">
                  +8%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Terminés
            </p>
            {loading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.completedAssessments}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Avec succès
            </p>
          </Card>

          <Card variant="default" className="p-6 border-2 border-accent-orange">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-orange/80 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              En cours
            </p>
            {loading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.pendingAssessments}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              À compléter
            </p>
          </Card>

          {stats.averageSatisfaction !== undefined && (
            <Card variant="default" className="p-6 border-2 border-success-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-full">
                  +5%
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Satisfaction
              </p>
              {loading ? (
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {stats.averageSatisfaction.toFixed(1)}/5
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Score moyen
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder
          title="Progression des bilans"
          chartType="line"
          data={assessments.length > 0 ? assessments : []}
          loading={loading}
        />
        <ChartPlaceholder
          title="Domaines de compétences"
          chartType="pie"
          data={recommendations.length > 0 ? recommendations : []}
          loading={loading}
        />
      </div>

      {/* Active Assessments Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-secondary-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Vos bilans
            </h2>
          </div>
          {assessments.length === 0 && !loading && (
            <Button
              variant="primary-gradient"
              size="lg"
              onClick={() => window.location.href = '/assessments/create'}
            >
              <Plus className="w-5 h-5" />
              Démarrer un bilan
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <Card variant="default" className="text-center p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Aucun bilan pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
              Commencez votre premier bilan pour obtenir des recommandations personnalisées et des insights sur votre développement professionnel
            </p>
            <Button
              variant="primary-gradient"
              size="lg"
              onClick={() => window.location.href = '/assessments/create'}
            >
              <Plus className="w-5 h-5" />
              Créer votre premier bilan
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onEdit={() => {
                  window.location.href = `/assessments/${assessment.id}/edit`;
                }}
                onView={() => {
                  window.location.href = `/assessments/${assessment.id}`;
                }}
                onDelete={() => {
                  console.log('Delete assessment:', assessment.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-success-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Recommandations IA
            </h2>
          </div>
          <RecommendationsPanel
            recommendations={recommendations}
            userRole="BENEFICIARY"
          />
        </div>
      )}

      {/* Empty state for recommendations */}
      {!loading && recommendations.length === 0 && assessments.length > 0 && (
        <Card variant="blue-light" className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Obtenez des recommandations personnalisées
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Complétez un bilan pour recevoir des suggestions d'emplois, de formations et d'amélioration de compétences adaptées à vos objectifs professionnels.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card variant="default" className="p-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Visitez notre{' '}
              <Link href="/help" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold underline">
                centre d'aide
              </Link>
              {' '}ou{' '}
              <Link href="/contact" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold underline">
                contactez le support
              </Link>
              {' '}pour toute assistance concernant vos bilans.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

