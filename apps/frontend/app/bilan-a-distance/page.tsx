import React from 'react';
import Link from 'next/link';

const BilanADistancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
            🌐 100% en ligne • Flexible • Efficace
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Bilan de Compétences à Distance</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Réalisez votre bilan de compétences depuis chez vous, à votre rythme, avec le même niveau d'accompagnement qu'en présentiel
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Pourquoi choisir le bilan à distance ?
          </h2>
          <p className="text-xl text-gray-700 text-center max-w-4xl mx-auto mb-12">
            Le bilan de compétences à distance offre la même qualité d'accompagnement qu'un bilan en présentiel, avec une flexibilité accrue et des outils digitaux innovants.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Advantage 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexibilité totale</h3>
              <p className="text-gray-600">
                Organisez vos rendez-vous selon vos disponibilités, sans contrainte de déplacement. Idéal pour les emplois du temps chargés.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Même qualité</h3>
              <p className="text-gray-600">
                Accompagnement personnalisé par un consultant certifié, outils professionnels et méthodologie identique au présentiel.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Outils digitaux</h3>
              <p className="text-gray-600">
                Plateforme intuitive, tests en ligne, analyse IA de votre CV, et suivi de votre progression en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16 bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Comment ça marche ?
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Inscription en ligne</h3>
                <p className="text-gray-700 mb-4">
                  Créez votre compte gratuitement sur notre plateforme. Remplissez le questionnaire initial pour que nous puissions mieux comprendre vos besoins et objectifs.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Durée :</strong> 15 minutes • <strong>Gratuit</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Premier rendez-vous par visioconférence</h3>
                <p className="text-gray-700 mb-4">
                  Rencontrez votre consultant dédié lors d'un entretien vidéo. Ensemble, vous définissez les objectifs de votre bilan et planifiez les prochaines étapes.
                </p>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Durée :</strong> 1h30 • <strong>Outils :</strong> Zoom, Teams ou Google Meet
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Tests et travaux personnels</h3>
                <p className="text-gray-700 mb-4">
                  Réalisez les tests psychométriques (MBTI, RIASEC) en ligne à votre rythme. Notre IA analyse votre CV et vous propose des pistes métiers personnalisées.
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Durée :</strong> 8-12 heures réparties • <strong>Accès :</strong> 24/7 sur la plateforme
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Entretiens de suivi réguliers</h3>
                <p className="text-gray-700 mb-4">
                  Échangez régulièrement avec votre consultant par visio (4 à 6 séances) pour analyser vos résultats, explorer les pistes et construire votre projet.
                </p>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    <strong>Durée :</strong> 6-8 heures au total • <strong>Fréquence :</strong> 1 séance toutes les 2 semaines
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Synthèse et plan d'action</h3>
                <p className="text-gray-700 mb-4">
                  Recevez votre document de synthèse personnalisé et votre plan d'action détaillé. Dernier entretien pour valider votre projet et les prochaines étapes.
                </p>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    <strong>Livrables :</strong> Document PDF + Attestation officielle • <strong>Durée :</strong> 2 heures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools & Technology */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Nos outils et technologies
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Platform */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Plateforme sécurisée</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Accès 24/7 à vos documents et tests</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Suivi de progression en temps réel</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Messagerie sécurisée avec votre consultant</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Données cryptées et conformité RGPD</span>
                </li>
              </ul>
            </div>

            {/* Visio */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Visioconférence HD</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Qualité vidéo et audio professionnelle</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Partage d'écran pour les exercices</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Compatible tous appareils (PC, tablette, mobile)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Enregistrement des séances (sur demande)</span>
                </li>
              </ul>
            </div>

            {/* AI Tools */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Intelligence Artificielle</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Analyse automatique de votre CV</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Recommandations métiers personnalisées</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Génération de plan d'action intelligent</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Matching avec formations adaptées</span>
                </li>
              </ul>
            </div>

            {/* Tests */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Tests psychométriques</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">MBTI (personnalité professionnelle)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">RIASEC (intérêts professionnels)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Inventaire de compétences</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-success-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Test de valeurs professionnelles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Specific to Remote */}
        <div className="mb-16 bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Questions fréquentes sur le bilan à distance
          </h2>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Le bilan à distance a-t-il la même valeur qu'un bilan en présentiel ?
              </h3>
              <p className="text-gray-700">
                Oui, absolument ! Le bilan à distance suit exactement la même méthodologie, utilise les mêmes outils et est réalisé par les mêmes consultants certifiés. L'attestation délivrée a la même valeur légale et est reconnue par tous les organismes (Pôle Emploi, OPCO, etc.).
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ai-je besoin d'un équipement spécifique ?
              </h3>
              <p className="text-gray-700">
                Non, un ordinateur, une tablette ou un smartphone avec connexion internet, webcam et microphone suffisent. Nous utilisons des outils de visioconférence standards (Zoom, Teams, Google Meet) que vous pouvez choisir selon votre préférence.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Puis-je alterner entre présentiel et distanciel ?
              </h3>
              <p className="text-gray-700">
                Oui ! Nous proposons également un format hybride qui combine des séances en présentiel et à distance selon vos besoins et contraintes. Discutez-en avec votre consultant lors du premier entretien.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Le bilan à distance est-il finançable par le CPF ?
              </h3>
              <p className="text-gray-700">
                Oui, le bilan à distance est 100% finançable par le CPF, au même titre qu'un bilan en présentiel. Vous pouvez vous inscrire directement sur moncompteformation.gouv.fr.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Combien de temps dure un bilan à distance ?
              </h3>
              <p className="text-gray-700">
                La durée est identique au bilan présentiel : 20 à 24 heures réparties sur 2 à 3 mois. Cette flexibilité vous permet d'avancer à votre rythme tout en bénéficiant d'un accompagnement régulier.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Prêt à démarrer votre bilan à distance ?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et bénéficiez d'un premier entretien découverte sans engagement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="px-10 py-5 bg-white text-blue-700 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="/contact"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BilanADistancePage;

