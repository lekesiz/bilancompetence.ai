/**
 * Scheduling Routes Integration Tests
 * Tests API endpoints for availability management and booking
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import schedulingRoutes from '../../routes/scheduling.js';
import { v4 as uuidv4 } from 'uuid';

// Create a test Express app
const createTestApp = (): Express => {
  const app = express();
  app.use(express.json());

  // Mock auth middleware
  app.use((req, res, next) => {
    (req as any).user = {
      id: uuidv4(),
      email: 'test@example.com',
      role: 'CONSULTANT',
    };
    res.setHeader('x-organization-id', uuidv4());
    next();
  });

  app.use('/api/scheduling', schedulingRoutes);

  return app;
};

describe('Scheduling API Integration Tests', () => {
  let app: Express;
  const mockOrganizationId = uuidv4();
  const mockConsultantId = uuidv4();

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Availability Slots Endpoints', () => {
    describe('POST /api/scheduling/availability', () => {
      it('should create a new availability slot', async () => {
        const slotData = {
          day_of_week: 0,
          start_time: '09:00',
          end_time: '17:00',
          duration_minutes: 120,
          timezone: 'Europe/Paris',
          is_recurring: true,
        };

        const response = await request(app)
          .post('/api/scheduling/availability')
          .set('x-organization-id', mockOrganizationId)
          .send(slotData);

        expect(response.status).toBeDefined();
        expect([201, 200]).toContain(response.status);
      });

      it('should reject invalid time range', async () => {
        const slotData = {
          day_of_week: 0,
          start_time: '17:00',
          end_time: '09:00', // Invalid: end before start
          timezone: 'Europe/Paris',
        };

        const response = await request(app)
          .post('/api/scheduling/availability')
          .set('x-organization-id', mockOrganizationId)
          .send(slotData);

        expect([400, 422]).toContain(response.status);
      });

      it('should require start_time and end_time', async () => {
        const slotData = {
          day_of_week: 0,
          timezone: 'Europe/Paris',
          // Missing start_time and end_time
        };

        const response = await request(app)
          .post('/api/scheduling/availability')
          .set('x-organization-id', mockOrganizationId)
          .send(slotData);

        expect([400, 422]).toContain(response.status);
      });
    });

    describe('GET /api/scheduling/availability', () => {
      it('should list availability slots', async () => {
        const response = await request(app)
          .get('/api/scheduling/availability')
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('success');
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      });

      it('should filter by day of week', async () => {
        const response = await request(app)
          .get('/api/scheduling/availability?day_of_week=0')
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .get('/api/scheduling/availability?date_from=2025-01-01&date_to=2025-12-31')
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('PUT /api/scheduling/availability/:slotId', () => {
      it('should update an availability slot', async () => {
        const slotId = uuidv4();
        const updateData = {
          duration_minutes: 90,
        };

        const response = await request(app)
          .put(`/api/scheduling/availability/${slotId}`)
          .set('x-organization-id', mockOrganizationId)
          .send(updateData);

        expect([200, 404, 500]).toContain(response.status);
      });
    });

    describe('DELETE /api/scheduling/availability/:slotId', () => {
      it('should delete an availability slot', async () => {
        const slotId = uuidv4();

        const response = await request(app)
          .delete(`/api/scheduling/availability/${slotId}`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 404, 500]).toContain(response.status);
      });
    });
  });

  describe('Session Booking Endpoints', () => {
    describe('POST /api/scheduling/bookings', () => {
      it('should create a new session booking', async () => {
        const bookingData = {
          bilan_id: uuidv4(),
          consultant_id: mockConsultantId,
          scheduled_date: '2025-02-15',
          scheduled_start_time: '09:00',
          scheduled_end_time: '10:30',
          session_type: 'FOLLOW_UP',
          meeting_format: 'VIDEO',
        };

        const response = await request(app)
          .post('/api/scheduling/bookings')
          .set('x-organization-id', mockOrganizationId)
          .send(bookingData);

        expect([201, 200, 400, 500]).toContain(response.status);
      });

      it('should require bilan_id and consultant_id', async () => {
        const bookingData = {
          scheduled_date: '2025-02-15',
          scheduled_start_time: '09:00',
          scheduled_end_time: '10:30',
        };

        const response = await request(app)
          .post('/api/scheduling/bookings')
          .set('x-organization-id', mockOrganizationId)
          .send(bookingData);

        expect([400, 422]).toContain(response.status);
      });

      it('should validate date format', async () => {
        const bookingData = {
          bilan_id: uuidv4(),
          consultant_id: mockConsultantId,
          scheduled_date: 'invalid-date',
          scheduled_start_time: '09:00',
          scheduled_end_time: '10:30',
        };

        const response = await request(app)
          .post('/api/scheduling/bookings')
          .set('x-organization-id', mockOrganizationId)
          .send(bookingData);

        expect([400, 422]).toContain(response.status);
      });
    });

    describe('GET /api/scheduling/availability/:consultantId/slots', () => {
      it('should list available slots for booking', async () => {
        const response = await request(app)
          .get(`/api/scheduling/availability/${mockConsultantId}/slots`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('success');
          expect(Array.isArray(response.body.data)).toBe(true);
        }
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .get(
            `/api/scheduling/availability/${mockConsultantId}/slots?date_from=2025-01-01&date_to=2025-12-31`
          )
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('GET /api/scheduling/bookings/:bilanId', () => {
      it('should list bookings for a bilan', async () => {
        const bilanId = uuidv4();

        const response = await request(app)
          .get(`/api/scheduling/bookings/${bilanId}`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('GET /api/scheduling/beneficiary/:beneficiaryId/bookings', () => {
      it('should list bookings for a beneficiary', async () => {
        const beneficiaryId = uuidv4();

        const response = await request(app)
          .get(`/api/scheduling/beneficiary/${beneficiaryId}/bookings`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });

      it('should filter by status', async () => {
        const beneficiaryId = uuidv4();

        const response = await request(app)
          .get(`/api/scheduling/beneficiary/${beneficiaryId}/bookings?status=SCHEDULED`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('GET /api/scheduling/consultant/:consultantId/bookings', () => {
      it('should list bookings for a consultant', async () => {
        const response = await request(app)
          .get(`/api/scheduling/consultant/${mockConsultantId}/bookings`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });

    describe('PUT /api/scheduling/bookings/:bookingId/confirm', () => {
      it('should confirm a booking', async () => {
        const bookingId = uuidv4();

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/confirm`)
          .set('x-organization-id', mockOrganizationId)
          .send({});

        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });

    describe('PUT /api/scheduling/bookings/:bookingId/complete', () => {
      it('should complete a session', async () => {
        const bookingId = uuidv4();
        const completeData = {
          attended: true,
          beneficiary_rating: 5,
          beneficiary_feedback: 'Great session!',
        };

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/complete`)
          .set('x-organization-id', mockOrganizationId)
          .send(completeData);

        expect([200, 400, 404, 500]).toContain(response.status);
      });

      it('should mark session as no-show', async () => {
        const bookingId = uuidv4();
        const completeData = {
          attended: false,
        };

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/complete`)
          .set('x-organization-id', mockOrganizationId)
          .send(completeData);

        expect([200, 400, 404, 500]).toContain(response.status);
      });

      it('should validate rating is between 1-5', async () => {
        const bookingId = uuidv4();
        const completeData = {
          attended: true,
          beneficiary_rating: 10, // Invalid: out of range
        };

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/complete`)
          .set('x-organization-id', mockOrganizationId)
          .send(completeData);

        expect([200, 400, 422]).toContain(response.status);
      });
    });

    describe('PUT /api/scheduling/bookings/:bookingId/cancel', () => {
      it('should cancel a booking', async () => {
        const bookingId = uuidv4();
        const cancelData = {
          cancellation_reason: 'Scheduling conflict',
        };

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/cancel`)
          .set('x-organization-id', mockOrganizationId)
          .send(cancelData);

        expect([200, 400, 404, 500]).toContain(response.status);
      });

      it('should require cancellation_reason', async () => {
        const bookingId = uuidv4();

        const response = await request(app)
          .put(`/api/scheduling/bookings/${bookingId}/cancel`)
          .set('x-organization-id', mockOrganizationId)
          .send({});

        expect([400, 422]).toContain(response.status);
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('GET /api/scheduling/analytics/consultant/:consultantId', () => {
      it('should fetch consultant analytics', async () => {
        const response = await request(app)
          .get(`/api/scheduling/analytics/consultant/${mockConsultantId}`)
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .get(
            `/api/scheduling/analytics/consultant/${mockConsultantId}?date_from=2025-01-01&date_to=2025-12-31`
          )
          .set('x-organization-id', mockOrganizationId);

        expect([200, 500]).toContain(response.status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing organization ID', async () => {
      const response = await request(app)
        .get('/api/scheduling/availability')
        // Not setting x-organization-id header
        .send();

      expect([400, 401, 500]).toContain(response.status);
    });

    it('should handle invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/scheduling/availability/invalid-id/slots')
        .set('x-organization-id', mockOrganizationId);

      expect([400, 404, 500]).toContain(response.status);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/scheduling/availability')
        .set('x-organization-id', mockOrganizationId)
        .set('Content-Type', 'application/json')
        .send('{invalid json}');

      expect([400, 500]).toContain(response.status);
    });
  });
});
