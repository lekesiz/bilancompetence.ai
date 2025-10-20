import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import api from '../lib/api';

interface AnalyticsData {
  totalAssessments: number;
  completedAssessments: number;
  averageScore: number;
  completionRate: number;
  skillProficiencies: { skill: string; level: number }[];
  assessmentTrend: { date: string; count: number }[];
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/analytics/user-activity');
      if (response.data?.data) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodButton, period === p && styles.periodButtonActive]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === p && styles.periodButtonTextActive,
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="📊"
            title="Total Assessments"
            value={analytics.totalAssessments}
            subtitle="Completed"
            subvalue={analytics.completedAssessments}
          />
          <MetricCard
            icon="⭐"
            title="Average Score"
            value={`${Math.round(analytics.averageScore)}%`}
            subtitle="Completion Rate"
            subvalue={`${analytics.completionRate}%`}
          />
        </View>

        {/* Completion Rate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion Rate</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${analytics.completionRate}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{analytics.completionRate}%</Text>
          </View>
        </View>

        {/* Top Skills */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Skills</Text>
          <View style={styles.skillsList}>
            {analytics.skillProficiencies.slice(0, 5).map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <Text style={styles.skillName}>{skill.skill}</Text>
                <View style={styles.skillBarContainer}>
                  <View
                    style={[
                      styles.skillBar,
                      { width: `${skill.level * 20}%` },
                    ]}
                  />
                </View>
                <Text style={styles.skillLevel}>{skill.level}/5</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Insights</Text>
          <View style={styles.insightsList}>
            <InsightItem
              icon="🎯"
              title="Career Trajectory"
              description="On track for advancement"
            />
            <InsightItem
              icon="📈"
              title="Skill Growth"
              description="40% improvement in leadership"
            />
            <InsightItem
              icon="🌟"
              title="Recommendations"
              description="3 new opportunities available"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  subvalue,
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  subvalue: string | number;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
      <Text style={styles.metricSubvalue}>{subvalue}</Text>
    </View>
  );
}

function InsightItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.insightItem}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 8,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  metricSubvalue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  skillsList: {
    gap: 12,
  },
  skillItem: {
    gap: 6,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  skillBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillBar: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  skillLevel: {
    fontSize: 12,
    color: '#999',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    color: '#666',
  },
});
