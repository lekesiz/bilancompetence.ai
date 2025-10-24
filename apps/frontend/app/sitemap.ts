import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bilancompetence.vercel.app';
  
  const routes = [
    '',
    '/quest-ce-quun-bilan',
    '/methodologie',
    '/financement',
    '/bilan-a-distance',
    '/faq',
    '/contact',
    '/login',
    '/register',
    '/mentions-legales',
    '/politique-confidentialite',
    '/conditions-generales',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}

