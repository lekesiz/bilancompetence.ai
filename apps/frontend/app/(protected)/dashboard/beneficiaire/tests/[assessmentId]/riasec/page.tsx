'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface RIASECQuestion {
  id: number;
  text: string;
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

const riasecQuestions: RIASECQuestion[] = [
  // Réaliste (R) - 10 questions
  { id: 1, text: "Travailler avec des outils et des machines", code: 'R' },
  { id: 2, text: "Réparer des objets ou des équipements", code: 'R' },
  { id: 3, text: "Travailler en extérieur", code: 'R' },
  { id: 4, text: "Construire ou assembler des choses", code: 'R' },
  { id: 5, text: "Utiliser mes mains pour créer", code: 'R' },
  { id: 6, text: "Travailler avec des animaux", code: 'R' },
  { id: 7, text: "Conduire des véhicules ou des engins", code: 'R' },
  { id: 8, text: "Faire du sport ou des activités physiques", code: 'R' },
  { id: 9, text: "Travailler de manière indépendante", code: 'R' },
  { id: 10, text: "Résoudre des problèmes pratiques", code: 'R' },
  
  // Investigateur (I) - 10 questions
  { id: 11, text: "Analyser des données et des informations", code: 'I' },
  { id: 12, text: "Faire de la recherche scientifique", code: 'I' },
  { id: 13, text: "Résoudre des problèmes complexes", code: 'I' },
  { id: 14, text: "Étudier et apprendre de nouvelles choses", code: 'I' },
  { id: 15, text: "Travailler avec des concepts abstraits", code: 'I' },
  { id: 16, text: "Mener des expériences", code: 'I' },
  { id: 17, text: "Utiliser des méthodes scientifiques", code: 'I' },
  { id: 18, text: "Comprendre comment les choses fonctionnent", code: 'I' },
  { id: 19, text: "Lire des articles scientifiques", code: 'I' },
  { id: 20, text: "Développer des théories", code: 'I' },
  
  // Artistique (A) - 10 questions
  { id: 21, text: "Créer des œuvres d'art", code: 'A' },
  { id: 22, text: "Écrire des histoires ou des poèmes", code: 'A' },
  { id: 23, text: "Jouer d'un instrument de musique", code: 'A' },
  { id: 24, text: "Dessiner ou peindre", code: 'A' },
  { id: 25, text: "Concevoir des espaces ou des objets", code: 'A' },
  { id: 26, text: "Exprimer mes émotions de manière créative", code: 'A' },
  { id: 27, text: "Travailler dans un environnement créatif", code: 'A' },
  { id: 28, text: "Innover et imaginer", code: 'A' },
  { id: 29, text: "Participer à des projets artistiques", code: 'A' },
  { id: 30, text: "Apprécier la beauté et l'esthétique", code: 'A' },
  
  // Social (S) - 10 questions
  { id: 31, text: "Aider les autres", code: 'S' },
  { id: 32, text: "Enseigner ou former", code: 'S' },
  { id: 33, text: "Travailler en équipe", code: 'S' },
  { id: 34, text: "Écouter et conseiller", code: 'S' },
  { id: 35, text: "Prendre soin des personnes", code: 'S' },
  { id: 36, text: "Résoudre des conflits", code: 'S' },
  { id: 37, text: "Organiser des événements sociaux", code: 'S' },
  { id: 38, text: "Communiquer avec différentes personnes", code: 'S' },
  { id: 39, text: "Faire du bénévolat", code: 'S' },
  { id: 40, text: "Contribuer au bien-être d'autrui", code: 'S' },
  
  // Entreprenant (E) - 10 questions
  { id: 41, text: "Diriger et manager des équipes", code: 'E' },
  { id: 42, text: "Vendre des produits ou des services", code: 'E' },
  { id: 43, text: "Prendre des décisions importantes", code: 'E' },
  { id: 44, text: "Négocier et persuader", code: 'E' },
  { id: 45, text: "Créer ma propre entreprise", code: 'E' },
  { id: 46, text: "Atteindre des objectifs ambitieux", code: 'E' },
  { id: 47, text: "Influencer les autres", code: 'E' },
  { id: 48, text: "Prendre des risques calculés", code: 'E' },
  { id: 49, text: "Développer des stratégies", code: 'E' },
  { id: 50, text: "Gérer des projets", code: 'E' },
  
  // Conventionnel (C) - 10 questions
  { id: 51, text: "Organiser et classer des informations", code: 'C' },
  { id: 52, text: "Suivre des procédures établies", code: 'C' },
  { id: 53, text: "Travailler avec des chiffres", code: 'C' },
  { id: 54, text: "Gérer des bases de données", code: 'C' },
  { id: 55, text: "Respecter les règles et les normes", code: 'C' },
  { id: 56, text: "Faire de la comptabilité", code: 'C' },
  { id: 57, text: "Planifier et coordonner", code: 'C' },
  { id: 58, text: "Vérifier l'exactitude des données", code: 'C' },
  { id: 59, text: "Utiliser des systèmes informatiques", code: 'C' },
  { id: 60, text: "Maintenir l'ordre et la structure", code: 'C' }
];

export default function RIASECTestPage() {
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

  const calculateRIASEC = () => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    riasecQuestions.forEach(q => {
      const answer = answers[q.id] || 0;
      scores[q.code] += answer;
    });

    // Sort by score
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([code, score]) => ({ code, score }));

    return {
      scores,
      top_three: sorted.slice(0, 3),
      profile: sorted[0].code + sorted[1].code + sorted[2].code
    };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < riasecQuestions.length) {
      alert('Veuillez répondre à toutes les questions');
      return;
    }

    setLoading(true);
    
    try {
      const result = calculateRIASEC();
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tests/${assessmentId}/riasec`, {
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
        alert(`Test RIASEC complété! Votre profil: ${result.profile}`);
        router.push(`/dashboard/beneficiaire/tests/${assessmentId}`);
      } else {
        throw new Error('Failed to save test');
      }
    } catch (error) {
      console.error('Error:', error);
      const result = calculateRIASEC();
      alert(`Test RIASEC complété (mode démo)!\nVotre profil: ${result.profile}`);
      localStorage.setItem('riasec_result', JSON.stringify(result));
      router.push(`/dashboard/beneficiaire/tests/${assessmentId}`);
    } finally {
      setLoading(false);
    }
  };

  const progress = (Object.keys(answers).length / riasecQuestions.length) * 100;

  const codeLabels: { [key: string]: string } = {
    R: 'Réaliste',
    I: 'Investigateur',
    A: 'Artistique',
    S: 'Social',
    E: 'Entreprenant',
    C: 'Conventionnel'
  };

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
            Test RIASEC
          </h1>
          <p className="text-textSecondary">
            Découvrez vos intérêts professionnels dominants
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Les 6 types d'intérêts professionnels</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(codeLabels).map(([code, label]) => (
              <div key={code} className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
                  {code}
                </span>
                <span className="text-textPrimary">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-textPrimary">
              {Object.keys(answers).length} / {riasecQuestions.length} questions répondues
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
        <div className="space-y-4 mb-8">
          {riasecQuestions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mr-3">
                    {question.code}
                  </span>
                  <span className="text-textPrimary">{question.text}</span>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {[0, 1, 2, 3, 4].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(question.id, value)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        answers[question.id] === value
                          ? 'bg-primary border-primary text-white scale-110'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length < riasecQuestions.length}
            className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
          >
            {loading ? 'Enregistrement...' : 'Terminer le test'}
          </button>
        </div>
      </div>
    </div>
  );
}

