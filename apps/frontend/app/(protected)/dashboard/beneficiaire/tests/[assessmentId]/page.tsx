'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Test {
  id: string;
  test_type: string;
  result_data: any;
  created_at: string;
}

export default function TestsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.assessmentId as string;
  
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      loadTests();
    }
  }, [assessmentId]);

  const loadTests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }

    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestInfo = (type: string) => {
    const testInfo: { [key: string]: { title: string; description: string; icon: string; duration: string } } = {
      'mbti': {
        title: 'Test MBTI',
        description: 'Identifiez votre type de personnalité parmi 16 profils',
        icon: '🧠',
        duration: '15 min'
      },
      'riasec': {
        title: 'Test RIASEC',
        description: 'Découvrez vos intérêts professionnels dominants',
        icon: '🎯',
        duration: '20 min'
      },
      'competences': {
        title: 'Évaluation des Compétences',
        description: 'Auto-évaluation de vos compétences professionnelles',
        icon: '💼',
        duration: '25 min'
      },
      'valeurs': {
        title: 'Test des Valeurs',
        description: 'Identifiez vos valeurs professionnelles prioritaires',
        icon: '⭐',
        duration: '10 min'
      }
    };
    return testInfo[type] || { title: type, description: '', icon: '📝', duration: '15 min' };
  };

  const isTestCompleted = (type: string) => {
    return tests.some(t => t.test_type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Chargement des tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/beneficiaire"
            className="text-primary hover:text-primary/80 mb-4 inline-flex items-center"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-bold text-textPrimary mb-2">
            Tests Psychométriques
          </h1>
          <p className="text-textSecondary">
            Complétez ces tests pour mieux vous connaître et affiner votre projet professionnel
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-textPrimary">Votre Progression</h2>
            <span className="text-3xl font-bold text-primary">
              {tests.length}/4
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${(tests.length / 4) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-textSecondary mt-2">
            {tests.length === 4 ? 'Tous les tests complétés! 🎉' : `${4 - tests.length} test(s) restant(s)`}
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TestCard
            type="mbti"
            info={getTestInfo('mbti')}
            completed={isTestCompleted('mbti')}
            assessmentId={assessmentId}
          />
          <TestCard
            type="riasec"
            info={getTestInfo('riasec')}
            completed={isTestCompleted('riasec')}
            assessmentId={assessmentId}
          />
          <TestCard
            type="competences"
            info={getTestInfo('competences')}
            completed={isTestCompleted('competences')}
            assessmentId={assessmentId}
          />
          <TestCard
            type="valeurs"
            info={getTestInfo('valeurs')}
            completed={isTestCompleted('valeurs')}
            assessmentId={assessmentId}
          />
        </div>

        {/* Completed Tests Results */}
        {tests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-textPrimary mb-4">Vos Résultats</h2>
            <div className="space-y-4">
              {tests.map((test) => (
                <TestResultCard key={test.id} test={test} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TestCard({ 
  type, 
  info, 
  completed, 
  assessmentId 
}: { 
  type: string; 
  info: any; 
  completed: boolean; 
  assessmentId: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${completed ? 'border-2 border-green-500' : 'hover:shadow-lg transition-shadow'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl">{info.icon}</div>
        {completed && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✓ Complété
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-textPrimary mb-2">{info.title}</h3>
      <p className="text-textSecondary text-sm mb-4">{info.description}</p>
      
      <div className="flex items-center text-sm text-textSecondary mb-4">
        <span className="mr-4">⏱️ {info.duration}</span>
        <span>📊 {type === 'mbti' ? '40 questions' : type === 'riasec' ? '60 questions' : '30 questions'}</span>
      </div>
      
      {completed ? (
        <Link
          href={`/dashboard/beneficiaire/tests/${assessmentId}/${type}/results`}
          className="block w-full text-center bg-gray-100 text-gray-800 dark:text-gray-100 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Voir les résultats
        </Link>
      ) : (
        <Link
          href={`/dashboard/beneficiaire/tests/${assessmentId}/${type}`}
          className="block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Commencer le test
        </Link>
      )}
    </div>
  );
}

function TestResultCard({ test }: { test: Test }) {
  const info = {
    'mbti': { icon: '🧠', color: 'bg-purple-100 text-purple-800' },
    'riasec': { icon: '🎯', color: 'bg-blue-100 text-blue-800' },
    'competences': { icon: '💼', color: 'bg-green-100 text-green-800' },
    'valeurs': { icon: '⭐', color: 'bg-yellow-100 text-yellow-800' }
  }[test.test_type] || { icon: '📝', color: 'bg-gray-100 text-gray-800 dark:text-gray-100' };

  const getResultSummary = () => {
    if (test.test_type === 'mbti' && test.result_data?.type) {
      return `Type: ${test.result_data.type}`;
    }
    if (test.test_type === 'riasec' && test.result_data?.top_three) {
      return `Top 3: ${test.result_data.top_three.map((t: any) => t.code).join(', ')}`;
    }
    if (test.test_type === 'competences' && test.result_data?.top_competences) {
      return `${test.result_data.top_competences.length} compétences fortes`;
    }
    if (test.test_type === 'valeurs' && test.result_data?.top_valeurs) {
      return `${test.result_data.top_valeurs.length} valeurs prioritaires`;
    }
    return 'Résultats disponibles';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`w-16 h-16 rounded-full ${info.color} flex items-center justify-center text-3xl`}>
          {info.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-textPrimary capitalize">
            Test {test.test_type}
          </h3>
          <p className="text-textSecondary text-sm">{getResultSummary()}</p>
          <p className="text-xs text-textSecondary mt-1">
            Complété le {new Date(test.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
      <Link
        href={`/dashboard/beneficiaire/tests/${test.id}/results`}
        className="text-primary hover:text-primary/80 font-medium"
      >
        Voir détails →
        </Link>
    </div>
  );
}

