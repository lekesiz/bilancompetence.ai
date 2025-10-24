/**
 * Supabase Mock Helper for Testing
 * Provides mock implementations of Supabase client for unit tests
 */

export interface MockSupabaseClient {
  from: (table: string) => any;
  auth: any;
  storage: any;
}

export const createSupabaseMock = (config?: any): MockSupabaseClient => {
  return {
    from: (table: string) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      download: jest.fn(),
    },
  };
};

export const createFullSupabaseMock = (data?: any): MockSupabaseClient => {
  return createSupabaseMock(data);
};

export const mockDataBuilders = {
  user: (overrides?: any) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'BENEFICIARY',
    ...overrides,
  }),
  assessment: (overrides?: any) => ({
    id: 'test-assessment-id',
    user_id: 'test-user-id',
    status: 'IN_PROGRESS',
    ...overrides,
  }),
  sessionBooking: (overrides?: any) => ({
    id: 'test-booking-id',
    user_id: 'test-user-id',
    consultant_id: 'test-consultant-id',
    status: 'CONFIRMED',
    ...overrides,
  }),
  assessmentAnswer: (overrides?: any) => ({
    id: 'test-answer-id',
    assessment_id: 'test-assessment-id',
    question_id: 'test-question-id',
    answer_text: 'Test answer',
    ...overrides,
  }),
  assessmentDraft: (overrides?: any) => ({
    id: 'test-draft-id',
    assessment_id: 'test-assessment-id',
    step_number: 1,
    step_data: {},
    ...overrides,
  }),
};

