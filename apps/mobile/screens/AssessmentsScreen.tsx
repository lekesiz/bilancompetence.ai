import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import api from '../lib/api';

interface Assessment {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  assessment_type: 'career' | 'skills' | 'comprehensive';
  created_at: string;
  completion_percentage?: number;
}

export default function AssessmentsScreen({ navigation }: any) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssessmentTitle, setNewAssessmentTitle] = useState('');
  const [newAssessmentType, setNewAssessmentType] = useState<'career' | 'skills' | 'comprehensive'>('career');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await api.getUserAssessments(50);
      if (response.data?.data) {
        setAssessments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      Alert.alert('Error', 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssessments();
    setRefreshing(false);
  };

  const handleCreateAssessment = async () => {
    if (!newAssessmentTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter assessment title');
      return;
    }

    try {
      const response = await api.post('/assessments', {
        title: newAssessmentTitle,
        description: '',
        assessment_type: newAssessmentType,
      });

      if (response.data?.data) {
        setAssessments([response.data.data, ...assessments]);
        setNewAssessmentTitle('');
        setShowCreateModal(false);
        Alert.alert('Success', 'Assessment created successfully');
      }
    } catch (error) {
      console.error('Failed to create assessment:', error);
      Alert.alert('Error', 'Failed to create assessment');
    }
  };

  const handleStartAssessment = async (assessmentId: string) => {
    try {
      await api.startAssessment(assessmentId);
      navigation.navigate('AssessmentDetail', { assessmentId });
    } catch (error) {
      console.error('Failed to start assessment:', error);
      Alert.alert('Error', 'Failed to start assessment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#9ca3af';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'archived':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'career':
        return '🎯';
      case 'skills':
        return '💡';
      case 'comprehensive':
        return '📊';
      default:
        return '📋';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading assessments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Assessments</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <StatBadge
            label="Total"
            value={assessments.length.toString()}
            color="#3b82f6"
          />
          <StatBadge
            label="In Progress"
            value={assessments.filter((a) => a.status === 'in_progress').length.toString()}
            color="#f59e0b"
          />
          <StatBadge
            label="Completed"
            value={assessments.filter((a) => a.status === 'completed').length.toString()}
            color="#10b981"
          />
        </View>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No Assessments Yet</Text>
            <Text style={styles.emptyStateText}>Create your first assessment to get started</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={assessments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item: assessment }) => (
              <AssessmentCard
                assessment={assessment}
                onStart={() => handleStartAssessment(assessment.id)}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                getTypeIcon={getTypeIcon}
              />
            )}
          />
        )}
      </ScrollView>

      {/* Create Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Assessment</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Assessment Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter title"
              value={newAssessmentTitle}
              onChangeText={setNewAssessmentTitle}
            />

            <Text style={styles.label}>Assessment Type</Text>
            <View style={styles.typeSelector}>
              {(['career', 'skills', 'comprehensive'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newAssessmentType === type && styles.typeOptionSelected,
                  ]}
                  onPress={() => setNewAssessmentType(type)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      newAssessmentType === type && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateAssessment}
              >
                <Text style={styles.submitButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function AssessmentCard({
  assessment,
  onStart,
  getStatusColor,
  getStatusLabel,
  getTypeIcon,
}: {
  assessment: Assessment;
  onStart: () => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getTypeIcon: (type: string) => string;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onStart}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTypeIcon}>{getTypeIcon(assessment.assessment_type)}</Text>
          <Text style={styles.cardTitle}>{assessment.title}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(assessment.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusBadgeText, { color: getStatusColor(assessment.status) }]}
          >
            {getStatusLabel(assessment.status)}
          </Text>
        </View>
      </View>

      {assessment.completion_percentage !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${assessment.completion_percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{assessment.completion_percentage}% Complete</Text>
        </View>
      )}

      <Text style={styles.cardDescription}>{assessment.description || 'No description'}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          Created: {new Date(assessment.created_at).toLocaleDateString()}
        </Text>
        {assessment.status !== 'completed' && (
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>
              {assessment.status === 'draft' ? 'Start' : 'Continue'} →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statBadge, { borderLeftColor: color }]}>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  statBadgeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statBadgeLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTypeIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  startButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startButtonText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#2563eb',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
