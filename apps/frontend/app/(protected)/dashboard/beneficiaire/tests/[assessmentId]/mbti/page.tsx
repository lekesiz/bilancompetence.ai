'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface MBTIQuestion {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  direction: 1 | -1; // 1 for first letter, -1 for second letter
}

const mbtiQuestions: MBTIQuestion[] = [
  // Extraversion (E) vs Introversion (I)
  { id: 1, text: "Lors d'une soirée, vous préférez parler avec beaucoup de personnes différentes plutôt que d'avoir des conversations profondes avec quelques personnes", dimension: 'EI', direction: 1 },
  { id: 2, text: "Vous vous sentez énergisé après avoir passé du temps avec un grand groupe", dimension: 'EI', direction: 1 },
  { id: 3, text: "Vous préférez réfléchir seul avant de partager vos idées", dimension: 'EI', direction: -1 },
  { id: 4, text: "Vous aimez être le centre d'attention", dimension: 'EI', direction: 1 },
  { id: 5, text: "Vous avez besoin de temps seul pour vous ressourcer", dimension: 'EI', direction: -1 },
  
  // Sensing (S) vs Intuition (N)
  { id: 6, text: "Vous préférez vous concentrer sur les faits et les détails concrets plutôt que sur les possibilités futures", dimension: 'SN', direction: 1 },
  { id: 7, text: "Vous aimez explorer des idées nouvelles et imaginatives", dimension: 'SN', direction: -1 },
  { id: 8, text: "Vous faites plus confiance à votre expérience passée qu'à votre intuition", dimension: 'SN', direction: 1 },
  { id: 9, text: "Vous préférez les instructions étape par étape aux concepts abstraits", dimension: 'SN', direction: 1 },
  { id: 10, text: "Vous êtes attiré par les théories et les modèles conceptuels", dimension: 'SN', direction: -1 },
  
  // Thinking (T) vs Feeling (F)
  { id: 11, text: "Dans vos décisions, la logique prime sur les sentiments", dimension: 'TF', direction: 1 },
  { id: 12, text: "Vous êtes plus touché par les histoires émotionnelles que par les arguments rationnels", dimension: 'TF', direction: -1 },
  { id: 13, text: "Vous préférez être juste plutôt que compatissant", dimension: 'TF', direction: 1 },
  { id: 14, text: "Vous accordez beaucoup d'importance à l'harmonie dans vos relations", dimension: 'TF', direction: -1 },
  { id: 15, text: "Vous analysez les situations de manière objective et détachée", dimension: 'TF', direction: 1 },
  
  // Judging (J) vs Perceiving (P)
  { id: 16, text: "Vous préférez avoir un plan clair plutôt que de rester flexible", dimension: 'JP', direction: 1 },
  { id: 17, text: "Vous aimez garder vos options ouvertes le plus longtemps possible", dimension: 'JP', direction: -1 },
  { id: 18, text: "Vous vous sentez mieux quand les choses sont décidées et organisées", dimension: 'JP', direction: 1 },
  { id: 19, text: "Vous travaillez mieux sous pression et à la dernière minute", dimension: 'JP', direction: -1 },
  { id: 20, text: "Vous aimez cocher des tâches sur votre liste", dimension: 'JP', direction: 1 }
];

export default function MBTITestPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.assessmentId as string;
  
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateMBTI = () => {
    const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    
    mbtiQuestions.forEach(q => {
      const answer = answers[q.id] || 0;
      scores[q.dimension] += answer * q.direction;
    });

    const type = 
      (scores.EI > 0 ? 'E' : 'I') +
      (scores.SN > 0 ? 'S' : 'N') +
      (scores.TF > 0 ? 'T' : 'F') +
      (scores.JP > 0 ? 'J' : 'P');

    return { type, scores };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < mbtiQuestions.length) {
      alert('Veuillez répondre à toutes les questions');
      return;
    }

    setLoading(true);
    
    try {
      const result = calculateMBTI();
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${assessmentId}/mbti`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          result
        })
      });

      if (response.ok) {
        alert(`Test MBTI complété! Votre type: ${result.type}`);
        router.push(`/dashboard/beneficiaire/tests/${assessmentId}`);
      } else {
        throw new Error('Failed to save test');
      }
    } catch (error) {
      console.error('Error:', error);
      const result = calculateMBTI();
      alert(`Test MBTI complété (mode démo)!\nVotre type: ${result.type}`);
      localStorage.setItem('mbti_result', JSON.stringify(result));
      router.push(`/dashboard/beneficiaire/tests/${assessmentId}`);
    } finally {
      setLoading(false);
    }
  };

  const progress = (Object.keys(answers).length / mbtiQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href={`/dashboard/beneficiaire/tests/${assessmentId}`}
            className="text-primary hover:text-primary/80 mb-4 inline-flex items-center"
          >
            ← Retour aux tests
          </Link>
          <h1 className="text-4xl font-bold text-textPrimary mb-2">
            Test MBTI
          </h1>
          <p className="text-textSecondary">
            Identifiez votre type de personnalité parmi 16 profils
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-textPrimary">
              {Object.keys(answers).length} / {mbtiQuestions.length} questions répondues
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

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {mbtiQuestions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="text-sm font-medium text-primary">Question {index + 1}</span>
                <h3 className="text-lg font-semibold text-textPrimary mt-2">
                  {question.text}
                </h3>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary">Pas du tout d'accord</span>
                <div className="flex gap-2">
                  {[-2, -1, 0, 1, 2].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(question.id, value)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        answers[question.id] === value
                          ? 'bg-primary border-primary text-white scale-110'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {value === -2 && '😟'}
                      {value === -1 && '🙁'}
                      {value === 0 && '😐'}
                      {value === 1 && '🙂'}
                      {value === 2 && '😊'}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-textSecondary">Tout à fait d'accord</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length < mbtiQuestions.length}
            className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {loading ? 'Enregistrement...' : 'Terminer le test'}
          </button>
        </div>
      </div>
    </div>
  );
}

