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
              <Link href="/register">
                <Button size="lg">
                  {t('home.hero.cta')}
                </Button>
              </Link>
              <Link href="/quest-ce-quun-bilan">
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('home.features.ai.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.ai.description')}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('home.features.personalized.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.personalized.description')}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('home.features.expert.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('home.features.expert.description')}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

