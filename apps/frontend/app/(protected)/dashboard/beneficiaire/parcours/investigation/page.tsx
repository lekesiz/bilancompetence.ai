'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'scale';
  options?: string[];
  required: boolean;
}

const questions: Question[] = [
  {
    id: 'competences_cles',
    text: 'Quelles sont selon vous vos 3 compétences professionnelles les plus fortes ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'realisations',
    text: 'Décrivez 2-3 réalisations professionnelles dont vous êtes particulièrement fier(ère)',
    type: 'textarea',
    required: true
  },
  {
    id: 'valeurs',
    text: 'Quelles valeurs sont essentielles pour vous dans votre travail ?',
    type: 'checkbox',
    options: [
      'Autonomie',
      'Créativité',
      'Sécurité',
      'Reconnaissance',
      'Équilibre vie pro/perso',
      'Impact social',
      'Développement personnel',
      'Travail d\'équipe'
    ],
    required: true
  },
  {
    id: 'environnement_ideal',
    text: 'Décrivez votre environnement de travail idéal',
    type: 'textarea',
    required: true
  },
  {
    id: 'secteurs_interet',
    text: 'Quels secteurs d\'activité vous intéressent ?',
    type: 'textarea',
    required: true
  },
  {
    id: 'contraintes',
    text: 'Quelles sont vos contraintes personnelles à prendre en compte ? (mobilité, disponibilité, etc.)',
    type: 'textarea',
    required: true
  },
  {
    id: 'formations',
    text: 'Seriez-vous prêt(e) à suivre une formation pour votre projet ?',
    type: 'radio',
    options: [
      'Oui, absolument',
      'Oui, si formation courte',
      'Peut-être, selon la durée',
      'Non, pas de formation'
    ],
    required: true
  }
];

export default function PhaseInvestigationPage() {
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

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const current = answers[questionId] || [];
    if (checked) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: [...current, option]
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: current.filter((item: string) => item !== option)
      }));
    }
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
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/parcours/investigation/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        alert('Phase d\'investigation complétée avec succès! 🎉');
        router.push('/dashboard/beneficiaire');
      } else {
        throw new Error('Failed to save answers');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Réponses sauvegardées localement (mode démo)');
      localStorage.setItem('phase_investigation_answers', JSON.stringify(answers));
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
            Phase d'Investigation
          </h1>
          <p className="text-textSecondary">
            Exploration approfondie de vos compétences et aspirations
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

          {currentQuestion.type === 'checkbox' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(answers[currentQuestion.id] || []).includes(option)}
                    onChange={(e) => handleCheckboxChange(currentQuestion.id, option, e.target.checked)}
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
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Terminer la phase ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

