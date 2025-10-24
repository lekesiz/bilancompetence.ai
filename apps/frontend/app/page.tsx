import Link from 'next/link';

// Reusable component for feature cards
const FeatureCard = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
    <div className="text-4xl text-primary mb-4">{icon}</div>
    <h3 className="text-xl font-bold font-heading mb-2">{title}</h3>
    <p className="text-textSecondary">{children}</p>
  </div>
);

// Reusable component for testimonial cards
const TestimonialCard = ({ quote, author, title }: { quote: string; author: string; title: string }) => (
  <div className="bg-gray-100 p-6 rounded-lg italic">
    <p className="text-textSecondary mb-4">"{quote}"</p>
    <p className="font-semibold text-textPrimary">{author}</p>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold font-heading mb-4 animate-fade-in-down">Donnez un nouveau souffle à votre carrière</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto animate-fade-in-up">Faites le point sur vos compétences, identifiez vos motivations et construisez un projet professionnel qui vous ressemble.</p>
          <Link href="/login" legacyBehavior>
            <a className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg">Commencer mon bilan</a>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon="🔍" title="Analyse approfondie">Identifiez vos compétences, aptitudes, et motivations grâce à une méthodologie éprouvée.</FeatureCard>
            <FeatureCard icon="🎯" title="Projet sur mesure">Construisez un projet professionnel réaliste et motivant, adapté à votre profil.</FeatureCard>
            <FeatureCard icon="🤝" title="Accompagnement personnalisé">Bénéficiez d'un suivi individuel avec un consultant certifié à chaque étape.</FeatureCard>
            <FeatureCard icon="💰" title="Financement facilité">Utilisez votre CPF ou d'autres dispositifs pour financer votre bilan sans impact sur votre budget.</FeatureCard>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold font-heading mb-12">Comment se déroule un bilan de compétences ?</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
            <div className="flex flex-col items-center z-10">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2">1</div>
              <h3 className="font-bold text-lg">Phase préliminaire</h3>
              <p className="text-textSecondary max-w-xs">Analyse de votre demande et définition des objectifs.</p>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2">2</div>
              <h3 className="font-bold text-lg">Phase d'investigation</h3>
              <p className="text-textSecondary max-w-xs">Exploration de votre parcours et construction du projet.</p>
            </div>
            <div className="flex flex-col items-center z-10">
              <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2">3</div>
              <h3 className="font-bold text-lg">Phase de conclusion</h3>
              <p className="text-textSecondary max-w-xs">Synthèse, plan d'action et remise du document final.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold font-heading mb-12 text-center">Ce que nos clients disent</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard quote="Le bilan a été un véritable tournant. J'ai pu me reconvertir avec confiance dans un domaine qui me passionne." author="Marie L." title="Devenue formatrice en communication" />
            <TestimonialCard quote="J'ai identifié mes compétences transférables et construit un projet d'évolution au sein de mon entreprise." author="Thomas D." title="Cadre dans l'industrie" />
            <TestimonialCard quote="En situation de burnout, le bilan a été une bouffée d'oxygène. Je me suis reconvertie dans un métier qui a du sens." author="Sophie M." title="Ancienne DRH, devenue coach" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary text-white text-center py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold font-heading mb-4">Prêt à faire le point sur votre carrière ?</h2>
          <p className="text-lg mb-8">Nos consultants certifiés vous accompagnent pour révéler votre potentiel.</p>
          <Link href="/contact" legacyBehavior>
            <a className="bg-white text-secondary px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg">Contactez-nous</a>
          </Link>
        </div>
      </section>
    </>
  );
}

