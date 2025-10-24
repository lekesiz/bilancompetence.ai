export default function ConditionsGeneralesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Conditions Générales d'Utilisation et de Vente
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Les présentes Conditions Générales d'Utilisation et de Vente (ci-après "CGU-CGV") régissent l'utilisation 
              de la plateforme BilanCompetence.AI et la fourniture des prestations de bilan de compétences par Netz Informatique. 
              En utilisant notre plateforme, vous acceptez sans réserve les présentes conditions.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 1 - Définitions</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Plateforme :</strong> Le site web BilanCompetence.AI accessible à l'adresse https://bilancompetence.vercel.app</li>
                  <li><strong>Prestataire :</strong> Netz Informatique, organisme de formation certifié Qualiopi</li>
                  <li><strong>Bénéficiaire :</strong> Toute personne physique souscrivant à un bilan de compétences</li>
                  <li><strong>Consultant :</strong> Professionnel certifié accompagnant le bénéficiaire</li>
                  <li><strong>Bilan de compétences :</strong> Prestation définie par les articles L6313-1 et suivants du Code du travail</li>
                  <li><strong>CPF :</strong> Compte Personnel de Formation</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 2 - Objet</h2>
              <p className="text-gray-700 mb-4">
                Les présentes CGU-CGV ont pour objet de définir les conditions dans lesquelles Netz Informatique fournit 
                ses services de bilan de compétences via la plateforme BilanCompetence.AI, ainsi que les droits et obligations 
                des parties dans ce cadre.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 3 - Accès à la Plateforme</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1. Inscription</h3>
              <p className="text-gray-700 mb-4">
                L'accès aux services nécessite la création d'un compte utilisateur. Lors de l'inscription, vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>Fournir des informations exactes, complètes et à jour</li>
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Informer immédiatement Netz Informatique de toute utilisation non autorisée de votre compte</li>
                <li>Être âgé d'au moins 18 ans</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2. Disponibilité</h3>
              <p className="text-gray-700 mb-4">
                La plateforme est accessible 24h/24 et 7j/7, sauf en cas de force majeure ou d'événement hors du contrôle 
                de Netz Informatique, et sous réserve des éventuelles pannes et interventions de maintenance nécessaires 
                au bon fonctionnement de la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 4 - Description des Services</h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1. Bilan de Compétences</h3>
                <p className="text-gray-700 mb-4">
                  Le bilan de compétences comprend trois phases obligatoires :
                </p>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Phase Préliminaire (4-6 heures)</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Analyse de la demande et du besoin</li>
                      <li>Définition des objectifs</li>
                      <li>Information sur les conditions de déroulement</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Phase d'Investigation (12-16 heures)</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Analyse du parcours professionnel</li>
                      <li>Identification des compétences et aptitudes</li>
                      <li>Tests psychométriques (MBTI, RIASEC)</li>
                      <li>Analyse IA du CV</li>
                      <li>Exploration des pistes professionnelles</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Phase de Conclusion (4-6 heures)</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>Élaboration du projet professionnel</li>
                      <li>Plan d'action détaillé</li>
                      <li>Document de synthèse</li>
                      <li>Attestation de fin de bilan</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2. Durée</h3>
              <p className="text-gray-700 mb-4">
                La durée totale du bilan de compétences est de 24 heures minimum, réparties sur une période de 2 à 3 mois maximum.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3. Modalités</h3>
              <p className="text-gray-700 mb-4">
                Le bilan peut être réalisé :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>En présentiel dans nos locaux</li>
                <li>À distance via visioconférence</li>
                <li>En mode hybride (combinaison des deux)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 5 - Tarifs et Paiement</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1. Tarifs</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Tarif du bilan de compétences :</strong> [Montant] € TTC
                </p>
                <p className="text-sm text-gray-600">
                  Les tarifs sont indiqués en euros toutes taxes comprises (TTC). Ils sont valables au jour de la commande 
                  et peuvent être modifiés à tout moment pour les commandes futures.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2. Modalités de Paiement</h3>
              <p className="text-gray-700 mb-4">
                Le paiement peut s'effectuer par :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li><strong>CPF (Compte Personnel de Formation) :</strong> Paiement direct via Mon Compte Formation</li>
                <li><strong>Carte bancaire :</strong> Via notre plateforme sécurisée Stripe</li>
                <li><strong>Virement bancaire :</strong> Sur demande</li>
                <li><strong>Prise en charge employeur :</strong> Facturation directe à l'entreprise</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3. Facturation</h3>
              <p className="text-gray-700 mb-4">
                Une facture est émise et envoyée par email dès réception du paiement. Elle est également accessible dans 
                votre espace personnel.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 6 - Droit de Rétractation</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Conformément à l'article L6353-5 du Code du travail, vous disposez d'un délai de <strong>10 jours</strong> 
                  à compter de la signature de la convention pour vous rétracter.
                </p>
                <p className="text-gray-700 mb-4">
                  Pour exercer ce droit, vous devez nous notifier votre décision par email à : contact@netz-informatique.fr
                </p>
                <p className="text-gray-700">
                  En cas de rétractation dans les délais, vous serez intégralement remboursé dans un délai de 14 jours.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 7 - Annulation et Report</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1. Annulation par le Bénéficiaire</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Plus de 7 jours avant le début :</strong> Remboursement intégral</li>
                  <li><strong>Entre 7 et 3 jours avant :</strong> Retenue de 30% du montant total</li>
                  <li><strong>Moins de 3 jours avant :</strong> Retenue de 50% du montant total</li>
                  <li><strong>Après le début du bilan :</strong> Aucun remboursement</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2. Report de Rendez-vous</h3>
              <p className="text-gray-700 mb-4">
                Vous pouvez reporter un rendez-vous en nous prévenant au moins 48 heures à l'avance. Au-delà de 2 reports, 
                des frais de 50€ par report supplémentaire seront appliqués.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3. Annulation par Netz Informatique</h3>
              <p className="text-gray-700 mb-4">
                En cas d'annulation de notre fait, vous serez intégralement remboursé et pourrez prétendre à une indemnisation 
                si un préjudice est démontré.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 8 - Obligations du Bénéficiaire</h2>
              <p className="text-gray-700 mb-4">
                Le bénéficiaire s'engage à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Participer activement à toutes les phases du bilan</li>
                <li>Respecter les rendez-vous fixés avec le consultant</li>
                <li>Fournir les informations et documents nécessaires à la réalisation du bilan</li>
                <li>Respecter la confidentialité des outils et méthodes utilisés</li>
                <li>Utiliser la plateforme de manière conforme à sa destination</li>
                <li>Ne pas porter atteinte aux droits de propriété intellectuelle de Netz Informatique</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 9 - Obligations de Netz Informatique</h2>
              <p className="text-gray-700 mb-4">
                Netz Informatique s'engage à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Fournir un accompagnement personnalisé par un consultant certifié</li>
                <li>Respecter la confidentialité des informations communiquées</li>
                <li>Délivrer un document de synthèse conforme aux exigences légales</li>
                <li>Respecter les délais convenus</li>
                <li>Assurer la disponibilité de la plateforme (hors maintenance)</li>
                <li>Respecter la certification Qualiopi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 10 - Confidentialité</h2>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Conformément à l'article L6313-10-1 du Code du travail, <strong>les résultats du bilan de compétences 
                  sont la propriété exclusive du bénéficiaire</strong>.
                </p>
                <p className="text-gray-700 mb-4">
                  Ils ne peuvent être communiqués à un tiers qu'avec le consentement exprès du bénéficiaire.
                </p>
                <p className="text-gray-700">
                  Netz Informatique s'engage à respecter la plus stricte confidentialité concernant toutes les informations 
                  recueillies dans le cadre du bilan.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 11 - Propriété Intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                Tous les éléments de la plateforme BilanCompetence.AI (structure, design, textes, images, logos, etc.) 
                sont protégés par le droit d'auteur, le droit des marques et/ou le droit des bases de données.
              </p>
              <p className="text-gray-700 mb-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments 
                de la plateforme, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite 
                préalable de Netz Informatique.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 12 - Responsabilité</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">12.1. Responsabilité de Netz Informatique</h3>
              <p className="text-gray-700 mb-4">
                Netz Informatique ne saurait être tenu responsable :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 ml-4">
                <li>Des dommages indirects résultant de l'utilisation de la plateforme</li>
                <li>De l'inexactitude des informations fournies par le bénéficiaire</li>
                <li>De l'utilisation frauduleuse du compte par un tiers</li>
                <li>Des interruptions de service dues à des cas de force majeure</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">12.2. Assurance</h3>
              <p className="text-gray-700 mb-4">
                Netz Informatique a souscrit une assurance responsabilité civile professionnelle auprès de [Nom de l'assureur].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 13 - Réclamations et Médiation</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1. Réclamations</h3>
              <p className="text-gray-700 mb-4">
                Toute réclamation doit être adressée par écrit à : contact@netz-informatique.fr
              </p>
              <p className="text-gray-700 mb-4">
                Nous nous engageons à accuser réception de votre réclamation dans un délai de 48 heures et à y répondre 
                dans un délai de 15 jours.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2. Médiation de la Consommation</h3>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Conformément à l'article L612-1 du Code de la consommation, en cas de litige, vous pouvez recourir 
                  gratuitement à un médiateur de la consommation :
                </p>
                <p className="text-gray-700 mb-2"><strong>Médiateur de la Consommation :</strong> [Nom du médiateur]</p>
                <p className="text-gray-700 mb-2"><strong>Adresse :</strong> [Adresse]</p>
                <p className="text-gray-700 mb-2"><strong>Site web :</strong> [URL]</p>
                <p className="text-gray-700"><strong>Email :</strong> [Email]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 14 - Protection des Données Personnelles</h2>
              <p className="text-gray-700 mb-4">
                Le traitement de vos données personnelles est effectué conformément au RGPD et à notre{' '}
                <a href="/politique-confidentialite" className="text-blue-600 hover:underline font-semibold">
                  Politique de Confidentialité
                </a>.
              </p>
              <p className="text-gray-700">
                Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et 
                d'opposition sur vos données personnelles. Pour exercer ces droits, contactez : dpo@netz-informatique.fr
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 15 - Force Majeure</h2>
              <p className="text-gray-700 mb-4">
                Netz Informatique ne sera pas tenu responsable de tout retard ou inexécution de ses obligations résultant 
                d'un cas de force majeure tel que défini par la jurisprudence française.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 16 - Modification des CGU-CGV</h2>
              <p className="text-gray-700 mb-4">
                Netz Informatique se réserve le droit de modifier à tout moment les présentes CGU-CGV. Les nouvelles 
                conditions seront applicables dès leur mise en ligne.
              </p>
              <p className="text-gray-700">
                En cas de modification substantielle, les utilisateurs inscrits seront informés par email au moins 30 jours 
                avant l'entrée en vigueur des nouvelles conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 17 - Droit Applicable et Juridiction</h2>
              <p className="text-gray-700 mb-4">
                Les présentes CGU-CGV sont régies par le droit français.
              </p>
              <p className="text-gray-700 mb-4">
                En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera 
                porté devant les tribunaux compétents du ressort du siège social de Netz Informatique.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 18 - Acceptation des CGU-CGV</h2>
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  L'utilisation de la plateforme BilanCompetence.AI et la souscription à un bilan de compétences impliquent 
                  l'acceptation pleine et entière des présentes CGU-CGV.
                </p>
                <p className="text-gray-700">
                  Cette acceptation est matérialisée par le fait de cocher la case "J'accepte les Conditions Générales 
                  d'Utilisation et de Vente" lors de l'inscription ou de la commande.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Article 19 - Contact</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Pour toute question concernant les présentes CGU-CGV :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Netz Informatique</strong></p>
                  <p>Adresse : 1 A Route de Schweighouse, 67500 Haguenau, France</p>
                  <p>Email : contact@netzinformatique.fr</p>
                  <p>Téléphone : 03 67 31 02 01</p>
                  <p>Formulaire de contact : <a href="/contact" className="text-blue-600 hover:underline">Page de contact</a></p>
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

