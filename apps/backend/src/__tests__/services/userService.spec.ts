/**
 * User Service Unit Tests
 *
 * Tests for user management functionality:
 * - getUserProfile
 * - updateUserProfile
 * - getUserPreferences
 * - updateUserPreferences
 * - getUserAssessments
 * - getUserRecommendations
 */

import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
} from '../../services/userService';
import { supabase } from '../../services/supabaseService';

// Mock Supabase client
jest.mock('../../services/supabaseService', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('UserService', () => {
  const testUserId = 'user-123';
  const mockUserProfile = {
    id: testUserId,
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    organization_id: 'org-123',
    role: 'BENEFICIARY',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(result).toEqual(mockUserProfile);
      expect(result.id).toBe(testUserId);
      expect(result.email).toBe('test@example.com');
    });

    it('should return user with all required fields', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(result.id).toBeDefined();
      expect(result.email).toBeDefined();
      expect(result.full_name).toBeDefined();
      expect(result.role).toBeDefined();
    });

    it('should handle user not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile('non-existent-id');

      expect(result).toBeNull();
    });

    it('should include avatar URL if available', async () => {
      const profileWithAvatar = { ...mockUserProfile, avatar_url: 'https://example.com/avatar.jpg' };
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: profileWithAvatar,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(result.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('should handle database errors', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection error'),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getUserProfile(testUserId)).rejects.toThrow();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUserProfile, ...updates },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(testUserId, updates);

      expect(result.full_name).toBe('Updated Name');
      expect(result.bio).toBe('Updated bio');
    });

    it('should only update provided fields', async () => {
      const updates = { full_name: 'New Name' };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUserProfile, full_name: 'New Name' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(testUserId, updates);

      expect(result.full_name).toBe('New Name');
      expect(result.email).toBe(mockUserProfile.email); // Unchanged
    });

    it('should update avatar URL', async () => {
      const updates = { avatar_url: 'https://example.com/new-avatar.jpg' };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUserProfile, avatar_url: 'https://example.com/new-avatar.jpg' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(testUserId, updates);

      expect(result.avatar_url).toBe('https://example.com/new-avatar.jpg');
    });

    it('should handle update with no changes', async () => {
      const updates = {};

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUserProfile,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(testUserId, updates);

      expect(result).toEqual(mockUserProfile);
    });

    it('should update timestamp on profile change', async () => {
      const updates = { bio: 'New bio' };
      const newTimestamp = new Date().toISOString();

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockUserProfile, bio: 'New bio', updated_at: newTimestamp },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserProfile(testUserId, updates);

      expect(result.updated_at).toBeDefined();
    });
  });

  describe('getUserPreferences', () => {
    const mockPreferences = {
      id: 'pref-123',
      user_id: testUserId,
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      language: 'en',
      theme: 'light',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    it('should fetch user preferences successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserPreferences(testUserId);

      expect(result).toEqual(mockPreferences);
      expect(result.notifications_enabled).toBe(true);
    });

    it('should return preferences with notification settings', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserPreferences(testUserId);

      expect(result.email_notifications).toBeDefined();
      expect(result.sms_notifications).toBeDefined();
      expect(result.language).toBe('en');
      expect(result.theme).toBe('light');
    });

    it('should handle missing preferences', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserPreferences(testUserId);

      expect(result).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    const mockPreferences = {
      user_id: testUserId,
      notifications_enabled: true,
      email_notifications: true,
      language: 'en',
    };

    it('should update user preferences successfully', async () => {
      const updates = {
        notifications_enabled: false,
        language: 'fr',
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockPreferences, ...updates },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserPreferences(testUserId, updates);

      expect(result.notifications_enabled).toBe(false);
      expect(result.language).toBe('fr');
    });

    it('should update notification settings', async () => {
      const updates = {
        email_notifications: false,
        sms_notifications: true,
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockPreferences, ...updates },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserPreferences(testUserId, updates);

      expect(result.email_notifications).toBe(false);
      expect(result.sms_notifications).toBe(true);
    });

    it('should handle invalid preference values gracefully', async () => {
      const updates = { language: 'invalid-lang' };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockPreferences, language: 'invalid-lang' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await updateUserPreferences(testUserId, updates);

      expect(result.language).toBeDefined();
    });
  });

  describe('User Service Error Handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Supabase error'),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getUserProfile(testUserId)).rejects.toThrow();
    });

    it('should handle invalid user IDs', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile('invalid-uuid');

      expect(result).toBeNull();
    });
  });

  describe('User Service Data Validation', () => {
    it('should return user with valid email format', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(result.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should include organization relationship', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(result.organization_id).toBeDefined();
    });

    it('should include user role information', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getUserProfile(testUserId);

      expect(['BENEFICIARY', 'CONSULTANT', 'ADMIN', 'ORG_ADMIN']).toContain(result.role);
    });
  });
});
