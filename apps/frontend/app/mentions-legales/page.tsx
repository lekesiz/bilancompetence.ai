export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Mentions Légales
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, 
              il est précisé aux utilisateurs du site BilanCompetence.AI l'identité des différents intervenants dans le cadre 
              de sa réalisation et de son suivi.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Éditeur du Site</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Raison sociale :</strong> Netz Informatique</p>
                <p className="mb-2"><strong>Forme juridique :</strong> SARL (Société à Responsabilité Limitée)</p>
                <p className="mb-2"><strong>Capital social :</strong> 10 000 €</p>
                <p className="mb-2"><strong>Siège social :</strong> [Adresse complète de Netz Informatique]</p>
                <p className="mb-2"><strong>SIRET :</strong> [Numéro SIRET]</p>
                <p className="mb-2"><strong>RCS :</strong> [Ville] [Numéro RCS]</p>
                <p className="mb-2"><strong>TVA Intracommunautaire :</strong> [Numéro TVA]</p>
                <p className="mb-2"><strong>Téléphone :</strong> [Numéro de téléphone]</p>
                <p className="mb-2"><strong>Email :</strong> contact@netz-informatique.fr</p>
                <p className="mb-2"><strong>Directeur de la publication :</strong> [Nom du directeur]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Hébergement</h2>
              <div className="bg-purple-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-lg mb-2">Frontend (Application Web)</h3>
                <p className="mb-2"><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p className="mb-2"><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p className="mb-2"><strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600 hover:underline">https://vercel.com</a></p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Backend (Serveur API)</h3>
                <p className="mb-2"><strong>Hébergeur :</strong> Railway Corp.</p>
                <p className="mb-2"><strong>Adresse :</strong> 228 Park Ave S, New York, NY 10003, USA</p>
                <p className="mb-2"><strong>Site web :</strong> <a href="https://railway.app" className="text-blue-600 hover:underline">https://railway.app</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Propriété Intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                L'ensemble du contenu de ce site (structure, textes, logos, images, vidéos, etc.) est la propriété exclusive 
                de Netz Informatique, sauf mentions particulières. Toute reproduction, distribution, modification, adaptation, 
                retransmission ou publication de ces différents éléments est strictement interdite sans l'accord exprès par 
                écrit de Netz Informatique.
              </p>
              <p className="text-gray-700 mb-4">
                La marque BilanCompetence.AI ainsi que les logos figurant sur le site sont des marques déposées de Netz Informatique. 
                Toute reproduction totale ou partielle de ces marques ou logos, effectuée à partir des éléments du site sans 
                l'autorisation expresse de Netz Informatique est prohibée.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Certification Qualiopi</h2>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Organisme de formation certifié Qualiopi</strong></p>
                <p className="mb-2"><strong>Numéro de déclaration d'activité :</strong> [Numéro NDA]</p>
                <p className="mb-2"><strong>Certification Qualiopi :</strong> [Numéro de certification]</p>
                <p className="mb-2"><strong>Organisme certificateur :</strong> [Nom de l'organisme]</p>
                <p className="mb-2"><strong>Date de certification :</strong> [Date]</p>
                <p className="text-sm text-gray-600 mt-4">
                  La certification qualité a été délivrée au titre de la catégorie d'action suivante : 
                  ACTIONS DE FORMATION (Bilan de compétences).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Protection des Données Personnelles</h2>
              <p className="text-gray-700 mb-4">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                Netz Informatique s'engage à protéger la vie privée des utilisateurs de son site.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Responsable du traitement :</strong> Netz Informatique</p>
                <p className="mb-2"><strong>Délégué à la Protection des Données (DPO) :</strong> [Nom du DPO]</p>
                <p className="mb-2"><strong>Contact DPO :</strong> dpo@netz-informatique.fr</p>
              </div>
              <p className="text-gray-700 mt-4">
                Pour plus d'informations sur le traitement de vos données personnelles, consultez notre{' '}
                <a href="/politique-confidentialite" className="text-blue-600 hover:underline font-semibold">
                  Politique de Confidentialité
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookies</h2>
              <p className="text-gray-700 mb-4">
                Le site BilanCompetence.AI utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                En naviguant sur ce site, vous acceptez l'utilisation de cookies conformément à notre politique de confidentialité.
              </p>
              <p className="text-gray-700">
                Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation de Responsabilité</h2>
              <p className="text-gray-700 mb-4">
                Netz Informatique ne pourra être tenu responsable des dommages directs et indirects causés au matériel de 
                l'utilisateur lors de l'accès au site BilanCompetence.AI, et résultant soit de l'utilisation d'un matériel 
                ne répondant pas aux spécifications techniques requises, soit de l'apparition d'un bug ou d'une incompatibilité.
              </p>
              <p className="text-gray-700 mb-4">
                Netz Informatique ne pourra également être tenu responsable des dommages indirects consécutifs à l'utilisation 
                du site BilanCompetence.AI. Des espaces interactifs (possibilité de poser des questions dans l'espace contact) 
                sont à la disposition des utilisateurs. Netz Informatique se réserve le droit de supprimer, sans mise en demeure 
                préalable, tout contenu déposé dans cet espace qui contreviendrait à la législation applicable en France, 
                en particulier aux dispositions relatives à la protection des données.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Droit Applicable et Juridiction Compétente</h2>
              <p className="text-gray-700 mb-4">
                Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, 
                le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant les mentions légales, vous pouvez nous contacter :
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Par email :</strong> contact@netz-informatique.fr</p>
                <p className="mb-2"><strong>Par téléphone :</strong> [Numéro de téléphone]</p>
                <p className="mb-2"><strong>Par courrier :</strong> Netz Informatique, [Adresse complète]</p>
                <p className="mb-2"><strong>Via le formulaire de contact :</strong>{' '}
                  <a href="/contact" className="text-blue-600 hover:underline">Page de contact</a>
                </p>
              </div>
            </section>

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-700">
                <strong>Dernière mise à jour :</strong> 24 octobre 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

