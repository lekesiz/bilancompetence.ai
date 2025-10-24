import Script from 'next/script';

interface StructuredDataProps {
  type: 'Organization' | 'Service' | 'FAQPage' | 'BreadcrumbList';
  data?: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'BilanCompetence.AI',
          description: 'Plateforme intelligente de bilan de compétences avec IA',
          url: 'https://bilancompetence.vercel.app',
          logo: 'https://bilancompetence.vercel.app/logo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+33-3-67-31-02-01',
            contactType: 'Customer Service',
            email: 'contact@netzinformatique.fr',
            availableLanguage: ['French'],
          },
          address: {
            '@type': 'PostalAddress',
            streetAddress: '1 A Route de Schweighouse',
            addressLocality: 'Haguenau',
            postalCode: '67500',
            addressCountry: 'FR',
          },
          sameAs: [
            'https://www.linkedin.com/company/netz-informatique',
            'https://www.facebook.com/netzinformatique',
          ],
        };

      case 'Service':
        return {
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Bilan de Compétences',
          provider: {
            '@type': 'Organization',
            name: 'BilanCompetence.AI',
          },
          areaServed: {
            '@type': 'Country',
            name: 'France',
          },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Services de Bilan de Compétences',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Bilan de Compétences Complet',
                  description: 'Bilan de compétences personnalisé avec tests psychométriques et accompagnement IA',
                },
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Bilan de Compétences à Distance',
                  description: 'Bilan de compétences 100% en ligne avec consultant dédié',
                },
              },
            ],
          },
        };

      case 'FAQPage':
        return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data?.questions?.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          })) || [],
        };

      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data?.items?.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })) || [],
        };

      default:
        return {};
    }
  };

  const structuredData = getStructuredData();

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

