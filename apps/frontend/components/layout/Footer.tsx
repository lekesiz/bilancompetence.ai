import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/quest-ce-quun-bilan', label: "Qu'est-ce qu'un bilan ?" },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/financement', label: 'Financement' },
  { href: '/bilan-a-distance', label: 'Bilan à distance' },
];

const legalLinks = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
  { href: '/conditions-generales', label: 'Conditions générales' },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-heading mb-4">BilanCompetence.ai</h3>
            <p className="text-gray-400">Votre partenaire pour l'évolution professionnelle et le développement des compétences.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} legacyBehavior><a className="hover:text-primary transition-colors">{link.label}</a></Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Informations légales</h4>
            <ul className="space-y-2">
              {legalLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} legacyBehavior><a className="hover:text-primary transition-colors">{link.label}</a></Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <address className="not-italic text-gray-400 space-y-2">
              <p>1a route de schweighouse, 67500 Haguenau</p>
              <p><a href="tel:0367310201" className="hover:text-primary">03 67 31 02 01</a></p>
              <p><a href="mailto:contact@netzinformatique.fr" className="hover:text-primary">contact@netzinformatique.fr</a></p>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} BilanCompetence.ai - Tous droits réservés. Site réalisé par Formation Haguenau.</p>
        </div>
      </div>
    </footer>
  );
};
