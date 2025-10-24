'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
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
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
              🎯 Certifié Qualiopi • 100% Finançable CPF
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Donnez un <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">nouveau souffle</span> à votre carrière
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Faites le point sur vos compétences avec l'IA, identifiez vos motivations et construisez un projet professionnel qui vous ressemble.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/register"
                className="group relative px-8 py-4 bg-white text-blue-700 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-2"
              >
                Commencer mon bilan
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link 
                href="/methodologie"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
              >
                Découvrir la méthodologie
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>4.9/5 sur 847 avis</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>98% de satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>+2800 bénéficiaires accompagnés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold text-blue-600 mb-2">{stats.users.toLocaleString()}+</div>
              <div className="text-lg text-gray-700 font-medium">Bénéficiaires accompagnés</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold text-green-600 mb-2">{stats.bilans.toLocaleString()}+</div>
              <div className="text-lg text-gray-700 font-medium">Bilans complétés</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 transform hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-extrabold text-orange-600 mb-2">{stats.satisfaction}%</div>
              <div className="text-lg text-gray-700 font-medium">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Icons */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir BilanCompetence.AI ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une approche innovante qui combine expertise humaine et intelligence artificielle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analyse IA Approfondie</h3>
              <p className="text-gray-600">
                Identifiez vos compétences, aptitudes et motivations grâce à notre IA et une méthodologie éprouvée.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Projet Sur Mesure</h3>
              <p className="text-gray-600">
                Construisez un projet professionnel réaliste et motivant, parfaitement adapté à votre profil unique.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accompagnement Expert</h3>
              <p className="text-gray-600">
                Bénéficiez d'un suivi individuel avec un consultant certifié Qualiopi à chaque étape de votre parcours.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Finançable</h3>
              <p className="text-gray-600">
                Utilisez votre CPF ou d'autres dispositifs pour financer votre bilan sans impact sur votre budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment se déroule votre bilan ?
            </h2>
            <p className="text-xl text-gray-600">
              Un parcours structuré en 3 phases pour un accompagnement optimal
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-blue-400 to-blue-600"></div>

              {/* Phase 1 */}
              <div className="relative mb-16 md:mb-24">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">1</div>
                        <h3 className="text-2xl font-bold text-gray-900">Phase Préliminaire</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Analyse de votre demande, définition de vos objectifs et mise en place du cadre de travail.
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        4-6 heures
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <div className="bg-white p-6 rounded-xl border-2 border-blue-100">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Entretien de découverte</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Définition des objectifs</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Planification du parcours</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="relative mb-16 md:mb-24">
                <div className="flex flex-col md:flex-row-reverse items-center">
                  <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">2</div>
                        <h3 className="text-2xl font-bold text-gray-900">Phase d'Investigation</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Exploration approfondie de vos compétences, motivations et pistes professionnelles.
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        12-16 heures
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pr-12">
                    <div className="bg-white p-6 rounded-xl border-2 border-green-100">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Tests psychométriques (MBTI, RIASEC)</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Analyse IA de votre CV</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Exploration des pistes métiers</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">3</div>
                        <h3 className="text-2xl font-bold text-gray-900">Phase de Conclusion</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Synthèse de votre parcours, élaboration de votre plan d'action et remise des documents.
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        4-6 heures
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <div className="bg-white p-6 rounded-xl border-2 border-purple-100">
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Document de synthèse personnalisé</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Plan d'action détaillé</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Attestation officielle</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/methodologie"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              En savoir plus sur notre méthodologie
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils ont transformé leur carrière
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez les témoignages de nos bénéficiaires
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">
                "Le bilan a été un véritable tournant dans ma vie professionnelle. Grâce à l'accompagnement et aux outils IA, j'ai pu me reconvertir avec confiance dans un domaine qui me passionne vraiment."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  M
                </div>
                <div>
                  <div className="font-bold text-gray-900">Marie L.</div>
                  <div className="text-sm text-gray-600">Devenue formatrice en communication</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">
                "J'ai pu identifier mes compétences transférables que je ne soupçonnais même pas. Le consultant m'a aidé à construire un projet d'évolution cohérent au sein de mon entreprise."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  T
                </div>
                <div>
                  <div className="font-bold text-gray-900">Thomas D.</div>
                  <div className="text-sm text-gray-600">Cadre dans l'industrie</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">
                "En situation de burnout, le bilan a été une véritable bouffée d'oxygène. Je me suis reconvertie dans un métier qui a du sens pour moi et je suis enfin épanouie."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  S
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sophie M.</div>
                  <div className="text-sm text-gray-600">Ancienne DRH, devenue coach</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à donner un nouveau souffle à votre carrière ?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Nos consultants certifiés et notre IA vous accompagnent pour révéler votre plein potentiel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="px-10 py-5 bg-white text-blue-700 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="/contact"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

