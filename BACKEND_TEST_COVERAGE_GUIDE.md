# 🧪 Backend Test Coverage Enhancement Guide

**Date:** November 4, 2025
**Current Coverage:** 70%
**Target Coverage:** 85% (+15%)
**Status:** ✅ Guide Created, Templates Ready

---

## 📊 Current Test Status

### Existing Test Files (12):
✅ assessmentService.spec.ts (21,456 lines)
✅ schedulingService.spec.ts (11,718 lines)
✅ pdfService.test.ts (20,650 lines)
✅ webhookHandlers.test.ts
✅ authService.test.ts
✅ authService.spec.ts
✅ emailService.spec.ts
✅ notificationService.spec.ts
✅ supabaseService.spec.ts
✅ userService.spec.ts
✅ wedofService.integration.test.ts
✅ schedulingService.integration.test.ts

### Missing Tests (Priority Services):
❌ aiAnalysisServiceNeon.ts
❌ franceTravailService.ts (31,694 lines - CRITICAL)
❌ stripeService.ts
❌ realtimeService.ts
❌ twoFactorService.ts
❌ resendService.ts
❌ qualioptService.ts
❌ satisfactionSurveyService.ts
❌ documentArchiveService.ts
❌ complianceReportService.ts

---

## 🎯 Strategy

To reach 85% coverage, we need to add tests for:
1. **High-Priority Services** (5 services, ~50% of remaining coverage)
2. **Integration Tests** (2-3 critical flows)
3. **Edge Cases** in existing tests

**Time Investment:** 4-6 hours
**Impact:** +15% coverage (70% → 85%)

---

## 📝 Test Template

### Basic Service Test Structure:

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as ServiceName from '../services/serviceName.js';

// Mock external dependencies
jest.mock('../services/externalService.js');
jest.mock('external-library');

describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('functionName', () => {
    it('should successfully perform main operation', async () => {
      // Arrange
      const input = { /* test data */ };
      const expectedOutput = { /* expected result */ };

      // Act
      const result = await ServiceName.functionName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle invalid input', async () => {
      // Arrange
      const invalidInput = null;

      // Act & Assert
      await expect(ServiceName.functionName(invalidInput))
        .rejects.toThrow('Expected error message');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      // Mock API failure

      // Act
      const result = await ServiceName.functionName({});

      // Assert
      expect(result).toHaveProperty('error');
    });
  });
});
```

---

## 🔥 Priority 1: AI Analysis Service Tests

### File: `src/__tests__/services/aiAnalysisServiceNeon.spec.ts`

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as aiService from '../../services/aiAnalysisServiceNeon.js';
import { pool } from '../../config/database.js';

jest.mock('../../config/database.js');

describe('AI Analysis Service (Neon)', () => {
  const mockAssessmentId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCVAnalysis', () => {
    it('should save CV analysis to database', async () => {
      const cvText = 'Sample CV content...';
      const analysis = {
        competences: ['JavaScript', 'React'],
        experiences: [],
        formations: [],
      };

      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ id: '1', assessment_id: mockAssessmentId }],
      });
      (pool.query as jest.Mock) = mockQuery;

      await aiService.saveCVAnalysis(mockAssessmentId, cvText, analysis);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cv_analyses'),
        expect.arrayContaining([mockAssessmentId])
      );
    });

    it('should handle database errors', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('DB Error'));
      (pool.query as jest.Mock) = mockQuery;

      await expect(
        aiService.saveCVAnalysis(mockAssessmentId, 'text', {})
      ).rejects.toThrow('DB Error');
    });
  });

  describe('saveJobRecommendation', () => {
    it('should save job recommendations', async () => {
      const recommendations = {
        metiers: [{ titre: 'Developer', match_score: 85 }],
      };

      const mockQuery = jest.fn().mockResolvedValue({ rows: [{ id: '1' }] });
      (pool.query as jest.Mock) = mockQuery;

      await aiService.saveJobRecommendation(mockAssessmentId, recommendations);

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('savePersonalityAnalysis', () => {
    it('should save personality analysis', async () => {
      const analysis = {
        traits_dominants: ['Analytical', 'Creative'],
        forces: ['Problem solving'],
      };

      const mockQuery = jest.fn().mockResolvedValue({ rows: [{ id: '1' }] });
      (pool.query as jest.Mock) = mockQuery;

      await aiService.savePersonalityAnalysis(mockAssessmentId, analysis);

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('saveActionPlan', () => {
    it('should save action plan', async () => {
      const actionPlan = {
        objectif_principal: 'Become a developer',
        etapes: [],
      };

      const mockQuery = jest.fn().mockResolvedValue({ rows: [{ id: '1' }] });
      (pool.query as jest.Mock) = mockQuery;

      await aiService.saveActionPlan(mockAssessmentId, actionPlan);

      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
```

