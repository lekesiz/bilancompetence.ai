import React from 'react';
import Link from 'next/link';
import Card from '@/components/qualiopi/Card';
import Button from '@/components/qualiopi/Button';

export const metadata = {
  title: "Qu'est-ce qu'un Bilan de Compétences ? | Guide Complet 2025",
  description: "Découvrez tout sur le bilan de compétences : définition, objectifs, déroulement, financement CPF, et avantages pour votre carrière. Certifié Qualiopi.",
};

const BilanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Qu'est-ce qu'un Bilan de Compétences ?
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Tout ce que vous devez savoir sur cette démarche qui peut transformer votre carrière
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Introduction Card */}
          <Card className="p-8 mb-8 bg-blue-50 border-l-4 border-blue-600">
            <div className="flex items-start">
              <svg className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Le saviez-vous ?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Le bilan de compétences est une démarche spécifiquement française, reconnue mondialement pour sa rigueur méthodologique.
                  Encadré par le Code du travail, il garantit confidentialité, qualité et professionnalisme. Chaque année, plus de
                  50 000 personnes franchissent le pas pour donner un nouvel élan à leur carrière.
                </p>
              </div>
            </div>
          </Card>

          {/* Definition Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Définition officielle</h2>
            <Card className="p-8 mb-6">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Le bilan de compétences est <strong>une démarche d'accompagnement individuel</strong> qui vous permet d'analyser
                en profondeur vos compétences professionnelles et personnelles, vos aptitudes naturelles et vos motivations profondes.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Cette analyse approfondie vous aide à <strong>définir un projet professionnel cohérent</strong> avec qui vous êtes vraiment,
                et à construire un plan d'action concret pour le réaliser. Le cas échéant, elle identifie les formations nécessaires pour
                atteindre vos objectifs.
              </p>
            </Card>

            <Card className="p-6 bg-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">📖 Cadre légal</h3>
              <p className="text-sm text-gray-700">
                <strong>Articles L6313-4 et R6313-4 du Code du travail français</strong> : "Les actions permettant de réaliser un bilan
                de compétences ont pour objet de permettre à des travailleurs d'analyser leurs compétences professionnelles et personnelles
                ainsi que leurs aptitudes et leurs motivations afin de définir un projet professionnel et, le cas échéant, un projet de formation."
              </p>
            </Card>
          </section>

          {/* Objectives Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Les 4 objectifs clés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyser vos compétences</h3>
                    <p className="text-gray-600">
                      Identifier l'ensemble de vos savoir-faire, savoir-être et aptitudes acquis tout au long de votre parcours
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-purple-100 rounded-full p-3 mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Clarifier vos motivations</h3>
                    <p className="text-gray-600">
                      Comprendre ce qui vous anime vraiment et ce qui donne du sens à votre travail
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 rounded-full p-3 mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Définir un projet professionnel</h3>
                    <p className="text-gray-600">
                      Construire un projet réaliste et motivant, en phase avec vos compétences et aspirations
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-100 rounded-full p-3 mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Élaborer un plan d'action</h3>
                    <p className="text-gray-600">
                      Identifier les étapes concrètes et les formations nécessaires pour atteindre vos objectifs
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Target Audience */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Pour qui ?</h2>
            <Card className="p-8">
              <p className="text-lg text-gray-700 mb-6">
                Le bilan de compétences s'adresse à <strong>toute personne active</strong>, sans condition d'âge, de niveau de qualification ou de statut :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Salariés du secteur privé</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Agents de la fonction publique</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Demandeurs d'emploi</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Travailleurs indépendants</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Auto-entrepreneurs</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Personnes en reconversion</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Les bénéfices concrets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Meilleure connaissance de soi</h3>
                <p className="text-gray-600 text-sm">Identifiez vos forces cachées et vos axes d'amélioration</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confiance renforcée</h3>
                <p className="text-gray-600 text-sm">Prenez conscience de votre vraie valeur professionnelle</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Projet concret</h3>
                <p className="text-gray-600 text-sm">Repartez avec un plan d'action clair et réalisable</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Valorisation du parcours</h3>
                <p className="text-gray-600 text-sm">Mettez en lumière toutes vos expériences</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">🧭</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vision claire</h3>
                <p className="text-gray-600 text-sm">Prenez du recul et voyez votre avenir avec clarté</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Évolution professionnelle</h3>
                <p className="text-gray-600 text-sm">Accédez à de nouvelles opportunités de carrière</p>
              </Card>
            </div>
          </section>

          {/* What it's NOT */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ce que le bilan n'est PAS</h2>
            <Card className="p-8 bg-red-50 border-l-4 border-red-500">
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ce n'est PAS une formation</h3>
                    <p className="text-sm text-gray-700">Le bilan vous aide à identifier les formations dont vous avez besoin, mais il ne les dispense pas.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ce n'est PAS une VAE (Validation des Acquis de l'Expérience)</h3>
                    <p className="text-sm text-gray-700">La VAE permet d'obtenir un diplôme, le bilan vise à construire un projet professionnel.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ce n'est PAS du coaching pur</h3>
                    <p className="text-sm text-gray-700">Le bilan suit une méthodologie structurée encadrée par la loi, avec des livrables précis.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ce n'est PAS une thérapie</h3>
                    <p className="text-sm text-gray-700">Le bilan se concentre sur votre projet professionnel, pas sur la résolution de conflits personnels.</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="p-12 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Prêt à franchir le pas ?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Découvrez comment notre bilan de compétences peut transformer votre carrière
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/fr/register">
                  <Button size="lg">
                    Commencer mon bilan
                  </Button>
                </Link>
                <Link href="/fr/methodologie">
                  <Button size="lg" variant="outline">
                    Découvrir notre méthode
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-600">
                100% finançable par le CPF • Certifié Qualiopi • Sans engagement
              </p>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
};

export default BilanPage;

