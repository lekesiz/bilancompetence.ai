/**
 * Supabase Response Type Guards & Helpers
 * Provides type-safe utilities for handling Supabase SDK responses
 * which return union types (T | SelectQueryError)
 */

import { PostgrestError } from '@supabase/supabase-js';
import { DatabaseError } from './errorHandler.js';
import { logger } from './logger.js';

/**
 * Type guard to check if data is a SelectQueryError
 * Use in conditionals: if (isSelectError(data)) { ... }
 * @param data - The data to check
 * @returns true if data is a SelectQueryError, false otherwise
 */
export function isSelectError(data: any): data is { error: true } {
  return data && typeof data === 'object' && 'error' in data && data.error === true;
}

/**
 * Throws if Supabase returns a PostgrestError
 * Always use after destructuring: throwIfError(error, 'fetch user by email')
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @throws DatabaseError if error exists
 */
export function throwIfError(error: PostgrestError | null, context: string): void {
  if (error) {
    logger.error(`Database error during ${context}:`, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
    throw new DatabaseError(`Failed to ${context}`, error);
  }
}

/**
 * Safely extracts data from Supabase response
 * Combines error and data checking in one call
 * @param data - The data returned from Supabase (may be null or error object)
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @returns The data if valid, throws otherwise
 * @throws DatabaseError if error exists
 */
export function extractData<T>(
  data: T | null,
  error: PostgrestError | null,
  context: string
): T | null {
  throwIfError(error, context);
  return data;
}

/**
 * Safely extracts a single row that must exist
 * Throws NotFoundError if data is null
 * @param data - The single row returned from Supabase
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @returns The data if valid
 * @throws DatabaseError if error exists
 * @throws NotFoundError if data is null
 */
export function extractSingleRow<T>(
  data: T | null,
  error: PostgrestError | null,
  context: string
): T {
  throwIfError(error, context);

  if (!data) {
    logger.warn(`No data returned from ${context} (expected single row)`);
    const { NotFoundError } = require('./errorHandler.js');
    throw new NotFoundError(context);
  }

  return data;
}

/**
 * Safely extracts multiple rows from Supabase response
 * Returns empty array if data is null
 * @param data - The rows returned from Supabase
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @returns The data array or empty array if null
 * @throws DatabaseError if error exists
 */
export function extractArray<T>(
  data: T[] | null,
  error: PostgrestError | null,
  context: string
): T[] {
  throwIfError(error, context);
  return data || [];
}

/**
 * Safely extracts count operations which return { count, data, error }
 * @param count - The count value returned from Supabase
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @returns The count value or 0 if null
 * @throws DatabaseError if error exists
 */
export function extractCount(
  count: number | null,
  error: PostgrestError | null,
  context: string
): number {
  throwIfError(error, context);
  return count || 0;
}

/**
 * Type guard to check if a response is a paginated response
 * Use when return type is PaginatedResponse<T> | T[]
 * @param response - The response to check
 * @returns true if response is a PaginatedResponse (has data, count properties)
 */
export function isPaginatedResponse<T>(
  response: any
): response is { data: T[]; count: number; total: number } {
  return (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray(response.data) &&
    'count' in response &&
    typeof response.count === 'number'
  );
}

/**
 * Safely extracts array from union of PaginatedResponse<T> | T[]
 * Normalizes to always return array
 * @param response - The response which may be paginated or array
 * @param error - The error from Supabase response
 * @param context - Description of the operation for logging
 * @returns Array of items from either response type
 * @throws DatabaseError if error exists
 */
export function extractArrayFromUnion<T>(
  response: { data: T[]; count: number; total: number } | T[] | null,
  error: PostgrestError | null,
  context: string
): T[] {
  throwIfError(error, context);

  if (!response) {
    return [];
  }

  if (isPaginatedResponse(response)) {
    return response.data || [];
  }

  return Array.isArray(response) ? response : [];
}

/**
 * Wrapper for safe single row retrieval
 * Handles the full flow: query → error check → null check → return
 * @param queryFn - Async function that returns Supabase response
 * @param context - Description of the operation for logging
 * @returns The single row data or throws error
 */
export async function safeSingleQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context: string
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    return extractSingleRow(data, error, context);
  } catch (err) {
    if (err instanceof Error && err.name === 'NotFoundError') {
      throw err;
    }
    logger.error(`Safe single query failed for ${context}`, err);
    throw err;
  }
}

/**
 * Wrapper for safe multiple rows retrieval
 * Handles the full flow: query → error check → return (or empty array)
 * @param queryFn - Async function that returns Supabase response
 * @param context - Description of the operation for logging
 * @returns Array of rows or empty array
 */
export async function safeArrayQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: PostgrestError | null }>,
  context: string
): Promise<T[]> {
  try {
    const { data, error } = await queryFn();
    return extractArray(data, error, context);
  } catch (err) {
    logger.error(`Safe array query failed for ${context}`, err);
    throw err;
  }
}

/**
 * Wrapper for safe count retrieval
 * @param queryFn - Async function that returns Supabase response with count
 * @param context - Description of the operation for logging
 * @returns The count or 0
 */
export async function safeCountQuery(
  queryFn: () => Promise<{ count: number | null; error: PostgrestError | null }>,
  context: string
): Promise<number> {
  try {
    const { count, error } = await queryFn();
    return extractCount(count, error, context);
  } catch (err) {
    logger.error(`Safe count query failed for ${context}`, err);
    throw err;
  }
}

export default {
  isSelectError,
  throwIfError,
  extractData,
  extractSingleRow,
  extractArray,
  extractCount,
  isPaginatedResponse,
  extractArrayFromUnion,
  safeSingleQuery,
  safeArrayQuery,
  safeCountQuery,
};
