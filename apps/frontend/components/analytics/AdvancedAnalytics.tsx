'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, Award } from 'lucide-react';

export default function AdvancedAnalytics() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      label: 'Utilisateurs totaux',
      value: 1247,
      icon: Users,
      color: 'blue',
      change: '+12.5%',
    },
    {
      label: 'Bilans actifs',
      value: 89,
      icon: FileText,
      color: 'purple',
      change: '+8.2%',
    },
    {
      label: 'Bilans complétés',
      value: 432,
      icon: Award,
      color: 'pink',
      change: '+15.3%',
    },
    {
      label: 'Score moyen',
      value: '78.5%',
      icon: TrendingUp,
      color: 'orange',
      change: '+2.1%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Statistiques détaillées
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Les graphiques avancés seront disponibles prochainement.
        </p>
      </motion.div>
    </div>
  );
}

