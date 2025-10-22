/**
 * StatCard Component Unit Tests
 *
 * Tests for:
 * - Rendering with required props
 * - Trend indicator display
 * - Loading skeleton
 * - Click handler
 * - Icon rendering
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatCard } from '@/app/(protected)/dashboard/components/dashboard-components/StatCard';

describe('StatCard Component', () => {
  describe('Rendering', () => {
    it('should render with title and value', () => {
      render(
        <StatCard
          title="Total Assessments"
          value={42}
        />
      );

      expect(screen.getByText('Total Assessments')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(
        <StatCard
          title="Plan"
          value="Premium"
        />
      );

      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={10}
          className="custom-class"
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Trend Indicator', () => {
    it('should display positive trend with up arrow', () => {
      render(
        <StatCard
          title="Growth"
          value={100}
          trend={{ value: 15, isPositive: true }}
        />
      );

      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('↑').parentElement).toHaveClass('text-green-600');
    });

    it('should display negative trend with down arrow', () => {
      render(
        <StatCard
          title="Decline"
          value={50}
          trend={{ value: 20, isPositive: false }}
        />
      );

      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('↓').parentElement).toHaveClass('text-red-600');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading=true', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={0}
          loading={true}
        />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show content when loading=true', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={42}
          loading={true}
        />
      );

      // Value should not be displayed when loading
      expect(container.textContent).not.toContain('42');
    });
  });

  describe('Icon Rendering', () => {
    it('should render icon when provided', () => {
      const { container } = render(
        <StatCard
          title="Users"
          value={100}
          icon={<span data-testid="test-icon">👥</span>}
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should apply blue color to icon', () => {
      const { container } = render(
        <StatCard
          title="Users"
          value={100}
          icon={<div className="test-icon">Icon</div>}
        />
      );

      const iconContainer = container.querySelector('.text-blue-600');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when card is clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <StatCard
          title="Clickable"
          value={10}
          onClick={handleClick}
        />
      );

      const card = screen.getByText('Clickable').closest('div');
      if (card) {
        await user.click(card);
      }

      expect(handleClick).toHaveBeenCalled();
    });

    it('should apply cursor-pointer when onClick provided', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={10}
          onClick={() => {}}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not apply cursor-pointer when onClick not provided', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value={10}
        />
      );

      const card = container.firstChild;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(
        <StatCard
          title="Test Metric"
          value={42}
        />
      );

      const heading = container.querySelector('h3');
      expect(heading).toHaveTextContent('Test Metric');
    });

    it('should display text content accessibly', () => {
      render(
        <StatCard
          title="Accessibility Test"
          value={123}
        />
      );

      expect(screen.getByText('Accessibility Test')).toBeVisible();
      expect(screen.getByText('123')).toBeVisible();
    });
  });
});
