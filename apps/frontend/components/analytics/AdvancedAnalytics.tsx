'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, Award } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeAssessments: number;
  completedAssessments: number;
  averageScore: number;
  userGrowth: { month: string; users: number }[];
  assessmentsByType: { type: string; count: number }[];
  completionRate: { month: string; rate: number }[];
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  // TODO: Replace with actual API call
  return {
    totalUsers: 1247,
    activeAssessments: 89,
    completedAssessments: 432,
    averageScore: 78.5,
    userGrowth: [
      { month: 'Jan', users: 120 },
      { month: 'Fév', users: 180 },
      { month: 'Mar', users: 250 },
      { month: 'Avr', users: 320 },
      { month: 'Mai', users: 450 },
      { month: 'Juin', users: 580 },
    ],
    assessmentsByType: [
      { type: 'MBTI', count: 234 },
      { type: 'RIASEC', count: 198 },
      { type: 'Compétences', count: 156 },
    ],
    completionRate: [
      { month: 'Jan', rate: 65 },
      { month: 'Fév', rate: 72 },
      { month: 'Mar', rate: 78 },
      { month: 'Avr', rate: 75 },
      { month: 'Mai', rate: 82 },
      { month: 'Juin', rate: 85 },
    ],
  };
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c'];

export default function AdvancedAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        Erreur lors du chargement des analytics
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Utilisateurs totaux',
      value: data.totalUsers,
      icon: Users,
      color: 'blue',
      change: '+12.5%',
    },
    {
      label: 'Bilans actifs',
      value: data.activeAssessments,
      icon: FileText,
      color: 'purple',
      change: '+8.2%',
    },
    {
      label: 'Bilans complétés',
      value: data.completedAssessments,
      icon: Award,
      color: 'pink',
      change: '+15.3%',
    },
    {
      label: 'Score moyen',
      value: `${data.averageScore}%`,
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
              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Croissance des utilisateurs
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#2563eb"
                strokeWidth={2}
                name="Utilisateurs"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Assessments by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Bilans par type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.assessmentsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) =>
                  `${type}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.assessmentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Taux de complétion
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.completionRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="rate" fill="#7c3aed" name="Taux (%)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

