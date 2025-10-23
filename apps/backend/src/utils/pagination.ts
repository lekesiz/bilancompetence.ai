/**
 * Pagination Utilities for Express Backend
 * Provides helper functions for paginating database queries
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Parse pagination parameters from query string
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @returns Pagination parameters object
 */
export function parsePaginationParams(page?: string | number, limit?: string | number): PaginationParams {
  let pageNum = parseInt(String(page || 1), 10);
  let limitNum = parseInt(String(limit || 20), 10);

  // Validation
  if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
  if (isNaN(limitNum) || limitNum < 1) limitNum = 20;
  if (limitNum > 100) limitNum = 100; // Max 100 items per page

  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
}

/**
 * Create paginated response with metadata
 * @param data - Array of items to return
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total count of items
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Parse sorting parameters
 * @param sort - Sorting string (e.g., "created_at:desc" or "name:asc")
 * @returns Object with column and direction
 */
export function parseSortParams(sort?: string) {
  if (!sort) {
    return {
      column: 'created_at',
      direction: 'desc' as const,
    };
  }

  const [column, direction] = sort.split(':');

  if (!['asc', 'desc'].includes(direction?.toLowerCase() || '')) {
    return {
      column: column || 'created_at',
      direction: 'desc' as const,
    };
  }

  return {
    column: column || 'created_at',
    direction: (direction?.toLowerCase() || 'desc') as 'asc' | 'desc',
  };
}
