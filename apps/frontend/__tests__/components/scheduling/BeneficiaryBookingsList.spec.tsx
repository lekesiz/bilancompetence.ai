/**
 * BeneficiaryBookingsList Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeneficiaryBookingsList from '@/components/scheduling/BeneficiaryBookingsList';
import { useBeneficiaryBookings, useCancelBooking } from '@/hooks/useScheduling';
import toast from 'react-hot-toast';

jest.mock('@/hooks/useScheduling');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('BeneficiaryBookingsList', () => {
  const mockBeneficiaryId = 'beneficiary-123';
  const mockBilanId = 'bilan-456';

  const mockBooking = {
    id: 'booking-1',
    bilan_id: mockBilanId,
    consultant_id: 'consultant-789',
    beneficiary_id: mockBeneficiaryId,
    organization_id: 'org-123',
    scheduled_date: '2025-01-20',
    scheduled_start_time: '09:00',
    scheduled_end_time: '10:00',
    duration_minutes: 60,
    timezone: 'UTC',
    session_type: 'INITIAL_MEETING',
    meeting_format: 'VIDEO',
    meeting_location: undefined,
    meeting_link: 'https://meet.google.com/test',
    beneficiary_notes: 'Test notes',
    consultant_notes: undefined,
    preparation_materials: undefined,
    status: 'CONFIRMED' as const,
    attended: undefined,
    cancellation_reason: undefined,
    beneficiary_rating: undefined,
    beneficiary_feedback: undefined,
    bilan_phase_at_booking: undefined,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    confirmed_at: '2025-01-10T01:00:00Z',
    completed_at: undefined,
    cancelled_at: undefined,
    deleted_at: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (toast.error as jest.Mock).mockImplementation(() => {});
    (toast.success as jest.Mock).mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();
    });

    it('should display booking cards when data is loaded', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('consultant-789')).toBeInTheDocument();
      expect(screen.getByText('INITIAL_MEETING')).toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });

    it('should show error state when fetch fails', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: new Error('Failed to load'),
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('Failed to load bookings')).toBeInTheDocument();
      expect(screen.getByText('Please try again later')).toBeInTheDocument();
    });

    it('should show empty state when no bookings', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('No Bookings')).toBeInTheDocument();
      expect(screen.getByText('You have no bookings yet')).toBeInTheDocument();
    });

    it('should show specific empty state when filtering by status', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
          status="COMPLETED"
        />
      );

      expect(screen.getByText('No Bookings')).toBeInTheDocument();
      expect(screen.getByText('You have no completed bookings')).toBeInTheDocument();
    });
  });

  describe('Booking Card Display', () => {
    it('should display all booking details', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('consultant-789')).toBeInTheDocument();
      expect(screen.getByText('INITIAL_MEETING')).toBeInTheDocument();
      expect(screen.getByText(/09:00 - 10:00/)).toBeInTheDocument();
      expect(screen.getByText(/60 min/)).toBeInTheDocument();
      expect(screen.getByText('VIDEO')).toBeInTheDocument();
    });

    it('should display beneficiary notes when present', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText(/Your Notes:/)).toBeInTheDocument();
      expect(screen.getByText('Test notes')).toBeInTheDocument();
    });

    it('should display meeting link for video calls', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const meetingLink = screen.getByText('Join Link');
      expect(meetingLink).toBeInTheDocument();
      expect(meetingLink).toHaveAttribute('href', 'https://meet.google.com/test');
    });

    it('should display meeting location for in-person bookings', () => {
      const inPersonBooking = {
        ...mockBooking,
        meeting_format: 'IN_PERSON' as const,
        meeting_location: 'Office Building A, Room 301',
        meeting_link: undefined,
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [inPersonBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('Office Building A, Room 301')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should apply correct color class for CONFIRMED status', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      const { container } = render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const statusBadge = container.querySelector('.bg-green-100');
      expect(statusBadge).toBeInTheDocument();
    });

    it('should apply correct color class for SCHEDULED status', () => {
      const scheduledBooking = {
        ...mockBooking,
        status: 'SCHEDULED' as const,
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [scheduledBooking],
        isLoading: false,
        error: null,
      });

      const { container } = render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const statusBadge = container.querySelector('.bg-blue-100');
      expect(statusBadge).toBeInTheDocument();
    });
  });

  describe('Cancellation', () => {
    it('should show cancel button for upcoming bookings', () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByRole('button', { name: /Cancel Booking/ })).toBeInTheDocument();
    });

    it('should show cancellation form when cancel button is clicked', async () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });
      (useCancelBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/ });
      fireEvent.click(cancelButton);

      expect(screen.getByPlaceholderText(/Please tell us why/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Keep Booking/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm Cancel/ })).toBeInTheDocument();
    });

    it('should hide cancellation form when keep booking is clicked', async () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });
      (useCancelBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/ });
      fireEvent.click(cancelButton);

      const keepButton = screen.getByRole('button', { name: /Keep Booking/ });
      fireEvent.click(keepButton);

      expect(screen.queryByPlaceholderText(/Please tell us why/)).not.toBeInTheDocument();
    });

    it('should show error when confirming cancel without reason', async () => {
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });
      (useCancelBooking as jest.Mock).mockReturnValue({
        mutateAsync: jest.fn(),
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/ });
      fireEvent.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Cancel/ });
      expect(confirmButton).toBeDisabled();
    });

    it('should call cancel mutation with reason', async () => {
      const mockCancelMutation = jest.fn().mockResolvedValue({});
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });
      (useCancelBooking as jest.Mock).mockReturnValue({
        mutateAsync: mockCancelMutation,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/ });
      fireEvent.click(cancelButton);

      const reasonField = screen.getByPlaceholderText(/Please tell us why/);
      await userEvent.type(reasonField, 'Schedule conflict');

      const confirmButton = screen.getByRole('button', { name: /Confirm Cancel/ });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockCancelMutation).toHaveBeenCalled();
      });
    });

    it('should show success toast on successful cancellation', async () => {
      const mockCancelMutation = jest.fn().mockResolvedValue({});
      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [mockBooking],
        isLoading: false,
        error: null,
      });
      (useCancelBooking as jest.Mock).mockReturnValue({
        mutateAsync: mockCancelMutation,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel Booking/ });
      fireEvent.click(cancelButton);

      const reasonField = screen.getByPlaceholderText(/Please tell us why/);
      await userEvent.type(reasonField, 'Schedule conflict');

      const confirmButton = screen.getByRole('button', { name: /Confirm Cancel/ });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Booking cancelled successfully');
      });
    });

    it('should not show cancel button for completed bookings', () => {
      const completedBooking = {
        ...mockBooking,
        status: 'COMPLETED' as const,
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [completedBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.queryByRole('button', { name: /Cancel Booking/ })).not.toBeInTheDocument();
      expect(screen.getByText('Session completed')).toBeInTheDocument();
    });
  });

  describe('Rating Display', () => {
    it('should display rating when booking is completed and rated', () => {
      const ratedBooking = {
        ...mockBooking,
        status: 'COMPLETED' as const,
        beneficiary_rating: 4,
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [ratedBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText('(4/5)')).toBeInTheDocument();
    });

    it('should display feedback when present', () => {
      const feedbackBooking = {
        ...mockBooking,
        status: 'COMPLETED' as const,
        beneficiary_rating: 5,
        beneficiary_feedback: 'Great session!',
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [feedbackBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText(/Your Feedback:/)).toBeInTheDocument();
      expect(screen.getByText('Great session!')).toBeInTheDocument();
    });
  });

  describe('Cancellation Reason Display', () => {
    it('should display cancellation reason for cancelled bookings', () => {
      const cancelledBooking = {
        ...mockBooking,
        status: 'CANCELLED' as const,
        cancellation_reason: 'Schedule conflict',
      };

      (useBeneficiaryBookings as jest.Mock).mockReturnValue({
        data: [cancelledBooking],
        isLoading: false,
        error: null,
      });

      render(
        <BeneficiaryBookingsList
          beneficiaryId={mockBeneficiaryId}
          bilanId={mockBilanId}
        />
      );

      expect(screen.getByText(/Cancellation Reason:/)).toBeInTheDocument();
      expect(screen.getByText('Schedule conflict')).toBeInTheDocument();
    });
  });
});
