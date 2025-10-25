'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

const questions: Question[] = [
  {
    id: 'projet_professionnel',
    text: 'Décrivez votre projet professionnel tel qu\'il se dessine maintenant',
    type: 'textarea',
    required: true
  },
  {
    id: 'metiers_cibles',
    text: 'Quels sont les 2-3 métiers qui vous intéressent le plus ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'actions_prioritaires',
    text: 'Quelles sont les 3 premières actions à mettre en œuvre ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'formations_necessaires',
    text: 'Avez-vous identifié des formations nécessaires ?',
    type: 'radio',
    options: [
      'Oui, j\'ai identifié des formations précises',
      'Oui, mais j\'ai besoin d\'aide pour les choisir',
      'Non, pas de formation nécessaire',
      'Je ne sais pas encore'
    ],
    required: true
  },
  {
    id: 'echeance',
    text: 'Dans quel délai souhaitez-vous concrétiser votre projet ?',
    type: 'radio',
    options: [
      'Moins de 6 mois',
      '6 à 12 mois',
      '1 à 2 ans',
      'Plus de 2 ans'
    ],
    required: true
  },
  {
    id: 'obstacles',
    text: 'Quels obstacles ou freins identifiez-vous ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'ressources',
    text: 'Quelles ressources (personnes, réseaux, financements) pouvez-vous mobiliser ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'satisfaction',
    text: 'Comment évaluez-vous votre satisfaction par rapport à ce bilan ?',
    type: 'radio',
    options: [
      'Très satisfait(e) - J\'ai une vision claire',
      'Satisfait(e) - J\'ai avancé significativement',
      'Moyennement satisfait(e) - Il reste du travail',
      'Peu satisfait(e) - J\'ai besoin de plus d\'accompagnement'
    ],
    required: true
  }
];

export default function PhaseConclusionPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      alert('Veuillez répondre à cette question avant de continuer');
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcours/conclusion/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        alert('🎉 Félicitations! Vous avez terminé votre bilan de compétences!\n\nVous allez recevoir votre document de synthèse par email.');
        router.push('/dashboard/beneficiaire');
      } else {
        throw new Error('Failed to save answers');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('🎉 Bilan complété! (mode démo)\n\nVos réponses ont été sauvegardées localement.');
      localStorage.setItem('phase_conclusion_answers', JSON.stringify(answers));
      localStorage.setItem('bilan_completed', 'true');
      router.push('/dashboard/beneficiaire');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard/beneficiaire"
            className="text-primary hover:text-primary/80 mb-4 inline-flex items-center"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-bold text-textPrimary mb-2">
            Phase de Conclusion
          </h1>
          <p className="text-textSecondary">
            Synthèse et élaboration de votre projet professionnel
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-textPrimary">
              Question {currentStep + 1} sur {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-textPrimary mb-6">
            {currentQuestion.text}
          </h2>

          {currentQuestion.type === 'textarea' && (
            <textarea
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none min-h-[200px]"
              placeholder="Votre réponse..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === 'text' && (
            <input
              type="text"
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
              placeholder="Votre réponse..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
            />
          )}

          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                    className="mr-3 w-5 h-5 text-primary"
                  />
                  <span className="text-textPrimary">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          {currentStep < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : '🎉 Terminer mon bilan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

