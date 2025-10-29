import React from 'react';
import Link from 'next/link';

const MethodologiePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Notre Méthodologie</h1>
          <p className="text-xl opacity-90">
            Une approche structurée en 3 phases pour construire votre projet professionnel
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16">
          <p className="text-lg text-textSecondary leading-relaxed">
            Notre méthodologie s'appuie sur le cadre légal défini par le Code du travail (articles L6313-1 et suivants) 
            et suit une approche éprouvée qui garantit l'efficacité et la qualité de votre accompagnement. 
            Chaque phase est conçue pour vous permettre d'avancer progressivement vers la définition et la réalisation 
            de votre projet professionnel.
          </p>
        </div>

        {/* Phase 1 */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mr-4">
              1
            </div>
            <div>
              <h2 className="text-3xl font-bold text-textPrimary">Phase Préliminaire</h2>
              <p className="text-textSecondary">Durée : 4 à 6 heures</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Objectifs</h3>
            <ul className="space-y-3 text-textSecondary">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Analyser votre demande et confirmer votre engagement dans la démarche</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Définir et analyser la nature de vos besoins</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Déterminer le format le plus adapté à votre situation</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Définir conjointement les modalités de déroulement du bilan</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Déroulement</h3>
            <div className="space-y-4 text-textSecondary">
              <p>
                Cette première phase se déroule en <strong>2 à 3 entretiens individuels</strong> avec votre consultant. 
                Ensemble, vous établissez un diagnostic de votre situation professionnelle actuelle et définissez 
                précisément vos objectifs.
              </p>
              <p>
                Vous recevez également des informations détaillées sur les conditions de déroulement du bilan, 
                les méthodes et techniques mobilisées, ainsi que le planning prévisionnel.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mr-4">
              2
            </div>
            <div>
              <h2 className="text-3xl font-bold text-textPrimary">Phase d'Investigation</h2>
              <p className="text-textSecondary">Durée : 12 à 16 heures</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Objectifs</h3>
            <ul className="space-y-3 text-textSecondary">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Analyser votre parcours professionnel et personnel</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Identifier vos compétences, aptitudes et motivations</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Déterminer vos possibilités d'évolution professionnelle</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Explorer les pistes de projets professionnels</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Outils et Méthodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-textPrimary mb-2">Tests Psychométriques</h4>
                <ul className="text-sm text-textSecondary space-y-1">
                  <li>• Test MBTI (personnalité)</li>
                  <li>• Test RIASEC (intérêts professionnels)</li>
                  <li>• Inventaire de compétences</li>
                  <li>• Test de valeurs professionnelles</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-textPrimary mb-2">Entretiens Approfondis</h4>
                <ul className="text-sm text-textSecondary space-y-1">
                  <li>• Analyse du parcours</li>
                  <li>• Exploration des motivations</li>
                  <li>• Identification des compétences</li>
                  <li>• Définition des contraintes</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-textPrimary mb-2">Recherches Documentaires</h4>
                <ul className="text-sm text-textSecondary space-y-1">
                  <li>• Fiches métiers</li>
                  <li>• Secteurs d'activité</li>
                  <li>• Formations disponibles</li>
                  <li>• Marché de l'emploi</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-textPrimary mb-2">Enquêtes Métiers</h4>
                <ul className="text-sm text-textSecondary space-y-1">
                  <li>• Rencontres professionnels</li>
                  <li>• Immersions terrain</li>
                  <li>• Visites d'entreprises</li>
                  <li>• Networking</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Déroulement</h3>
            <div className="space-y-4 text-textSecondary">
              <p>
                Cette phase centrale se déroule en <strong>6 à 8 entretiens</strong> espacés de 1 à 2 semaines. 
                Entre chaque séance, vous réalisez des travaux personnels (tests, recherches, enquêtes métiers) 
                qui alimentent votre réflexion.
              </p>
              <p>
                Votre consultant vous accompagne dans l'analyse de vos résultats et vous guide vers l'identification 
                de pistes professionnelles réalistes et motivantes.
              </p>
            </div>
          </div>
        </div>

        {/* Phase 3 */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mr-4">
              3
            </div>
            <div>
              <h2 className="text-3xl font-bold text-textPrimary">Phase de Conclusion</h2>
              <p className="text-textSecondary">Durée : 4 à 6 heures</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Objectifs</h3>
            <ul className="space-y-3 text-textSecondary">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Prendre connaissance des résultats détaillés de la phase d'investigation</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Récapituler l'ensemble du parcours et des conclusions</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Élaborer un plan d'action détaillé et réaliste</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Prévoir les modalités de mise en œuvre du projet</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-textPrimary mb-4">Livrables</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl mr-4 flex-shrink-0">
                  📄
                </div>
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Document de Synthèse</h4>
                  <p className="text-textSecondary text-sm">
                    Un document confidentiel récapitulant vos compétences, motivations, projet professionnel 
                    et plan d'action détaillé. Ce document vous appartient et reste strictement confidentiel.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl mr-4 flex-shrink-0">
                  ✅
                </div>
                <div>
                  <h4 className="font-semibold text-textPrimary mb-2">Attestation de Réalisation</h4>
                  <p className="text-textSecondary text-sm">
                    Attestation officielle certifiant la réalisation complète de votre bilan de compétences, 
                    nécessaire notamment pour les financements CPF.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer votre bilan ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Nos consultants certifiés vous accompagnent à chaque étape
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-white dark:bg-gray-800 text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MethodologiePage;

