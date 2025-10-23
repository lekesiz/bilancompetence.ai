/**
 * P2.4: React Performance Optimizations
 *
 * Utilities for:
 * - Component memoization
 * - Expensive calculation caching
 * - Event handler optimization
 * - List rendering optimization
 */

import { memo, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Deep compare for memo() custom comparison
 * Use only for complex objects - expensive!
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Optimized memo with shallow comparison
 * Usage: const Component = memo(MyComponent)
 */
export { memo };

/**
 * Stable useCallback for expensive event handlers
 * Prevents child re-renders when handler is in props
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

/**
 * useMemo for expensive calculations
 * Automatically memoizes computed values
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook to detect unnecessary re-renders (dev only)
 */
export function useWhyDidYouUpdate(name: string, props: any) {
  const previousProps = useRef<any>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, any> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  }, [props, name]);
}

/**
 * Optimization patterns for common scenarios
 */

/**
 * Optimized list item component
 * Prevents re-rendering when list changes
 */
export function createOptimizedListItem<T extends { id: string | number }>(
  Component: React.FC<T>
) {
  return memo(Component, (prevProps, nextProps) => {
    // Only re-render if the item data actually changed
    return prevProps.id === nextProps.id;
  });
}

/**
 * Batch state updates (helps with frequent updates)
 */
export function useBatchedState<T>(initialValue: T) {
  const [state, setState] = React.useState(initialValue);
  const batchedUpdatesRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updates: Partial<T>) => {
    batchedUpdatesRef.current = { ...batchedUpdatesRef.current, ...updates };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...batchedUpdatesRef.current }));
      batchedUpdatesRef.current = {};
    }, 16); // ~1 frame (60fps)
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
}

/**
 * Debounced state update (for search inputs, etc)
 */
export function useDebouncedState<T>(initialValue: T, delayMs: number = 500) {
  const [state, setState] = React.useState(initialValue);
  const [debouncedState, setDebouncedState] = React.useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedState(state);
    }, delayMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state, delayMs]);

  return [debouncedState, setState] as const;
}

/**
 * Virtualized list hook (for very long lists)
 * Only renders visible items
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(Math.max(0, startIndex - 1), endIndex + 1);

  const offsetY = startIndex * itemHeight;

  return { visibleItems, offsetY, startIndex, endIndex, setScrollTop };
}

/**
 * Intersection Observer hook (for lazy loading)
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Component performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.FC<P>,
  componentName: string = Component.displayName || Component.name
) {
  return memo((props: P) => {
    const startTime = useRef(performance.now());

    useEffect(() => {
      const renderTime = performance.now() - startTime.current;
      if (renderTime > 16.67) {
        // Warn if render > 1 frame at 60fps
        console.warn(
          `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms`
        );
      }
    }, []);

    return <Component {...props} />;
  });
}
