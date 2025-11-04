import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  SkeletonLoader,
  DashboardCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  PageSkeleton,
} from '../SkeletonLoader';

describe('SkeletonLoader Components', () => {
  describe('SkeletonLoader', () => {
    it('should render with default props', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should render text variant by default', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('h-4', 'w-full', 'rounded');
    });

    it('should render card variant correctly', () => {
      const { container } = render(<SkeletonLoader variant="card" />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('h-32', 'w-full', 'rounded-lg');
    });

    it('should render avatar variant correctly', () => {
      const { container } = render(<SkeletonLoader variant="avatar" />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('should render button variant correctly', () => {
      const { container } = render(<SkeletonLoader variant="button" />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('h-10', 'w-24', 'rounded-md');
    });

    it('should render table variant correctly', () => {
      const { container } = render(<SkeletonLoader variant="table" />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('h-12', 'w-full', 'rounded');
    });

    it('should render multiple skeletons when count is specified', () => {
      const { container } = render(<SkeletonLoader count={3} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      
      expect(skeletons).toHaveLength(3);
    });

    it('should apply custom className', () => {
      const { container } = render(<SkeletonLoader className="custom-class" />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('custom-class');
    });

    it('should have dark mode classes', () => {
      const { container } = render(<SkeletonLoader />);
      const skeleton = container.querySelector('[role="status"]');
      
      expect(skeleton).toHaveClass('dark:bg-gray-700');
    });
  });

  describe('DashboardCardSkeleton', () => {
    it('should render dashboard card structure', () => {
      const { container } = render(<DashboardCardSkeleton />);
      const card = container.querySelector('.rounded-lg.border');
      
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white', 'dark:bg-gray-800');
    });

    it('should contain multiple skeleton elements', () => {
      const { container } = render(<DashboardCardSkeleton />);
      const skeletons = container.querySelectorAll('[role="status"]');
      
      expect(skeletons.length).toBeGreaterThan(1);
    });
  });

  describe('TableSkeleton', () => {
    it('should render default 5 rows', () => {
      const { container } = render(<TableSkeleton />);
      // Header (1) + 5 rows = 6 total
      const rows = container.querySelectorAll('.flex.gap-4');
      
      expect(rows.length).toBeGreaterThanOrEqual(6);
    });

    it('should render custom number of rows', () => {
      const { container } = render(<TableSkeleton rows={3} />);
      // Header (1) + 3 rows = 4 total
      const rows = container.querySelectorAll('.flex.gap-4');
      
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });

    it('should have proper structure with header and rows', () => {
      const { container } = render(<TableSkeleton rows={2} />);
      const space = container.querySelector('.space-y-3');
      
      expect(space).toBeInTheDocument();
    });
  });

  describe('FormSkeleton', () => {
    it('should render form structure', () => {
      const { container } = render(<FormSkeleton />);
      const form = container.querySelector('.space-y-4');
      
      expect(form).toBeInTheDocument();
    });

    it('should contain input fields and buttons', () => {
      const { container } = render(<FormSkeleton />);
      const skeletons = container.querySelectorAll('[role="status"]');
      
      // Should have multiple input fields and buttons
      expect(skeletons.length).toBeGreaterThanOrEqual(5);
    });

    it('should have action buttons section', () => {
      const { container } = render(<FormSkeleton />);
      const buttonsSection = container.querySelector('.flex.justify-end.gap-2');
      
      expect(buttonsSection).toBeInTheDocument();
    });
  });

  describe('PageSkeleton', () => {
    it('should render full page structure', () => {
      const { container } = render(<PageSkeleton />);
      const page = container.querySelector('.space-y-6.p-6');
      
      expect(page).toBeInTheDocument();
    });

    it('should contain header section', () => {
      const { container } = render(<PageSkeleton />);
      const skeletons = container.querySelectorAll('[role="status"]');
      
      // Should have header, cards, and table skeletons
      expect(skeletons.length).toBeGreaterThan(10);
    });

    it('should have grid layout for cards', () => {
      const { container } = render(<PageSkeleton />);
      const grid = container.querySelector('.grid.gap-6');
      
      expect(grid).toBeInTheDocument();
    });
  });
});
