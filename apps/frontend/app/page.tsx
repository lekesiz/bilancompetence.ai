'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import StructuredData from '@/components/seo/StructuredData';
import Button from '@/components/qualiopi/Button';
import Card from '@/components/qualiopi/Card';

export const dynamic = 'force-dynamic';

export default function HomePage() {
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

      {/* Hero Section - Design System v3 (Haguenau.pro style) */}
      <section className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-secondary-700 text-white overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-section-mobile md:py-section">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge Jaune Vif - Haguenau.pro style */}
            <div className="inline-flex items-center gap-2 mb-8 px-6 py-3 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold shadow-lg">
              <span className="text-lg">🎯</span>
              <span>Certifié Qualiopi • 100% Finançable CPF</span>
              <span className="px-2 py-1 bg-white rounded-full text-xs font-extrabold">14 Jours Gratuits</span>
            </div>
            
            {/* Hero Title - 72px (Haguenau.pro style) */}
            <h1 className="hero-title mb-8">
              Donnez un <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">nouveau souffle</span> à votre carrière
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Faites le point sur vos compétences avec l'IA, identifiez vos motivations et construisez un projet professionnel qui vous ressemble.
            </p>

            {/* CTA Buttons - Design System v3 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register">
                <Button variant="success-gradient" size="lg" className="group">
                  Commencer mon bilan
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/methodologie">
                <Button variant="outline-secondary" size="lg" className="border-white text-white hover:bg-white/10">
                  Découvrir la méthodologie
                </Button>
              </Link>
            </div>

            {/* Trust Indicators - Haguenau.pro style */}
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <span className="flex items-center gap-2 text-white/90">
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">4.9/5</span>
              </span>
              <span className="text-white/50">•</span>
              <span className="text-white/90 font-medium">847 avis</span>
              <span className="text-white/50">•</span>
              <span className="text-white/90 font-medium">98% satisfaction</span>
              <span className="text-white/50">•</span>
              <span className="text-white/90 font-medium">+2800 bénéficiaires</span>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Stats Section - Design System v3 avec dégradé (Haguenau.pro style) */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <Card variant="gradient" className="rounded-3xl p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="animate-fade-in-up">
                  <div className="stats-number">{stats.users.toLocaleString()}+</div>
                  <div className="text-xl text-white/90 font-semibold">Bénéficiaires accompagnés</div>
                  <p className="text-white/70 text-sm mt-2">Des professionnels de tous secteurs</p>
                </div>
                <div className="animate-fade-in-up animation-delay-200">
                  <div className="stats-number">{stats.bilans.toLocaleString()}+</div>
                  <div className="text-xl text-white/90 font-semibold">Bilans complétés</div>
                  <p className="text-white/70 text-sm mt-2">Avec succès et satisfaction</p>
                </div>
                <div className="animate-fade-in-up animation-delay-400">
                  <div className="stats-number">{stats.satisfaction}%</div>
                  <div className="text-xl text-white/90 font-semibold">Taux de satisfaction</div>
                  <p className="text-white/70 text-sm mt-2">Note moyenne de nos clients</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - Design System v3 (Haguenau.pro style) */}
      <section className="section bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Pourquoi choisir BilanCompetence.AI ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Une approche innovante qui combine expertise humaine et intelligence artificielle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card variant="default" interactive className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analyse IA Approfondie</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Identifiez vos compétences, aptitudes et motivations grâce à notre IA et une méthodologie éprouvée.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card variant="default" interactive className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Projet Sur Mesure</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Construisez un projet professionnel réaliste et motivant, parfaitement adapté à votre profil unique.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card variant="default" interactive className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Accompagnement Expert</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Bénéficiez du soutien de consultants certifiés tout au long de votre parcours de reconversion.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card variant="default" interactive className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Certification Qualiopi</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Formation certifiée et 100% finançable par votre CPF, sans avance de frais.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section - Design System v3 avec numéros circulaires (Haguenau.pro style) */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Comment se déroule votre bilan ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Un parcours structuré en 3 phases pour vous accompagner vers votre réussite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Phase 1 */}
            <Card variant="blue-light" className="p-8 relative">
              <div className="number-circle absolute -top-6 left-8">1</div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phase Préliminaire</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Analyse de votre parcours professionnel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Identification de vos compétences</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Tests de personnalité (MBTI, RIASEC)</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-semibold">
                    Durée : 4-6 heures
                  </span>
                </div>
              </div>
            </Card>

            {/* Phase 2 */}
            <Card variant="purple-light" className="p-8 relative">
              <div className="number-circle absolute -top-6 left-8" style={{background: "linear-gradient(135deg, #A855F7 0%, #9333EA 100%)"}}>2</div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phase d'Investigation</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Exploration des pistes professionnelles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Étude de marché et opportunités</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Enquêtes métiers et rencontres</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded-full text-sm font-semibold">
                    Durée : 8-10 heures
                  </span>
                </div>
              </div>
            </Card>

            {/* Phase 3 */}
            <Card variant="default" interactive className="p-8 relative border-2 border-green-500">
              <div className="number-circle absolute -top-6 left-8" style={{background: "linear-gradient(135deg, #10B981 0%, #059669 100%)"}}>3</div>
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phase de Conclusion</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Définition de votre projet professionnel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Plan d'action détaillé</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Synthèse et document de restitution</span>
                  </div>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                    Durée : 4-6 heures
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Design System v3 (Haguenau.pro style) */}
      <section className="section bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à donner un nouveau souffle à votre carrière ?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Commencez votre bilan de compétences dès aujourd'hui et bénéficiez de 14 jours d'essai gratuit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="group">
                Commencer gratuitement
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg" className="text-white border-2 border-white/30 hover:bg-white/10">
                Contacter un conseiller
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
