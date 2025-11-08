'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import StructuredData from '@/components/seo/StructuredData';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

// ✅ Sprint 1.3 FIX: Removed force-dynamic to allow static generation
// This was causing NEXT_NOT_FOUND errors with [locale] dynamic routes

export default function HomePage() {
  const t = useTranslations();
  
  // SEO Structured Data
  const structuredDataRendered = (
    <>
      <StructuredData type="Organization" />
      <StructuredData type="Service" />
    </>
  );
  
  const [stats, setStats] = useState({ users: 0, bilans: 0, satisfaction: 0 });

  // Animated counter effect
  useEffect(() => {
    const targetStats = { users: 2847, bilans: 1523, satisfaction: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        users: Math.floor(targetStats.users * progress),
        bilans: Math.floor(targetStats.bilans * progress),
        satisfaction: Math.floor(targetStats.satisfaction * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {structuredDataRendered}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/fr/register">
                <Button size="lg">
                  {t('home.hero.cta')}
                </Button>
              </Link>
              <Link href="/fr/quest-ce-quun-bilan">
                <Button variant="outline" size="lg">
                  {t('home.hero.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {t('home.stats.users')}
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.bilans.toLocaleString()}+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {t('home.stats.bilans')}
              </div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.satisfaction}%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {t('home.stats.satisfaction')}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - 4 features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.ai.description')}
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {t('home.features.personalized.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.personalized.description')}
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {t('home.features.expert.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.expert.description')}
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                {t('home.features.funding.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.funding.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.benefits.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.benefits.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('home.benefits.items.clarity.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.benefits.items.clarity.description')}
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('home.benefits.items.project.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.benefits.items.project.description')}
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('home.benefits.items.confidence.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.benefits.items.confidence.description')}
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {t('home.benefits.items.action.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.benefits.items.action.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {t.raw('home.testimonials.items').map((testimonial: any, index: number) => (
              <Card key={index} className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.process.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.process.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 border-t-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('home.process.phase1.title')}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {t('home.process.phase1.duration')}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {t('home.process.phase1.description')}
              </p>
              <ul className="space-y-2">
                {t.raw('home.process.phase1.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-8 border-t-4 border-purple-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('home.process.phase2.title')}
                </h3>
                <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {t('home.process.phase2.duration')}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {t('home.process.phase2.description')}
              </p>
              <ul className="space-y-2">
                {t.raw('home.process.phase2.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-8 border-t-4 border-green-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('home.process.phase3.title')}
                </h3>
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {t('home.process.phase3.duration')}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {t('home.process.phase3.description')}
              </p>
              <ul className="space-y-2">
                {t.raw('home.process.phase3.items').map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('home.cta.subtitle')}
            </p>
            <Link href="/fr/register">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 border-white">
                {t('home.cta.button')}
              </Button>
            </Link>
            <p className="mt-6 text-sm opacity-90">
              {t('home.cta.guarantee')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

