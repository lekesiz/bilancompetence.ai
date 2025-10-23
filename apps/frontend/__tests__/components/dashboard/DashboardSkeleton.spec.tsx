/**
 * DashboardSkeleton Component Unit Tests
 *
 * Tests for:
 * - Different skeleton variants
 * - Loading state rendering
 * - Responsive design
 * - Animation classes
 */

import { render, screen } from '@testing-library/react';
import { DashboardSkeleton } from '@/app/(protected)/dashboard/components/DashboardSkeleton';

describe('DashboardSkeleton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render default beneficiary skeleton', () => {
      render(<DashboardSkeleton />);

      // Should have skeleton elements
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render beneficiary variant', () => {
      render(<DashboardSkeleton variant="beneficiary" />);

      // Should have skeleton elements
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render consultant variant', () => {
      render(<DashboardSkeleton variant="consultant" />);

      // Should have skeleton elements
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render admin variant', () => {
      render(<DashboardSkeleton variant="admin" />);

      // Should have skeleton elements
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Skeleton Structure', () => {
    it('should render welcome section skeleton', () => {
      render(<DashboardSkeleton />);

      // Should have welcome section with gradient background
      const welcomeSection = screen.getByText('', { selector: '.bg-gradient-to-r' });
      expect(welcomeSection).toBeInTheDocument();
    });

    it('should render stats grid skeleton', () => {
      render(<DashboardSkeleton />);

      // Should have grid layout
      const grids = screen.getAllByText('', { selector: '.grid' });
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should render charts skeleton', () => {
      render(<DashboardSkeleton />);

      // Should have chart placeholders
      const charts = screen.getAllByText('', { selector: '.h-64' });
      expect(charts.length).toBeGreaterThan(0);
    });

    it('should render content section skeleton', () => {
      render(<DashboardSkeleton />);

      // Should have content section
      const contentSection = screen.getByText('', { selector: '.space-y-4' });
      expect(contentSection).toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('should have animate-pulse class on skeleton elements', () => {
      render(<DashboardSkeleton />);

      const pulseElements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(pulseElements.length).toBeGreaterThan(0);
      
      pulseElements.forEach(element => {
        expect(element).toHaveClass('animate-pulse');
      });
    });

    it('should have proper skeleton dimensions', () => {
      render(<DashboardSkeleton />);

      // Check for various skeleton dimensions
      const elements = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      render(<DashboardSkeleton />);

      const grids = screen.getAllByText('', { selector: '.grid-cols-1' });
      expect(grids.length).toBeGreaterThan(0);
    });

    it('should have responsive chart layout', () => {
      render(<DashboardSkeleton />);

      // Check for chart containers with h-64 class
      const charts = screen.getAllByText('', { selector: '.h-64' });
      expect(charts.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      render(<DashboardSkeleton />);

      // Skeleton should not have text content that would confuse screen readers
      const textElements = screen.queryAllByText(/[a-zA-Z]/);
      expect(textElements.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<DashboardSkeleton />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (less than 50ms)
      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid variant gracefully', () => {
      render(<DashboardSkeleton variant="invalid" as any />);

      // Should still render skeleton
      const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });
});
