import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Increase timeout for all tests
jest.setTimeout(30000);

// Enhanced Supabase mock with realistic responses
const createMockSupabaseQuery = () => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: '123', name: 'Test' }, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: { id: '123', name: 'Test' }, error: null }),
    // Default to returning successful response
    then: jest.fn((resolve) => {
      resolve({ data: [{ id: '123', name: 'Test' }], error: null });
      return Promise.resolve({ data: [{ id: '123', name: 'Test' }], error: null });
    }),
  };
  return query;
};

// Mock Supabase client to avoid real database connections during tests
jest.mock('../services/supabaseService', () => ({
  supabase: {
    from: jest.fn(() => createMockSupabaseQuery()),
    auth: {
      signIn: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: '123' }, session: {} }, error: null }),
      signUp: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: '123' }, session: {} }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      refreshSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.pdf' }, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://example.com/test.pdf' } }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  },
};
