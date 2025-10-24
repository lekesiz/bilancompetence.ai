import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/quest-ce-quun-bilan', label: "Qu'est-ce qu'un bilan ?" },
  { href: '/methodologie', label: 'Méthodologie' },
  { href: '/financement', label: 'Financement' },
  { href: '/bilan-a-distance', label: 'Bilan à distance' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export const Header = () => {
  return (
    <header className="bg-surface shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" legacyBehavior>
              <a className="text-3xl font-bold text-primary font-heading">BilanCompetence.ai</a>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} legacyBehavior>
                <a className="text-textSecondary hover:text-primary transition-colors duration-300">{link.label}</a>
              </Link>
            ))}
            <Link href="/login" legacyBehavior>
              <a className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 shadow-sm">Commencer mon bilan</a>
            </Link>
          </nav>
          {/* Mobile menu button will be added here */}
        </div>
      </div>
    </header>
  );
};
