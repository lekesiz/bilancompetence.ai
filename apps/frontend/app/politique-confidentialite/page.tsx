export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Politique de Confidentialité
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              La présente Politique de Confidentialité décrit la façon dont Netz Informatique collecte, utilise, partage 
              et protège vos données personnelles dans le cadre de l'utilisation de la plateforme BilanCompetence.AI. 
              Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              Informatique et Libertés.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Responsable du Traitement</h2>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Raison sociale :</strong> Netz Informatique</p>
                <p className="mb-2"><strong>Adresse :</strong> 1 A Route de Schweighouse, 67500 Haguenau, France</p>
                <p className="mb-2"><strong>Email :</strong> contact@netzinformatique.fr</p>
                <p className="mb-2"><strong>Téléphone :</strong> 03 67 31 02 01</p>
                <p className="mb-2"><strong>Délégué à la Protection des Données (DPO) :</strong> Netz Informatique</p>
                <p className="mb-2"><strong>Contact DPO :</strong> dpo@netzinformatique.fr</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Données Collectées</h2>
              <p className="text-gray-700 mb-4">
                Nous collectons différentes catégories de données personnelles selon votre utilisation de la plateforme :
              </p>

              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">2.1. Données d'Identification</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Date de naissance</li>
                    <li>Adresse postale</li>
                    <li>Photographie (optionnelle)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">2.2. Données Professionnelles</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Parcours professionnel</li>
                    <li>Formation et diplômes</li>
                    <li>Compétences professionnelles</li>
                    <li>CV et documents associés</li>
                    <li>Situation professionnelle actuelle</li>
                    <li>Projet professionnel</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">2.3. Données de Bilan de Compétences</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Réponses aux questionnaires (MBTI, RIASEC)</li>
                    <li>Résultats des tests psychométriques</li>
                    <li>Analyses et recommandations personnalisées</li>
                    <li>Documents de synthèse du bilan</li>
                    <li>Échanges avec le consultant</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">2.4. Données de Connexion et Navigation</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Pages consultées</li>
                    <li>Date et heure de connexion</li>
                    <li>Cookies et traceurs</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">2.5. Données de Paiement</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Informations de facturation</li>
                    <li>Historique des transactions</li>
                    <li>Mode de paiement (via Stripe - données bancaires non stockées par nous)</li>
                    <li>Informations CPF (si applicable)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Finalités du Traitement</h2>
              <p className="text-gray-700 mb-4">
                Vos données personnelles sont collectées et traitées pour les finalités suivantes :
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Réalisation du bilan de compétences :</strong> Analyse de votre profil, tests psychométriques, élaboration du projet professionnel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Gestion de votre compte utilisateur :</strong> Création, authentification, gestion des accès</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Communication :</strong> Envoi d'emails de confirmation, notifications, rappels de rendez-vous</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Facturation et paiement :</strong> Émission de factures, traitement des paiements, gestion CPF</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Conformité Qualiopi :</strong> Respect des obligations réglementaires, audits qualité</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Amélioration de nos services :</strong> Analyse statistique, développement de nouvelles fonctionnalités</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span><strong>Sécurité :</strong> Prévention de la fraude, protection contre les cyberattaques</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Base Légale du Traitement</h2>
              <p className="text-gray-700 mb-4">
                Conformément au RGPD, le traitement de vos données repose sur les bases légales suivantes :
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Exécution du contrat</p>
                  <p className="text-gray-700">Le traitement est nécessaire à l'exécution du contrat de bilan de compétences.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Consentement</p>
                  <p className="text-gray-700">Vous avez donné votre consentement explicite pour certains traitements (newsletters, cookies non essentiels).</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Obligation légale</p>
                  <p className="text-gray-700">Le traitement est nécessaire au respect d'obligations légales (comptabilité, certification Qualiopi).</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-2">Intérêt légitime</p>
                  <p className="text-gray-700">Le traitement est nécessaire aux fins de nos intérêts légitimes (amélioration des services, sécurité).</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Destinataires des Données</h2>
              <p className="text-gray-700 mb-4">
                Vos données personnelles peuvent être partagées avec les destinataires suivants :
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <ul className="space-y-3 text-gray-700">
                  <li><strong>Personnel autorisé de Netz Informatique :</strong> Consultants, administrateurs, support technique</li>
                  <li><strong>Prestataires techniques :</strong> Vercel (hébergement frontend), Railway (hébergement backend), Supabase (base de données)</li>
                  <li><strong>Services de paiement :</strong> Stripe (traitement des paiements)</li>
                  <li><strong>Services d'emailing :</strong> Resend (envoi d'emails transactionnels)</li>
                  <li><strong>Intelligence Artificielle :</strong> Google Gemini AI (analyse de CV, recommandations - données anonymisées)</li>
                  <li><strong>Organismes de formation :</strong> Wedof (gestion administrative de la formation)</li>
                  <li><strong>Services comptables :</strong> Pennylane (facturation et comptabilité)</li>
                  <li><strong>Organismes certificateurs :</strong> Dans le cadre de la certification Qualiopi</li>
                  <li><strong>Autorités compétentes :</strong> Sur réquisition judiciaire ou obligation légale</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Transferts de Données hors UE</h2>
              <p className="text-gray-700 mb-4">
                Certains de nos prestataires sont situés en dehors de l'Union Européenne (notamment aux États-Unis). 
                Ces transferts sont encadrés par des garanties appropriées :
              </p>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Clauses contractuelles types approuvées par la Commission Européenne</li>
                  <li>✓ Certifications (Privacy Shield successeur, ISO 27001)</li>
                  <li>✓ Engagement de conformité au RGPD</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Durée de Conservation</h2>
              <p className="text-gray-700 mb-4">
                Vos données sont conservées pendant les durées suivantes :
              </p>
              <div className="bg-purple-50 p-6 rounded-lg">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-purple-200">
                      <th className="py-2 font-semibold">Type de données</th>
                      <th className="py-2 font-semibold">Durée de conservation</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-purple-100">
                      <td className="py-3">Données de compte actif</td>
                      <td className="py-3">Durée de la relation contractuelle + 3 ans</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3">Documents de bilan</td>
                      <td className="py-3">30 ans (obligation Qualiopi)</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3">Données de facturation</td>
                      <td className="py-3">10 ans (obligation comptable)</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3">Données de connexion</td>
                      <td className="py-3">12 mois</td>
                    </tr>
                    <tr className="border-b border-purple-100">
                      <td className="py-3">Cookies analytiques</td>
                      <td className="py-3">13 mois maximum</td>
                    </tr>
                    <tr>
                      <td className="py-3">Données de prospects</td>
                      <td className="py-3">3 ans sans contact</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Vos Droits</h2>
              <p className="text-gray-700 mb-4">
                Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit d'accès</h3>
                  <p className="text-sm text-gray-700">Obtenir une copie de vos données personnelles</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit de rectification</h3>
                  <p className="text-sm text-gray-700">Corriger vos données inexactes ou incomplètes</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit à l'effacement</h3>
                  <p className="text-sm text-gray-700">Demander la suppression de vos données (sous conditions)</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit à la limitation</h3>
                  <p className="text-sm text-gray-700">Limiter le traitement de vos données</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit à la portabilité</h3>
                  <p className="text-sm text-gray-700">Recevoir vos données dans un format structuré</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit d'opposition</h3>
                  <p className="text-sm text-gray-700">Vous opposer au traitement de vos données</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit de retrait du consentement</h3>
                  <p className="text-sm text-gray-700">Retirer votre consentement à tout moment</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">✓ Droit de réclamation</h3>
                  <p className="text-sm text-gray-700">Déposer une plainte auprès de la CNIL</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Comment exercer vos droits ?</h3>
                <p className="text-gray-700 mb-3">
                  Pour exercer vos droits, vous pouvez nous contacter :
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Par email :</strong> dpo@netz-informatique.fr</li>
                  <li><strong>Par courrier :</strong> Netz Informatique - DPO, [Adresse complète]</li>
                  <li><strong>Via votre espace personnel :</strong> Section "Mes données personnelles"</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Nous nous engageons à répondre à votre demande dans un délai d'un mois maximum.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Sécurité des Données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <div className="bg-green-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>🔒 Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>🔒 Authentification sécurisée (JWT, hachage des mots de passe)</li>
                  <li>🔒 Hébergement sécurisé avec sauvegardes régulières</li>
                  <li>🔒 Contrôle d'accès strict (principe du moindre privilège)</li>
                  <li>🔒 Surveillance et détection des intrusions</li>
                  <li>🔒 Formation du personnel à la sécurité des données</li>
                  <li>🔒 Audits de sécurité réguliers</li>
                  <li>🔒 Plan de continuité d'activité et de reprise après sinistre</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Cookies et Traceurs</h2>
              <p className="text-gray-700 mb-4">
                Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies 
                à tout moment.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Types de cookies utilisés :</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (authentification, sécurité)
                  </li>
                  <li>
                    <strong>Cookies analytiques :</strong> Mesure d'audience et statistiques (avec votre consentement)
                  </li>
                  <li>
                    <strong>Cookies de préférence :</strong> Mémorisation de vos choix (langue, paramètres)
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Modifications de la Politique</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de modifier cette Politique de Confidentialité à tout moment. Toute modification 
                sera publiée sur cette page avec une nouvelle date de mise à jour. Nous vous encourageons à consulter 
                régulièrement cette page.
              </p>
              <p className="text-gray-700">
                En cas de modification substantielle, nous vous en informerons par email ou via une notification sur la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">12. Contact</h2>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Délégué à la Protection des Données (DPO) :</strong></p>
                  <p>Email : dpo@netz-informatique.fr</p>
                  <p>Téléphone : [Numéro de téléphone]</p>
                  <p>Adresse : Netz Informatique - DPO, [Adresse complète]</p>
                </div>
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <p className="text-sm text-gray-600">
                    <strong>Autorité de contrôle :</strong> Si vous estimez que vos droits ne sont pas respectés, 
                    vous pouvez introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07<br />
                    Téléphone : 01 53 73 22 22 - Site web : <a href="https://www.cnil.fr" className="text-blue-600 hover:underline">www.cnil.fr</a>
                  </p>
                </div>
              </div>
            </section>

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-700">
                <strong>Dernière mise à jour :</strong> 24 octobre 2025<br />
                <strong>Version :</strong> 1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

