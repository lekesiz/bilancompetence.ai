import React from 'react';
import Link from 'next/link';

const FinancementPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Financer Votre Bilan</h1>
          <p className="text-xl opacity-90">
            Plusieurs solutions de financement adaptées à votre situation
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="mb-16 text-center">
          <p className="text-lg text-textSecondary leading-relaxed max-w-3xl mx-auto">
            Le bilan de compétences représente un investissement dans votre avenir professionnel. 
            Heureusement, de nombreux dispositifs existent pour le financer sans impact sur votre budget personnel.
          </p>
        </div>

        {/* CPF Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mr-4">
                  💰
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Compte Personnel de Formation (CPF)</h2>
                  <p className="text-lg opacity-90">La solution la plus simple et accessible</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-semibold text-textPrimary mb-4">Qu'est-ce que le CPF ?</h3>
              <p className="text-textSecondary mb-6">
                Le CPF est un compte individuel qui vous suit tout au long de votre carrière. 
                Chaque année de travail vous permet d'accumuler des droits à la formation, 
                utilisables à tout moment pour financer des formations éligibles, dont le bilan de compétences.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-textPrimary mb-2">Qui peut en bénéficier ?</h4>
                  <ul className="text-sm text-textSecondary space-y-1">
                    <li>• Salariés du secteur privé</li>
                    <li>• Agents publics</li>
                    <li>• Demandeurs d'emploi</li>
                    <li>• Travailleurs indépendants</li>
                  </ul>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-textPrimary mb-2">Montant disponible</h4>
                  <ul className="text-sm text-textSecondary space-y-1">
                    <li>• 500€ par an (temps plein)</li>
                    <li>• Plafonné à 5 000€</li>
                    <li>• 800€/an si non qualifié</li>
                    <li>• Plafonné à 8 000€</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold text-textPrimary mb-3">Comment utiliser votre CPF ?</h4>
                <ol className="space-y-2 text-textSecondary">
                  <li className="flex items-start">
                    <span className="font-bold text-success-600 mr-2">1.</span>
                    <span>Créez votre compte sur <a href="https://www.moncompteformation.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-primary underline">moncompteformation.gouv.fr</a></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-success-600 mr-2">2.</span>
                    <span>Consultez le montant de vos droits disponibles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-success-600 mr-2">3.</span>
                    <span>Recherchez "bilan de compétences" et sélectionnez notre organisme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-success-600 mr-2">4.</span>
                    <span>Inscrivez-vous directement en ligne - aucune autorisation employeur nécessaire</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Other Funding Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-textPrimary mb-8 text-center">Autres Solutions de Financement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan de développement des compétences */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl mr-3">
                  🏢
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Plan de Développement des Compétences</h3>
              </div>
              <p className="text-textSecondary mb-4">
                Votre employeur peut financer votre bilan dans le cadre du plan de développement des compétences de l'entreprise.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Prise en charge totale par l'employeur</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Réalisable sur temps de travail</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Maintien de la rémunération</span>
                </li>
              </ul>
            </div>

            {/* Pôle Emploi */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-2xl mr-3">
                  🎯
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Pôle Emploi</h3>
              </div>
              <p className="text-textSecondary mb-4">
                Si vous êtes demandeur d'emploi, Pôle Emploi peut financer votre bilan de compétences via l'AIF (Aide Individuelle à la Formation).
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Financement possible jusqu'à 100%</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Démarche via votre conseiller</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Complément CPF possible</span>
                </li>
              </ul>
            </div>

            {/* Transition Pro */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-2xl mr-3">
                  🔄
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Transition Pro (ex-Fongecif)</h3>
              </div>
              <p className="text-textSecondary mb-4">
                Pour les projets de reconversion nécessitant une formation longue, Transition Pro peut financer le bilan en amont.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Financement bilan + formation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Maintien de salaire possible</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Accompagnement personnalisé</span>
                </li>
              </ul>
            </div>

            {/* OPCO */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-2xl mr-3">
                  🤝
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">OPCO</h3>
              </div>
              <p className="text-textSecondary mb-4">
                Les Opérateurs de Compétences peuvent financer le bilan pour les salariés de TPE/PME et les travailleurs indépendants.
              </p>
              <ul className="space-y-2 text-sm text-textSecondary">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Selon secteur d'activité</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Conditions variables par OPCO</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Nous vous accompagnons</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-textPrimary mb-8 text-center">Tableau Comparatif</h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-textPrimary">Dispositif</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-textPrimary">Public</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-textPrimary">Autorisation employeur</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-textPrimary">Délai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium text-textPrimary">CPF</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Tous actifs</td>
                  <td className="px-6 py-4 text-sm text-success-600 font-medium">Non requise</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Immédiat</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-textPrimary">Plan de développement</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Salariés</td>
                  <td className="px-6 py-4 text-sm text-warning-600 font-medium">Requise</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Variable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-textPrimary">Pôle Emploi</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Demandeurs d'emploi</td>
                  <td className="px-6 py-4 text-sm text-success-600 font-medium">Non applicable</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">2-4 semaines</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-textPrimary">Transition Pro</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">Salariés (reconversion)</td>
                  <td className="px-6 py-4 text-sm text-warning-600 font-medium">Requise</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">3-6 mois</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-textPrimary mb-8 text-center">Questions Fréquentes</h2>
          
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-semibold text-textPrimary text-lg">
                Combien coûte un bilan de compétences ?
              </summary>
              <p className="mt-4 text-textSecondary">
                Le coût d'un bilan de compétences varie généralement entre 1 500€ et 3 000€ selon la durée 
                et les modalités (présentiel, distanciel, mixte). Chez BilanCompetence.AI, nos tarifs sont 
                transparents et adaptés à chaque situation.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-semibold text-textPrimary text-lg">
                Mon employeur sera-t-il informé si j'utilise mon CPF ?
              </summary>
              <p className="mt-4 text-textSecondary">
                Non ! Si vous réalisez votre bilan hors temps de travail et que vous le financez via votre CPF, 
                votre employeur n'en sera pas informé. Votre démarche reste strictement confidentielle.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-semibold text-textPrimary text-lg">
                Puis-je cumuler plusieurs sources de financement ?
              </summary>
              <p className="mt-4 text-textSecondary">
                Oui, il est possible de combiner votre CPF avec d'autres dispositifs (Pôle Emploi, OPCO, etc.) 
                si vos droits CPF ne couvrent pas l'intégralité du coût. Nous vous accompagnons dans ces démarches.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-semibold text-textPrimary text-lg">
                Combien de temps faut-il pour obtenir un financement ?
              </summary>
              <p className="mt-4 text-textSecondary">
                Avec le CPF, le financement est immédiat dès validation de votre dossier. Pour les autres dispositifs, 
                comptez 2 à 6 semaines selon l'organisme financeur. Nous vous conseillons de démarrer vos démarches 
                au plus tôt.
              </p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Besoin d'aide pour votre financement ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Nos conseillers vous accompagnent gratuitement dans vos démarches
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

export default FinancementPage;

