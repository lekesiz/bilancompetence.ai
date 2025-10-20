/**
 * Offline Support System
 * - Local storage of data
 * - Queue operations during offline
 * - Sync when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineData {
  assessments: any[];
  conversations: any[];
  messages: any[];
  notifications: any[];
  preferences: any;
  lastSyncTime: number;
}

class OfflineManager {
  private readonly QUEUE_KEY = '@offlineQueue';
  private readonly DATA_KEY = '@offlineData';
  private readonly SYNC_TIME_KEY = '@lastSyncTime';
  private queue: QueuedOperation[] = [];
  private offlineData: OfflineData = {
    assessments: [],
    conversations: [],
    messages: [],
    notifications: [],
    preferences: null,
    lastSyncTime: 0,
  };
  private isOnline = true;

  constructor() {
    this.initializeOfflineData();
    this.setupNetworkListener();
  }

  /**
   * Initialize offline data from storage
   */
  private async initializeOfflineData(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
      }

      const offlineData = await AsyncStorage.getItem(this.DATA_KEY);
      if (offlineData) {
        this.offlineData = JSON.parse(offlineData);
      }
    } catch (error) {
      console.error('Failed to initialize offline data:', error);
    }
  }

  /**
   * Setup network listener
   */
  private setupNetworkListener(): void {
    // Would use NetInfo in React Native
    // For now, simulate with manual setup
  }

  /**
   * Queue operation for later sync
   */
  queueOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    data: any
  ): string {
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      endpoint,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(operation);
    this.persistQueue();

    return operation.id;
  }

  /**
   * Save assessment offline
   */
  async saveAssessmentOffline(assessment: any): Promise<void> {
    this.offlineData.assessments.push(assessment);
    await this.persistOfflineData();
  }

  /**
   * Save conversation offline
   */
  async saveConversationOffline(conversation: any): Promise<void> {
    this.offlineData.conversations.push(conversation);
    await this.persistOfflineData();
  }

  /**
   * Save message offline
   */
  async saveMessageOffline(message: any): Promise<void> {
    this.offlineData.messages.push(message);
    await this.persistOfflineData();
  }

  /**
   * Get offline data
   */
  getOfflineData(): OfflineData {
    return this.offlineData;
  }

  /**
   * Get queued operations
   */
  getQueuedOperations(): QueuedOperation[] {
    return this.queue;
  }

  /**
   * Sync offline data when online
   */
  async syncOfflineData(syncCallback: (operation: QueuedOperation) => Promise<boolean>): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    const successfulIds: string[] = [];

    for (const operation of this.queue) {
      try {
        const success = await syncCallback(operation);

        if (success) {
          successfulIds.push(operation.id);
        } else {
          operation.retries++;

          // Stop retrying after 3 failures
          if (operation.retries > 3) {
            successfulIds.push(operation.id);
          }
        }
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        operation.retries++;

        if (operation.retries > 3) {
          successfulIds.push(operation.id);
        }
      }
    }

    // Remove successful operations from queue
    this.queue = this.queue.filter((op) => !successfulIds.includes(op.id));
    await this.persistQueue();

    // Clear synced offline data
    this.offlineData = {
      assessments: [],
      conversations: [],
      messages: [],
      notifications: [],
      preferences: null,
      lastSyncTime: Date.now(),
    };
    await this.persistOfflineData();
  }

  /**
   * Check if online
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      // Trigger sync when going online
      this.triggerSync();
    }
  }

  /**
   * Is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to persist queue:', error);
    }
  }

  /**
   * Persist offline data to storage
   */
  private async persistOfflineData(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.DATA_KEY, JSON.stringify(this.offlineData));
    } catch (error) {
      console.error('Failed to persist offline data:', error);
    }
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
      await AsyncStorage.removeItem(this.DATA_KEY);
      this.queue = [];
      this.offlineData = {
        assessments: [],
        conversations: [],
        messages: [],
        notifications: [],
        preferences: null,
        lastSyncTime: 0,
      };
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    queuedOperations: number;
    lastSyncTime: number;
  } {
    return {
      isOnline: this.isOnline,
      queuedOperations: this.queue.length,
      lastSyncTime: this.offlineData.lastSyncTime,
    };
  }

  /**
   * Trigger sync (placeholder)
   */
  private triggerSync(): void {
    // Would be called when going online
    // Emit event for app to handle actual sync
  }
}

export const offlineManager = new OfflineManager();

/**
 * Hook for offline support (would be used in components)
 */
export function useOfflineSupport() {
  return {
    isOnline: offlineManager.getIsOnline(),
    queuedOperations: offlineManager.getQueuedOperations().length,
    syncStatus: offlineManager.getSyncStatus(),
    queueOperation: (type: any, endpoint: string, data: any) =>
      offlineManager.queueOperation(type, endpoint, data),
    clearOfflineData: () => offlineManager.clearOfflineData(),
  };
}

export default offlineManager;
