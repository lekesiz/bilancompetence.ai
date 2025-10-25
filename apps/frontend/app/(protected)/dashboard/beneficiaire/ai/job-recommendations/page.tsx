'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';

interface Job {
  id: string;
  title: string;
  sector: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  averageSalary: string;
  growthRate: string;
  education: string;
  workEnvironment: string;
}

const JobRecommendationsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data = await apiClient.get('/api/ai/job-recommendations');
      setJobs(data.recommendations);

    } catch (error) {
      // Demo mode fallback
      setJobs([
        {
          id: '1',
          title: 'Développeur Full-Stack Senior',
          sector: 'Informatique',
          matchScore: 95,
          description: 'Concevoir et développer des applications web complètes en utilisant des technologies modernes. Travailler en équipe agile et participer à l\'architecture logicielle.',
          requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
          averageSalary: '45 000 - 65 000 €/an',
          growthRate: '+12% par an',
          education: 'Bac+5 en Informatique ou équivalent',
          workEnvironment: 'Bureau / Télétravail hybride'
        },
        {
          id: '2',
          title: 'Architecte Logiciel',
          sector: 'Informatique',
          matchScore: 88,
          description: 'Définir l\'architecture technique des projets, guider les équipes de développement et assurer la qualité du code. Expertise en design patterns et scalabilité.',
          requiredSkills: ['Architecture', 'Microservices', 'Cloud', 'DevOps', 'Leadership'],
          averageSalary: '55 000 - 80 000 €/an',
          growthRate: '+10% par an',
          education: 'Bac+5 en Informatique + 5 ans d\'expérience',
          workEnvironment: 'Bureau / Télétravail partiel'
        },
        {
          id: '3',
          title: 'Lead Developer',
          sector: 'Informatique',
          matchScore: 85,
          description: 'Manager une équipe de développeurs, coordonner les projets techniques et assurer la livraison de solutions de qualité. Rôle technique et managérial.',
          requiredSkills: ['Management', 'React', 'Node.js', 'Agile', 'Mentoring'],
          averageSalary: '50 000 - 70 000 €/an',
          growthRate: '+8% par an',
          education: 'Bac+5 en Informatique + expérience managériale',
          workEnvironment: 'Bureau'
        },
        {
          id: '4',
          title: 'Consultant Technique',
          sector: 'Conseil',
          matchScore: 78,
          description: 'Accompagner les clients dans leurs projets de transformation digitale. Analyser les besoins, proposer des solutions et superviser leur mise en œuvre.',
          requiredSkills: ['Conseil', 'Technologies Web', 'Communication', 'Gestion de projet'],
          averageSalary: '45 000 - 65 000 €/an',
          growthRate: '+7% par an',
          education: 'Bac+5 en Informatique ou Management',
          workEnvironment: 'Déplacements fréquents / Télétravail'
        },
        {
          id: '5',
          title: 'DevOps Engineer',
          sector: 'Informatique',
          matchScore: 72,
          description: 'Automatiser les processus de déploiement, gérer l\'infrastructure cloud et assurer la disponibilité des services. Culture DevOps et CI/CD.',
          requiredSkills: ['Docker', 'Kubernetes', 'AWS/Azure', 'CI/CD', 'Scripting'],
          averageSalary: '42 000 - 60 000 €/an',
          growthRate: '+15% par an',
          education: 'Bac+3/5 en Informatique',
          workEnvironment: 'Bureau / Télétravail'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'high') return job.matchScore >= 80;
    if (filter === 'medium') return job.matchScore >= 60 && job.matchScore < 80;
    return true;
  });

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 dark:text-gray-100 border-gray-300';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 60) return 'Bon match';
    return 'Match moyen';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-200 font-medium">Chargement des recommandations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/beneficiaire" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Métiers recommandés</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Basé sur votre profil, vos compétences et vos aspirations professionnelles
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtrer par compatibilité</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                }`}
              >
                Tous ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'high'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                }`}
              >
                Excellents ({jobs.filter(j => j.matchScore >= 80).length})
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                }`}
              >
                Bons ({jobs.filter(j => j.matchScore >= 60 && j.matchScore < 80).length})
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{job.sector}</p>
                </div>
                <div className={`px-3 py-1 rounded-full border ${getMatchColor(job.matchScore)}`}>
                  <span className="font-bold">{job.matchScore}%</span>
                </div>
              </div>

              {/* Match Label */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                  {getMatchLabel(job.matchScore)}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-200 mb-4 line-clamp-3">{job.description}</p>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Compétences requises:</p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">
                      +{job.requiredSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Salary & Growth */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.averageSalary}
                </div>
                <div className="flex items-center text-success-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {job.growthRate}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJob(job);
                }}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Voir les détails
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun métier trouvé</h3>
            <p className="text-gray-600 dark:text-gray-300">Essayez de changer les filtres</p>
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedJob(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedJob(null)}
                className="float-right text-gray-300 hover:text-gray-600 dark:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">{selectedJob.sector}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border ${getMatchColor(selectedJob.matchScore)}`}>
                    <span className="font-bold text-lg">{selectedJob.matchScore}%</span>
                  </div>
                </div>
                <span className={`inline-block px-4 py-2 rounded-lg font-medium ${getMatchColor(selectedJob.matchScore)}`}>
                  {getMatchLabel(selectedJob.matchScore)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description du poste</h3>
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Compétences requises</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedJob.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Salaire moyen</h4>
                  <p className="text-gray-700 dark:text-gray-200">{selectedJob.averageSalary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Croissance du secteur</h4>
                  <p className="text-success-600 font-semibold">{selectedJob.growthRate}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Formation requise</h4>
                  <p className="text-gray-700 dark:text-gray-200">{selectedJob.education}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Environnement de travail</h4>
                  <p className="text-gray-700 dark:text-gray-200">{selectedJob.workEnvironment}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                  Ajouter à mes favoris
                </button>
                <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                  Voir les formations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendationsPage;

