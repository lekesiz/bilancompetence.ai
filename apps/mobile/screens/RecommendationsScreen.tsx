import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
  RefreshControl,
  Modal,
} from 'react-native';
import api from '../lib/api';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'skill' | 'development' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  action_url?: string;
  estimated_time?: string;
}

export default function RecommendationsScreen({ navigation }: any) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'career' | 'skill' | 'development' | 'opportunity'>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, selectedFilter, selectedCategory]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // In real app, would fetch from API
      // const response = await api.get('/assessments/recommendations');
      // For now, use mock data
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec-1',
          title: 'Take Advanced Python Course',
          description: 'Based on your assessment results, mastering Python would significantly enhance your career prospects in data science and automation.',
          category: 'skill',
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          estimated_time: '8 weeks',
          action_url: 'https://example.com/python-course',
        },
        {
          id: 'rec-2',
          title: 'Explore Product Manager Role',
          description: 'Your assessment indicates strong product thinking and communication skills. Consider transitioning into product management roles.',
          category: 'career',
          priority: 'high',
          status: 'in_progress',
          created_at: new Date(Date.now() - 604800000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          estimated_time: '3 months',
        },
        {
          id: 'rec-3',
          title: 'Cloud Certification (AWS)',
          description: 'With your technical background, an AWS certification would open up new opportunities and increase your market value.',
          category: 'development',
          priority: 'medium',
          status: 'pending',
          created_at: new Date(Date.now() - 1209600000).toISOString(),
          updated_at: new Date(Date.now() - 1209600000).toISOString(),
          estimated_time: '6 weeks',
        },
        {
          id: 'rec-4',
          title: 'Senior Engineer Opportunity',
          description: 'ABC Tech Company is hiring senior engineers. Your profile matches their requirements perfectly.',
          category: 'opportunity',
          priority: 'high',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          estimated_time: 'Immediate',
          action_url: 'https://example.com/job-posting',
        },
      ];
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const filterRecommendations = () => {
    let filtered = recommendations;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === selectedFilter);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    setFilteredRecommendations(filtered);
  };

  const handleUpdateStatus = async (recommendationId: string, newStatus: Recommendation['status']) => {
    try {
      // Update in API
      await api.put(`/assessments/recommendations/${recommendationId}`, {
        status: newStatus,
      });

      // Update local state
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === recommendationId
            ? { ...r, status: newStatus, updated_at: new Date().toISOString() }
            : r
        )
      );

      if (selectedRecommendation?.id === recommendationId) {
        setSelectedRecommendation({
          ...selectedRecommendation,
          status: newStatus,
          updated_at: new Date().toISOString(),
        });
      }

      Alert.alert('Success', 'Recommendation updated');
    } catch (error) {
      console.error('Failed to update recommendation:', error);
      Alert.alert('Error', 'Failed to update recommendation');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return '🎯';
      case 'skill':
        return '💡';
      case 'development':
        return '📚';
      case 'opportunity':
        return '🚀';
      default:
        return '⭐';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#9ca3af';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      default:
        return '#9ca3af';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
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
          <Text style={styles.title}>Recommendations</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filteredRecommendations.length}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="⏳"
            label="Pending"
            value={recommendations.filter((r) => r.status === 'pending').length}
            color="#9ca3af"
          />
          <StatCard
            icon="⚡"
            label="In Progress"
            value={recommendations.filter((r) => r.status === 'in_progress').length}
            color="#3b82f6"
          />
          <StatCard
            icon="✅"
            label="Completed"
            value={recommendations.filter((r) => r.status === 'completed').length}
            color="#10b981"
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'pending', 'in_progress', 'completed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(filter as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'career', 'skill', 'development', 'opportunity'].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.filterChipTextActive,
                  ]}
                >
                  {category === 'all' ? 'All Categories' : category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommendations List */}
        {filteredRecommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No Recommendations</Text>
            <Text style={styles.emptyStateText}>
              Complete assessments to receive personalized recommendations
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecommendations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item: recommendation }) => (
              <RecommendationCard
                recommendation={recommendation}
                onPress={() => {
                  setSelectedRecommendation(recommendation);
                  setShowDetails(true);
                }}
                getPriorityColor={getPriorityColor}
                getCategoryIcon={getCategoryIcon}
                getStatusColor={getStatusColor}
              />
            )}
          />
        )}
      </ScrollView>

      {/* Details Modal */}
      {selectedRecommendation && (
        <Modal visible={showDetails} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Details</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Title */}
                <View style={styles.detailSection}>
                  <View style={styles.titleRow}>
                    <Text style={styles.detailTitle}>{selectedRecommendation.title}</Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(selectedRecommendation.priority) },
                      ]}
                    >
                      <Text style={styles.priorityBadgeText}>
                        {selectedRecommendation.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Category & Time */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>{getCategoryIcon(selectedRecommendation.category)}</Text>
                    <Text style={styles.metaLabel}>
                      {selectedRecommendation.category.toUpperCase()}
                    </Text>
                  </View>
                  {selectedRecommendation.estimated_time && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏱️</Text>
                      <Text style={styles.metaLabel}>
                        {selectedRecommendation.estimated_time}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{selectedRecommendation.description}</Text>
                </View>

                {/* Status */}
                <View style={styles.statusSection}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.statusOptions}>
                    {(['pending', 'in_progress', 'completed'] as const).map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          selectedRecommendation.status === status &&
                            styles.statusOptionActive,
                        ]}
                        onPress={() => handleUpdateStatus(selectedRecommendation.id, status)}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            selectedRecommendation.status === status &&
                              styles.statusOptionTextActive,
                          ]}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Action Button */}
                {selectedRecommendation.action_url && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert('Coming Soon', 'Opening external link would redirect to: ' + selectedRecommendation.action_url);
                    }}
                  >
                    <Text style={styles.actionButtonText}>Learn More →</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetails(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function RecommendationCard({
  recommendation,
  onPress,
  getPriorityColor,
  getCategoryIcon,
  getStatusColor,
}: {
  recommendation: Recommendation;
  onPress: () => void;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardIcon}>{getCategoryIcon(recommendation.category)}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {recommendation.title}
          </Text>
        </View>
        <View
          style={[
            styles.priorityDot,
            { backgroundColor: getPriorityColor(recommendation.priority) },
          ]}
        />
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {recommendation.description}
      </Text>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(recommendation.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusBadgeText, { color: getStatusColor(recommendation.status) }]}
          >
            {recommendation.status.replace('_', ' ')}
          </Text>
        </View>
        {recommendation.estimated_time && (
          <Text style={styles.timeText}>⏱️ {recommendation.estimated_time}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  badge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
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
    alignItems: 'flex-start',
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    padding: 20,
    maxHeight: '75%',
  },
  detailSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  statusOptionTextActive: {
    color: '#2563eb',
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
