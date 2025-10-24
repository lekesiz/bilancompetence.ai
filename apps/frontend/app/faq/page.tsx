'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  // Généralités
  {
    category: 'Généralités',
    question: 'Qu\'est-ce qu\'un bilan de compétences ?',
    answer: 'Le bilan de compétences est une démarche d\'accompagnement individuel qui permet d\'analyser vos compétences professionnelles et personnelles, vos aptitudes et vos motivations. Il vous aide à définir un projet professionnel réaliste et motivant, ou à valider un projet de formation.'
  },
  {
    category: 'Généralités',
    question: 'Combien de temps dure un bilan de compétences ?',
    answer: 'Un bilan de compétences dure en moyenne 20 à 24 heures, réparties sur 2 à 3 mois. Cette durée permet un accompagnement approfondi tout en s\'adaptant à votre rythme et vos disponibilités.'
  },
  {
    category: 'Généralités',
    question: 'Le bilan de compétences est-il confidentiel ?',
    answer: 'Oui, absolument ! Le bilan est strictement confidentiel. Les résultats vous appartiennent et ne peuvent être communiqués à un tiers (y compris votre employeur) sans votre accord écrit. Cette confidentialité est garantie par la loi.'
  },
  {
    category: 'Généralités',
    question: 'Qui peut faire un bilan de compétences ?',
    answer: 'Toute personne active peut réaliser un bilan de compétences : salariés du secteur privé, agents publics, demandeurs d\'emploi, travailleurs indépendants. Il n\'y a pas de condition d\'âge ou d\'ancienneté.'
  },

  // Déroulement
  {
    category: 'Déroulement',
    question: 'Comment se déroule un bilan de compétences ?',
    answer: 'Le bilan se déroule en 3 phases : 1) Phase préliminaire (4-6h) pour définir vos besoins et objectifs, 2) Phase d\'investigation (12-16h) pour explorer vos compétences et pistes professionnelles, 3) Phase de conclusion (4-6h) pour élaborer votre projet et plan d\'action.'
  },
  {
    category: 'Déroulement',
    question: 'Puis-je faire mon bilan à distance ?',
    answer: 'Oui ! Nous proposons des bilans 100% à distance, en présentiel, ou en format mixte. Les bilans à distance se déroulent par visioconférence et sont tout aussi efficaces que les bilans en présentiel.'
  },
  {
    category: 'Déroulement',
    question: 'À quelle fréquence ont lieu les rendez-vous ?',
    answer: 'Les rendez-vous sont généralement espacés de 1 à 2 semaines pour vous laisser le temps de réaliser les travaux personnels entre chaque séance. Le rythme est adapté à vos disponibilités et contraintes.'
  },
  {
    category: 'Déroulement',
    question: 'Quels tests vais-je passer ?',
    answer: 'Vous passerez plusieurs tests psychométriques validés scientifiquement : test de personnalité MBTI, test d\'intérêts professionnels RIASEC, inventaire de compétences, et test de valeurs professionnelles. Ces tests sont des outils d\'aide à la réflexion.'
  },

  // Financement
  {
    category: 'Financement',
    question: 'Combien coûte un bilan de compétences ?',
    answer: 'Le coût d\'un bilan de compétences varie entre 1 500€ et 3 000€ selon la durée et les modalités. Chez BilanCompetence.AI, nos tarifs sont transparents et nous vous accompagnons dans le montage de votre dossier de financement.'
  },
  {
    category: 'Financement',
    question: 'Puis-je utiliser mon CPF pour financer mon bilan ?',
    answer: 'Oui ! Le bilan de compétences est éligible au CPF (Compte Personnel de Formation). Vous pouvez consulter vos droits sur moncompteformation.gouv.fr et vous inscrire directement en ligne. Aucune autorisation de votre employeur n\'est nécessaire.'
  },
  {
    category: 'Financement',
    question: 'Que faire si mon CPF ne couvre pas tout le coût ?',
    answer: 'Plusieurs solutions existent : abondement par Pôle Emploi si vous êtes demandeur d\'emploi, financement complémentaire par votre OPCO, ou participation de votre employeur via le plan de développement des compétences. Nous vous aidons à trouver la meilleure solution.'
  },
  {
    category: 'Financement',
    question: 'Mon employeur sera-t-il informé si j\'utilise mon CPF ?',
    answer: 'Non, si vous réalisez votre bilan hors temps de travail et le financez via votre CPF, votre employeur n\'en sera pas informé. Votre démarche reste strictement confidentielle.'
  },

  // Résultats
  {
    category: 'Résultats',
    question: 'Que vais-je obtenir à la fin du bilan ?',
    answer: 'Vous recevrez un document de synthèse confidentiel récapitulant vos compétences, motivations, projet professionnel et plan d\'action détaillé. Vous obtiendrez également une attestation de réalisation du bilan.'
  },
  {
    category: 'Résultats',
    question: 'Le bilan garantit-il de trouver un emploi ?',
    answer: 'Le bilan n\'est pas un placement professionnel, mais un outil d\'aide à la décision. Il vous permet de clarifier votre projet, d\'identifier vos atouts et de construire un plan d\'action concret. C\'est ensuite à vous de mettre en œuvre ce plan.'
  },
  {
    category: 'Résultats',
    question: 'Puis-je être accompagné après le bilan ?',
    answer: 'Oui, nous proposons des prestations d\'accompagnement post-bilan : aide à la recherche d\'emploi, préparation aux entretiens, accompagnement à la création d\'entreprise, etc. Ces prestations sont optionnelles et sur devis.'
  },

  // Pratique
  {
    category: 'Pratique',
    question: 'Puis-je faire mon bilan sur mon temps de travail ?',
    answer: 'Oui, si votre employeur accepte. Vous pouvez demander un congé de bilan de compétences ou réaliser le bilan dans le cadre du plan de développement des compétences. Sinon, vous pouvez le faire hors temps de travail sans autorisation.'
  },
  {
    category: 'Pratique',
    question: 'Combien de temps faut-il pour démarrer un bilan ?',
    answer: 'Avec le CPF, vous pouvez démarrer très rapidement (sous 2 semaines après validation de votre dossier). Pour les autres financements, comptez 2 à 6 semaines selon l\'organisme financeur.'
  },
  {
    category: 'Pratique',
    question: 'Vos consultants sont-ils certifiés ?',
    answer: 'Oui, tous nos consultants sont certifiés et expérimentés dans l\'accompagnement professionnel. Notre organisme est certifié Qualiopi, gage de qualité reconnu par l\'État.'
  },
  {
    category: 'Pratique',
    question: 'Puis-je changer de consultant en cours de bilan ?',
    answer: 'Si pour une raison quelconque le courant ne passe pas avec votre consultant, vous pouvez demander à en changer. Votre satisfaction et votre confort sont essentiels pour la réussite de votre bilan.'
  }
];

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  const categories = ['Tous', ...Array.from(new Set(faqData.map(item => item.category)))];
  const filteredFAQ = selectedCategory === 'Tous' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Questions Fréquentes</h1>
          <p className="text-xl opacity-90">
            Trouvez rapidement les réponses à vos questions sur le bilan de compétences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-textPrimary hover:bg-gray-50 shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between"
              >
                <div className="flex items-start flex-1">
                  <span className="text-primary font-bold text-xl mr-4">Q</span>
                  <span className="font-semibold text-textPrimary text-lg pr-4">
                    {item.question}
                  </span>
                </div>
                <svg
                  className={`w-6 h-6 text-primary transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <div className="flex items-start border-t pt-4">
                    <span className="text-green-600 font-bold text-xl mr-4">R</span>
                    <p className="text-textSecondary leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Vous avez d'autres questions ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Notre équipe est là pour vous répondre
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;

