/**
 * SessionCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionCard from '@/components/scheduling/SessionCard';
import { SessionBooking } from '@/lib/schedulingAPI';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');
jest.mock('date-fns', () => ({
  format: (date: Date, format: string) => {
    if (format === 'EEE, MMM d, yyyy') {
      return 'Mon, Jan 15, 2025';
    }
    return date.toString();
  },
}));

const mockSession: SessionBooking = {
  id: 'booking-id',
  bilan_id: 'bilan-id',
  consultant_id: 'consultant-id',
  beneficiary_id: 'beneficiary-id',
  organization_id: 'org-id',
  scheduled_date: '2025-01-15',
  scheduled_start_time: '09:00',
  scheduled_end_time: '10:30',
  duration_minutes: 90,
  timezone: 'UTC',
  session_type: 'FOLLOW_UP',
  meeting_format: 'VIDEO',
  status: 'SCHEDULED',
  created_at: '2025-01-10T00:00:00Z',
  updated_at: '2025-01-10T00:00:00Z',
};

describe('SessionCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render session details', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText('beneficiary-id')).toBeInTheDocument();
    expect(screen.getByText('FOLLOW_UP')).toBeInTheDocument();
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
  });

  it('should display correct status badge with colors', () => {
    const { rerender } = render(<SessionCard session={mockSession} />);

    const statusBadge = screen.getByText('SCHEDULED');
    expect(statusBadge).toBeInTheDocument();

    // Test different statuses
    const confirmedSession = { ...mockSession, status: 'CONFIRMED' as const };
    rerender(<SessionCard session={confirmedSession} />);

    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });

  it('should display session date and time', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText('Mon, Jan 15, 2025')).toBeInTheDocument();
    expect(screen.getByText(/09:00 - 10:30/)).toBeInTheDocument();
    expect(screen.getByText(/90 min/)).toBeInTheDocument();
  });

  it('should show meeting format icon and details', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText('VIDEO')).toBeInTheDocument();
  });

  it('should display notes when provided', () => {
    const sessionWithNotes = {
      ...mockSession,
      beneficiary_notes: 'Please be ready to discuss progress',
      consultant_notes: 'Prepare assessment report',
    };

    render(<SessionCard session={sessionWithNotes} />);

    expect(screen.getByText('Please be ready to discuss progress')).toBeInTheDocument();
    expect(screen.getByText('Prepare assessment report')).toBeInTheDocument();
  });

  it('should show action button for scheduled sessions in consultant mode', () => {
    render(<SessionCard session={mockSession} consultantMode={true} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should show confirm button in action panel', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={mockSession}
        consultantMode={true}
        onConfirm={mockOnConfirm}
      />
    );

    const actionButton = screen.getByText('Action');
    await user.click(actionButton);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeInTheDocument();

    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('booking-id');
    });
  });

  it('should show complete/no-show buttons for confirmed sessions', async () => {
    const user = userEvent.setup();
    const confirmedSession = { ...mockSession, status: 'CONFIRMED' as const };
    const mockOnComplete = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={confirmedSession}
        consultantMode={true}
        onComplete={mockOnComplete}
      />
    );

    const actionButton = screen.getByText('Complete');
    await user.click(actionButton);

    const completedButton = screen.getByText('Completed');
    expect(completedButton).toBeInTheDocument();

    const noShowButton = screen.getByText('No-Show');
    expect(noShowButton).toBeInTheDocument();
  });

  it('should handle session completion with attendance', async () => {
    const user = userEvent.setup();
    const confirmedSession = { ...mockSession, status: 'CONFIRMED' as const };
    const mockOnComplete = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={confirmedSession}
        consultantMode={true}
        onComplete={mockOnComplete}
      />
    );

    const actionButton = screen.getByText('Complete');
    await user.click(actionButton);

    const completedButton = screen.getByText('Completed');
    await user.click(completedButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('booking-id', true);
    });
  });

  it('should handle session completion as no-show', async () => {
    const user = userEvent.setup();
    const confirmedSession = { ...mockSession, status: 'CONFIRMED' as const };
    const mockOnComplete = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={confirmedSession}
        consultantMode={true}
        onComplete={mockOnComplete}
      />
    );

    const actionButton = screen.getByText('Complete');
    await user.click(actionButton);

    const noShowButton = screen.getByText('No-Show');
    await user.click(noShowButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('booking-id', false);
    });
  });

  it('should show cancel button for upcoming sessions', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn().mockResolvedValue(undefined);

    window.confirm = jest.fn(() => true);
    window.prompt = jest.fn(() => 'Scheduling conflict');

    render(
      <SessionCard
        session={mockSession}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);

    // The component should show action panel
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should show rating interface for completed sessions', async () => {
    const user = userEvent.setup();
    const completedSession = {
      ...mockSession,
      status: 'COMPLETED' as const,
    };
    const mockOnRate = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={completedSession}
        consultantMode={false}
        onRate={mockOnRate}
      />
    );

    const rateButton = screen.getByText(/Rate/i);
    expect(rateButton).toBeInTheDocument();

    await user.click(rateButton);

    // Should show star rating interface
    const stars = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should display beneficiary rating and feedback when available', () => {
    const ratedSession = {
      ...mockSession,
      status: 'COMPLETED' as const,
      beneficiary_rating: 5,
      beneficiary_feedback: 'Excellent session, very helpful!',
    };

    render(<SessionCard session={ratedSession} />);

    expect(screen.getByText(/5\/5/)).toBeInTheDocument();
    expect(screen.getByText('Excellent session, very helpful!')).toBeInTheDocument();
  });

  it('should show cancellation reason when cancelled', () => {
    const cancelledSession = {
      ...mockSession,
      status: 'CANCELLED' as const,
      cancellation_reason: 'Consultant is sick',
    };

    render(<SessionCard session={cancelledSession} />);

    expect(screen.getByText('Consultant is sick')).toBeInTheDocument();
  });

  it('should show meeting link when provided', () => {
    const sessionWithLink = {
      ...mockSession,
      meeting_link: 'https://meet.example.com/abc123',
    };

    render(<SessionCard session={sessionWithLink} />);

    const link = screen.getByText('Join Link');
    expect(link).toHaveAttribute('href', 'https://meet.example.com/abc123');
  });

  it('should show meeting location for in-person sessions', () => {
    const inPersonSession = {
      ...mockSession,
      meeting_format: 'IN_PERSON' as const,
      meeting_location: 'Office Room 301',
    };

    render(<SessionCard session={inPersonSession} />);

    expect(screen.getByText('Office Room 301')).toBeInTheDocument();
  });

  it('should display success toast when action succeeds', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = jest.fn().mockResolvedValue(undefined);

    render(
      <SessionCard
        session={mockSession}
        consultantMode={true}
        onConfirm={mockOnConfirm}
      />
    );

    const actionButton = screen.getByText('Action');
    await user.click(actionButton);

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('should handle errors gracefully', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <SessionCard
        session={mockSession}
        consultantMode={true}
        onConfirm={mockOnConfirm}
      />
    );

    const actionButton = screen.getByText('Action');
    await user.click(actionButton);

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
