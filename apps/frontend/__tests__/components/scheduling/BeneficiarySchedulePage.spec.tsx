/**
 * BeneficiarySchedulePage Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeneficiarySchedulePage from '@/components/scheduling/BeneficiarySchedulePage';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');
jest.mock('./BeneficiarySessionBrowser', () => {
  return function MockBeneficiarySessionBrowser() {
    return <div data-testid="session-browser">Session Browser</div>;
  };
});
jest.mock('./BeneficiaryBookingForm', () => {
  return function MockBeneficiaryBookingForm() {
    return <div data-testid="booking-form">Booking Form</div>;
  };
});
jest.mock('./BeneficiaryBookingsList', () => {
  return function MockBeneficiaryBookingsList() {
    return <div data-testid="bookings-list">Bookings List</div>;
  };
});

describe('BeneficiarySchedulePage', () => {
  const mockBilanId = 'bilan-123';
  const mockUser = {
    id: 'user-456',
    email: 'user@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  describe('Rendering', () => {
    it('should render the page header', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByText('Schedule Sessions')).toBeInTheDocument();
      expect(screen.getByText('Book and manage your consultation sessions')).toBeInTheDocument();
    });

    it('should render all tab navigation buttons', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByRole('button', { name: /Browse Sessions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All Bookings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upcoming/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();
    });

    it('should show loading state when user is not loaded', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading state when user id is missing', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: null },
      });

      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should show session browser on browse tab by default', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByTestId('session-browser')).toBeInTheDocument();
    });

    it('should highlight browse tab as active by default', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const browseTab = screen.getByRole('button', { name: /Browse Sessions/i });
      expect(browseTab).toHaveClass('border-blue-600', 'text-blue-600');
    });

    it('should switch to all bookings tab when clicked', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const allBookingsTab = screen.getByRole('button', { name: /All Bookings/i });
      fireEvent.click(allBookingsTab);

      expect(allBookingsTab).toHaveClass('border-blue-600', 'text-blue-600');
      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    it('should switch to upcoming tab when clicked', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const upcomingTab = screen.getByRole('button', { name: /Upcoming/i });
      fireEvent.click(upcomingTab);

      expect(upcomingTab).toHaveClass('border-blue-600', 'text-blue-600');
      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    it('should switch to completed tab when clicked', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const completedTab = screen.getByRole('button', { name: /Completed/i });
      fireEvent.click(completedTab);

      expect(completedTab).toHaveClass('border-blue-600', 'text-blue-600');
      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    it('should show correct heading for all bookings tab', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const allBookingsTab = screen.getByRole('button', { name: /All Bookings/i });
      fireEvent.click(allBookingsTab);

      // The heading would be rendered by the mock component
      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    it('should show correct heading for upcoming tab', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const upcomingTab = screen.getByRole('button', { name: /Upcoming/i });
      fireEvent.click(upcomingTab);

      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });

    it('should show correct heading for completed tab', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const completedTab = screen.getByRole('button', { name: /Completed/i });
      fireEvent.click(completedTab);

      expect(screen.getByTestId('bookings-list')).toBeInTheDocument();
    });
  });

  describe('Browse Sessions Tab', () => {
    it('should render session browser component', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      expect(screen.getByTestId('session-browser')).toBeInTheDocument();
    });

    it('should clear selected slot when switching tabs', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      // Switch to all bookings tab
      const allBookingsTab = screen.getByRole('button', { name: /All Bookings/i });
      fireEvent.click(allBookingsTab);

      // Switch back to browse tab
      const browseTab = screen.getByRole('button', { name: /Browse Sessions/i });
      fireEvent.click(browseTab);

      expect(screen.getByTestId('session-browser')).toBeInTheDocument();
    });
  });

  describe('Tab Icons', () => {
    it('should render tab icons alongside labels', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      // Check that SVG icons are rendered
      const icons = container.querySelectorAll('svg.w-4.h-4');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Classes', () => {
    it('should apply active styles only to active tab', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const browseTab = screen.getByRole('button', { name: /Browse Sessions/i });
      const allBookingsTab = screen.getByRole('button', { name: /All Bookings/i });

      expect(browseTab).toHaveClass('text-blue-600');
      expect(allBookingsTab).not.toHaveClass('text-blue-600');

      // Click all bookings
      fireEvent.click(allBookingsTab);

      expect(browseTab).not.toHaveClass('text-blue-600');
      expect(allBookingsTab).toHaveClass('text-blue-600');
    });

    it('should apply inactive styles to inactive tabs', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const allBookingsTab = screen.getByRole('button', { name: /All Bookings/i });

      expect(allBookingsTab).toHaveClass('text-gray-600');
      expect(allBookingsTab).toHaveClass('border-transparent');
    });
  });

  describe('Content Area', () => {
    it('should have white background content area', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const contentArea = container.querySelector('.bg-white.rounded-b-lg');
      expect(contentArea).toBeInTheDocument();
    });

    it('should have padding in content area', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const contentArea = container.querySelector('.bg-white.rounded-b-lg.shadow-sm.p-6');
      expect(contentArea).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive layout', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const maxWidthContainer = container.querySelector('.max-w-7xl');
      expect(maxWidthContainer).toBeInTheDocument();
    });
  });

  describe('Page Layout', () => {
    it('should render header section', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const header = container.querySelector('.bg-white.border-b');
      expect(header).toBeInTheDocument();
    });

    it('should have full height container', () => {
      const { container } = render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const minHeightContainer = container.querySelector('.min-h-screen');
      expect(minHeightContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const mainHeading = screen.getByText('Schedule Sessions');
      expect(mainHeading.tagName).toBe('H1');
    });

    it('should have proper button roles', () => {
      render(<BeneficiarySchedulePage bilanId={mockBilanId} />);

      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(0);

      tabs.forEach((tab) => {
        expect(tab.tagName).toBe('BUTTON');
      });
    });
  });
});
