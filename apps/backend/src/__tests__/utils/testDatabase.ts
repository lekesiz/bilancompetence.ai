/**
 * Test Database Utilities
 * 
 * Provides utilities for database seeding and cleanup for integration tests
 */

import { supabase } from '../../services/supabaseService.js';

/**
 * Test data templates
 */
export const testData = {
  users: {
    beneficiary: {
      id: 'test-beneficiary-1',
      email: 'beneficiary@test.com',
      full_name: 'Test Beneficiary',
      role: 'BENEFICIARY',
      created_at: new Date().toISOString(),
    },
    consultant: {
      id: 'test-consultant-1',
      email: 'consultant@test.com',
      full_name: 'Test Consultant',
      role: 'CONSULTANT',
      created_at: new Date().toISOString(),
    },
    admin: {
      id: 'test-admin-1',
      email: 'admin@test.com',
      full_name: 'Test Admin',
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    },
  },
  assessments: {
    draft: {
      id: 'test-assessment-draft',
      beneficiary_id: 'test-beneficiary-1',
      consultant_id: 'test-consultant-1',
      status: 'DRAFT',
      title: 'Test Assessment Draft',
      created_at: new Date().toISOString(),
    },
    inProgress: {
      id: 'test-assessment-progress',
      beneficiary_id: 'test-beneficiary-1',
      consultant_id: 'test-consultant-1',
      status: 'IN_PROGRESS',
      title: 'Test Assessment In Progress',
      created_at: new Date().toISOString(),
    },
    completed: {
      id: 'test-assessment-complete',
      beneficiary_id: 'test-beneficiary-1',
      consultant_id: 'test-consultant-1',
      status: 'COMPLETED',
      title: 'Test Assessment Completed',
      created_at: new Date().toISOString(),
    },
  },
  conversations: {
    active: {
      id: 'test-conversation-1',
      participant1_id: 'test-beneficiary-1',
      participant2_id: 'test-consultant-1',
      title: 'Test Conversation',
      created_at: new Date().toISOString(),
    },
  },
  notifications: {
    unread: {
      id: 'test-notification-1',
      user_id: 'test-beneficiary-1',
      type: 'assessment',
      title: 'Test Notification',
      message: 'This is a test notification',
      read: false,
      created_at: new Date().toISOString(),
    },
  },
};

/**
 * Seed test database with initial data
 */
export async function seedTestDatabase(): Promise<void> {
  try {
    // Note: In a real implementation, you would:
    // 1. Create test users in Supabase Auth
    // 2. Insert test data into database tables
    // 3. Set up relationships between entities
    
    console.log('Seeding test database...');
    
    // For now, we'll use mocked Supabase, so no actual seeding needed
    // When using real database, uncomment and implement:
    
    // await supabase.from('users').insert([
    //   testData.users.beneficiary,
    //   testData.users.consultant,
    //   testData.users.admin,
    // ]);
    
    // await supabase.from('assessments').insert([
    //   testData.assessments.draft,
    //   testData.assessments.inProgress,
    //   testData.assessments.completed,
    // ]);
    
    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    throw error;
  }
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase(): Promise<void> {
  try {
    console.log('Cleaning up test database...');
    
    // Note: In a real implementation, you would:
    // 1. Delete all test data
    // 2. Reset sequences/auto-increment
    // 3. Clear caches
    
    // For now, we'll use mocked Supabase, so no actual cleanup needed
    // When using real database, uncomment and implement:
    
    // await supabase.from('notifications').delete().like('id', 'test-%');
    // await supabase.from('conversations').delete().like('id', 'test-%');
    // await supabase.from('assessments').delete().like('id', 'test-%');
    // await supabase.from('users').delete().like('id', 'test-%');
    
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Reset test database to initial state
 */
export async function resetTestDatabase(): Promise<void> {
  await cleanupTestDatabase();
  await seedTestDatabase();
}

/**
 * Create a test user
 */
export async function createTestUser(userData: Partial<typeof testData.users.beneficiary>) {
  const user = {
    ...testData.users.beneficiary,
    ...userData,
    id: userData.id || `test-user-${Date.now()}`,
  };
  
  // In real implementation:
  // await supabase.from('users').insert(user);
  
  return user;
}

/**
 * Create a test assessment
 */
export async function createTestAssessment(assessmentData: Partial<typeof testData.assessments.draft>) {
  const assessment = {
    ...testData.assessments.draft,
    ...assessmentData,
    id: assessmentData.id || `test-assessment-${Date.now()}`,
  };
  
  // In real implementation:
  // await supabase.from('assessments').insert(assessment);
  
  return assessment;
}

/**
 * Create a test conversation
 */
export async function createTestConversation(conversationData: Partial<typeof testData.conversations.active>) {
  const conversation = {
    ...testData.conversations.active,
    ...conversationData,
    id: conversationData.id || `test-conversation-${Date.now()}`,
  };
  
  // In real implementation:
  // await supabase.from('conversations').insert(conversation);
  
  return conversation;
}

/**
 * Delete a test entity by ID pattern
 */
export async function deleteTestEntity(table: string, idPattern: string): Promise<void> {
  // In real implementation:
  // await supabase.from(table).delete().like('id', idPattern);
  console.log(`Deleted test entities from ${table} matching ${idPattern}`);
}

/**
 * Test database lifecycle manager
 */
export class TestDatabaseManager {
  private isSeeded: boolean = false;

  async setup(): Promise<void> {
    if (this.isSeeded) {
      console.warn('Test database already seeded');
      return;
    }
    await seedTestDatabase();
    this.isSeeded = true;
  }

  async teardown(): Promise<void> {
    if (!this.isSeeded) {
      console.warn('Test database not seeded');
      return;
    }
    await cleanupTestDatabase();
    this.isSeeded = false;
  }

  async reset(): Promise<void> {
    await resetTestDatabase();
    this.isSeeded = true;
  }
}

// Global test database instance
let globalTestDatabase: TestDatabaseManager | null = null;

/**
 * Get or create global test database manager
 */
export function getGlobalTestDatabase(): TestDatabaseManager {
  if (!globalTestDatabase) {
    globalTestDatabase = new TestDatabaseManager();
  }
  return globalTestDatabase;
}

/**
 * Setup function for beforeAll
 */
export async function setupTestDatabase(): Promise<TestDatabaseManager> {
  const db = getGlobalTestDatabase();
  await db.setup();
  return db;
}

/**
 * Teardown function for afterAll
 */
export async function teardownTestDatabase(): Promise<void> {
  const db = getGlobalTestDatabase();
  await db.teardown();
}