**Coverage Impact:** +2-3%

---

## 🚀 Priority 2: France Travail Service Tests

### File: `src/__tests__/services/franceTravailService.spec.ts`

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as ftService from '../../services/franceTravailService.js';

// Mock fetch
global.fetch = jest.fn();

describe('France Travail Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should fetch access token successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test_token_123' }),
      });

      const token = await ftService.getAccessToken();

      expect(token).toBe('test_token_123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('auth'),
        expect.any(Object)
      );
    });

    it('should handle authentication errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(ftService.getAccessToken()).rejects.toThrow();
    });
  });

  describe('searchJobs', () => {
    it('should search jobs with keywords', async () => {
      const mockToken = 'test_token';
      const mockJobs = {
        resultats: [
          { intitule: 'Developer', entreprise: { nom: 'Company' } },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobs,
      });

      const results = await ftService.searchJobs(mockToken, {
        motsCles: 'JavaScript',
      });

      expect(results).toHaveProperty('resultats');
      expect(results.resultats).toHaveLength(1);
    });

    it('should handle API rate limits', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      await expect(
        ftService.searchJobs('token', { motsCles: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('getJobDetails', () => {
    it('should fetch job details by ID', async () => {
      const jobId = '123456';
      const mockJob = {
        id: jobId,
        intitule: 'Full Stack Developer',
        description: 'Job description...',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockJob,
      });

      const job = await ftService.getJobDetails('token', jobId);

      expect(job).toHaveProperty('id', jobId);
      expect(job).toHaveProperty('intitule');
    });
  });
});
```

**Coverage Impact:** +3-4%

---

## 💳 Priority 3: Stripe Service Tests

### File: `src/__tests__/services/stripeService.spec.ts`

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as stripeService from '../../services/stripeService.js';
import Stripe from 'stripe';

jest.mock('stripe');

describe('Stripe Service', () => {
  let mockStripe: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
    };
    (Stripe as any).mockImplementation(() => mockStripe);
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test123',
        client_secret: 'secret_test123',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await stripeService.createPaymentIntent({
        amount: 5000,
        currency: 'eur',
        customerId: 'cus_test',
      });

      expect(result).toHaveProperty('client_secret');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5000,
          currency: 'eur',
        })
      );
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(
        new Error('Stripe API Error')
      );

      await expect(
        stripeService.createPaymentIntent({ amount: 1000, currency: 'eur' })
      ).rejects.toThrow('Stripe API Error');
    });
  });

  describe('createCustomer', () => {
    it('should create Stripe customer', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer);

      const customer = await stripeService.createCustomer({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(customer).toHaveProperty('id');
      expect(mockStripe.customers.create).toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
      };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);

      const subscription = await stripeService.createSubscription({
        customerId: 'cus_test',
        priceId: 'price_test',
      });

      expect(subscription).toHaveProperty('id');
      expect(subscription.status).toBe('active');
    });
  });
});
```

**Coverage Impact:** +2-3%

---

## ⚡ Priority 4: Realtime Service Tests

### File: `src/__tests__/services/realtimeService.spec.ts`

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import RealtimeService from '../../services/realtimeService.js';
import { Server as SocketIOServer } from 'socket.io';

jest.mock('socket.io');

describe('Realtime Service', () => {
  let service: RealtimeService;
  let mockIo: any;

  beforeEach(() => {
    mockIo = {
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    (SocketIOServer as any).mockImplementation(() => mockIo);

    service = new RealtimeService({} as any);
  });

  describe('initialization', () => {
    it('should initialize Socket.IO server', () => {
      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('sendNotification', () => {
    it('should emit notification to specific user', () => {
      const userId = 'user123';
      const notification = {
        type: 'message',
        content: 'Test notification',
      };

      service.sendNotification(userId, notification);

      expect(mockIo.to).toHaveBeenCalledWith(userId);
      expect(mockIo.emit).toHaveBeenCalledWith('notification', notification);
    });
  });

  describe('broadcastUpdate', () => {
    it('should broadcast update to all connected clients', () => {
      const update = { type: 'system', message: 'System update' };

      service.broadcastUpdate(update);

      expect(mockIo.emit).toHaveBeenCalledWith('update', update);
    });
  });
});
```

**Coverage Impact:** +1-2%

---

## 📊 Quick Wins (Existing Tests Enhancement)

### Add Edge Cases to Existing Tests:

1. **assessmentService.spec.ts:**
   - Add tests for concurrent updates
   - Test pagination edge cases
   - Test draft auto-save

2. **schedulingService.spec.ts:**
   - Add timezone handling tests
   - Test double-booking prevention
   - Test reminder scheduling

3. **pdfService.test.ts:**
   - Test large document generation
   - Test special characters handling
   - Test multiple languages

**Coverage Impact:** +3-4%

---

## 🎯 Expected Results

### Coverage Breakdown:

| Component | Current | Target | Tests to Add |
|-----------|---------|--------|--------------|
| Services | 60% | 80% | 5-6 new files |
| Routes | 50% | 70% | Integration tests |
| Utils | 80% | 90% | Edge cases |
| **Overall** | **70%** | **85%** | **+15%** |

### Time Investment:

- AI Service Tests: 30 min
- France Travail Tests: 45 min
- Stripe Service Tests: 30 min
- Realtime Tests: 20 min
- Edge Cases: 1 hour
- Integration Tests: 1 hour
- **Total:** 4 hours

---

## 🚀 Quick Start

### 1. Create Test Files:

```bash
cd apps/backend

# Create missing test files
touch src/__tests__/services/aiAnalysisServiceNeon.spec.ts
touch src/__tests__/services/franceTravailService.spec.ts
touch src/__tests__/services/stripeService.spec.ts
touch src/__tests__/services/realtimeService.spec.ts
```

### 2. Copy Templates:

Use the templates above and customize for your implementation.

### 3. Run Tests:

```bash
npm test                          # Run all tests
npm test -- aiAnalysisService    # Run specific test
npm test -- --coverage            # Generate coverage report
```

### 4. Check Coverage:

```bash
npm test -- --coverage --coverageReporters=text-summary
```

Target: **85% or higher**

---

## 📚 Testing Best Practices

### DO:
✅ Test happy path first
✅ Test error conditions
✅ Mock external dependencies
✅ Use descriptive test names
✅ Test edge cases
✅ Keep tests isolated
✅ Use beforeEach/afterEach

### DON'T:
❌ Test implementation details
❌ Share state between tests
❌ Make real API calls
❌ Ignore flaky tests
❌ Skip edge cases
❌ Write tests after bugs (TDD!)

---

## 🎉 Success Criteria

Tests are complete when:

1. ✅ Coverage >= 85%
2. ✅ All priority services tested
3. ✅ Integration tests pass
4. ✅ No flaky tests
5. ✅ CI/CD passes
6. ✅ Coverage report green

---

**Next Steps:**
1. Create test files
2. Copy templates
3. Customize tests
4. Run coverage
5. Reach 85%! 🎯

---

**Last Updated:** November 4, 2025
**Status:** ✅ Ready for Implementation
**Estimated Time:** 4 hours
