import Link from 'next/link';

const quickLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/quest-ce-quun-bilan', label: "Qu'est-ce qu'un bilan ?" },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/financement', label: 'Financement' },
  { href: '/bilan-a-distance', label: 'Bilan à distance' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
  { href: '/conditions-generales', label: 'Conditions générales' },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-200 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold font-heading text-white mb-4">
              BilanCompetence.ai
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Votre partenaire pour l'évolution professionnelle et le développement des compétences.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons - Optional */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informations légales</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <address className="not-italic text-sm text-gray-300 space-y-3">
              <div className="flex items-start space-x-2">
                <svg 
                  className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
                <span>1a route de schweighouse<br />67500 Haguenau</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-5 h-5 text-primary-400 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                  />
                </svg>
                <a 
                  href="tel:0367310201" 
                  className="hover:text-primary-400 transition-colors duration-200"
                >
                  03 67 31 02 01
                </a>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg 
                  className="w-5 h-5 text-primary-400 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
                <a 
                  href="mailto:contact@netzinformatique.fr" 
                  className="hover:text-primary-400 transition-colors duration-200"
                >
                  contact@netzinformatique.fr
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} BilanCompetence.ai - Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500 text-center md:text-right">
              Site réalisé par{' '}
              <span className="text-primary-400 font-medium">Formation Haguenau</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

