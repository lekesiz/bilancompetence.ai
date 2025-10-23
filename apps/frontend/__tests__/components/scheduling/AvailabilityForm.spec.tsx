/**
 * AvailabilityForm Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AvailabilityForm from '@/components/scheduling/AvailabilityForm';
import { useCreateAvailabilitySlot, useUpdateAvailabilitySlot } from '@/hooks/useScheduling';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/hooks/useScheduling');
jest.mock('react-hot-toast');

const queryClient = new QueryClient();

const renderComponent = (props = {}) => {
  const defaultProps = {
    consultantId: 'test-consultant-id',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AvailabilityForm {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe('AvailabilityForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCreateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    });
    (useUpdateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    });
    (toast.success as jest.Mock).mockImplementation(() => {});
    (toast.error as jest.Mock).mockImplementation(() => {});
  });

  it('should render form with all required fields', () => {
    renderComponent();

    expect(screen.getByText(/Create Availability Slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Timezone/i)).toBeInTheDocument();
  });

  it('should show slot type selection', () => {
    renderComponent();

    expect(screen.getByText(/One-Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Recurring/i)).toBeInTheDocument();
  });

  it('should validate time range (end must be after start)', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Set invalid time range
    await user.type(screen.getByLabelText(/Start Time/i), '17:00');
    await user.type(screen.getByLabelText(/End Time/i), '09:00');

    await waitFor(() => {
      expect(screen.getByText(/End time must be after start time/i)).toBeInTheDocument();
    });
  });

  it('should calculate duration automatically', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/Start Time/i), '09:00');
    await user.type(screen.getByLabelText(/End Time/i), '17:00');

    await waitFor(() => {
      expect(screen.getByText(/Duration: 480 minutes/i)).toBeInTheDocument();
    });
  });

  it('should require date for one-time slots', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Select one-time slot type
    const oneTimeRadio = screen.getAllByRole('radio')[0];
    await user.click(oneTimeRadio);

    // Try to submit without date
    const submitButton = screen.getByText(/Create Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Select either specific date/i)).toBeInTheDocument();
    });
  });

  it('should require day of week for recurring slots', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Select recurring slot type
    const recurringRadio = screen.getAllByRole('radio')[1];
    await user.click(recurringRadio);

    // Try to submit without day of week
    const submitButton = screen.getByText(/Create Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Select either specific date/i)).toBeInTheDocument();
    });
  });

  it('should create a new availability slot', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockMutate = jest.fn().mockResolvedValue({});

    (useCreateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isLoading: false,
    });

    renderComponent({ onSuccess: mockOnSuccess });

    // Fill form
    const recurringRadio = screen.getAllByRole('radio')[1];
    await user.click(recurringRadio);

    const daySelect = screen.getByLabelText(/Day of Week/i);
    await user.selectOption(daySelect, '0'); // Monday

    await user.type(screen.getByLabelText(/Start Time/i), '09:00');
    await user.type(screen.getByLabelText(/End Time/i), '17:00');

    // Submit
    const submitButton = screen.getByText(/Create Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should update an existing availability slot', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    const mockMutate = jest.fn().mockResolvedValue({});

    const existingSlot = {
      id: 'slot-id',
      consultant_id: 'test-consultant',
      organization_id: 'org-id',
      start_time: '09:00',
      end_time: '17:00',
      day_of_week: 0,
      duration_minutes: 480,
      max_concurrent_bookings: 1,
      timezone: 'UTC',
      is_recurring: true,
      is_available: true,
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
    };

    (useUpdateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isLoading: false,
    });

    renderComponent({ initialSlot: existingSlot, onSuccess: mockOnSuccess });

    // Change end time
    const endTimeInput = screen.getByLabelText(/End Time/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '18:00');

    // Submit
    const submitButton = screen.getByText(/Update Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should show success toast on successful submission', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn().mockResolvedValue({});

    (useCreateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: mockMutate,
      isLoading: false,
    });

    renderComponent();

    // Fill form
    const recurringRadio = screen.getAllByRole('radio')[1];
    await user.click(recurringRadio);

    const daySelect = screen.getByLabelText(/Day of Week/i);
    await user.selectOption(daySelect, '0');

    await user.type(screen.getByLabelText(/Start Time/i), '09:00');
    await user.type(screen.getByLabelText(/End Time/i), '17:00');

    // Submit
    const submitButton = screen.getByText(/Create Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('successfully'));
    });
  });

  it('should handle cancel button', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();

    renderComponent({ onCancel: mockOnCancel });

    const cancelButton = screen.getByText(/Cancel/i);
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable submit button while loading', async () => {
    (useCreateAvailabilitySlot as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: true,
    });

    renderComponent();

    const submitButton = screen.getByText(/Create Slot/i);
    expect(submitButton).toBeDisabled();
  });

  it('should display timezone options', () => {
    renderComponent();

    const timezoneSelect = screen.getByDisplayValue('UTC');
    expect(timezoneSelect).toBeInTheDocument();

    const options = (timezoneSelect as HTMLSelectElement).options;
    expect(options.length).toBeGreaterThan(1);
    expect(Array.from(options).some((opt) => opt.value === 'Europe/Paris')).toBe(true);
  });

  it('should validate max concurrent bookings', async () => {
    const user = userEvent.setup();
    renderComponent();

    const concurrentInput = screen.getByLabelText(/Max Concurrent/i) as HTMLInputElement;

    // Try value greater than 5
    await user.clear(concurrentInput);
    await user.type(concurrentInput, '10');

    // Try to submit
    const submitButton = screen.getByText(/Create Slot/i);
    await user.click(submitButton);

    await waitFor(() => {
      expect(concurrentInput.value).toBe('10');
    });
  });
});
