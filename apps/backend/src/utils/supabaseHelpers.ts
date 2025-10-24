/**
 * Supabase TypeScript Helper Functions
 * Provides type-safe wrappers for Supabase operations
 * Prevents SelectQueryError type mismatches and improves DX
 */

import { supabase } from '../services/supabaseService.js';
import { PostgrestError } from '@supabase/supabase-js';
import { logger } from './logger.js';

/**
 * Custom error classes for better error handling
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(entityName: string) {
    super(`${entityName} not found`);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Response type for select operations
 */
export interface SelectResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface SelectArrayResponse<T> {
  data: T[];
  error: PostgrestError | null;
}

export interface SelectCountResponse<T> {
  data: T[];
  count: number;
  error: PostgrestError | null;
}

/**
 * Type-safe single row select
 * Returns null if not found (PGRST116 error code)
 *
 * @example
 * const user = await selectSingle<User>('users', { id: userId });
 * if (!user) throw new NotFoundError('User');
 * console.log(user.id); // Type-safe
 */
export async function selectSingle<T>(
  table: string,
  filters: Record<string, any>,
): Promise<T | null> {
  try {
    let query = supabase.from(table).select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found - this is expected for some queries
        logger.debug(`Record not found in ${table}`, { filters });
        return null;
      }
      throw error;
    }

    return (data as T) || null;
  } catch (error) {
    logger.error(`Failed to fetch single record from ${table}`, error);
    throw new DatabaseError(`Failed to fetch from ${table}`, error);
  }
}

/**
 * Type-safe multiple rows select
 *
 * @example
 * const users = await selectMultiple<User>('users', { role: 'CONSULTANT' });
 * users.forEach(user => console.log(user.id)); // Type-safe
 */
export async function selectMultiple<T>(
  table: string,
  filters?: Record<string, any>,
): Promise<T[]> {
  try {
    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as T[]) || [];
  } catch (error) {
    logger.error(`Failed to fetch multiple records from ${table}`, error);
    throw new DatabaseError(`Failed to fetch from ${table}`, error);
  }
}

/**
 * Type-safe select with count
 * Useful for pagination and statistics
 *
 * @example
 * const { data: users, count } = await selectWithCount<User>('users');
 * console.log(`Total users: ${count}`);
 */
export async function selectWithCount<T>(
  table: string,
  filters?: Record<string, any>,
  options?: { limit?: number; offset?: number },
): Promise<{ data: T[]; count: number }> {
  try {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    return {
      data: (data as T[]) || [],
      count: count || 0,
    };
  } catch (error) {
    logger.error(`Failed to fetch with count from ${table}`, error);
    throw new DatabaseError(`Failed to fetch from ${table}`, error);
  }
}

/**
 * Type-safe count only (returns just the number, no data)
 * More efficient when you only need the count
 *
 * @example
 * const total = await countRows('users', { role: 'BENEFICIARY' });
 * console.log(`Total beneficiaries: ${total}`);
 */
export async function countRows(
  table: string,
  filters?: Record<string, any>,
): Promise<number> {
  try {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    logger.error(`Failed to count rows in ${table}`, error);
    throw new DatabaseError(`Failed to count rows in ${table}`, error);
  }
}

/**
 * Type-safe insert single row
 *
 * @example
 * const newUser = await insertRow<User>('users', {
 *   email: 'test@example.com',
 *   full_name: 'Test User',
 * });
 */
export async function insertRow<T>(
  table: string,
  data: Partial<T>,
): Promise<T> {
  try {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return (inserted as T) || (data as T);
  } catch (error) {
    logger.error(`Failed to insert into ${table}`, error);
    throw new DatabaseError(`Failed to insert into ${table}`, error);
  }
}

/**
 * Type-safe insert multiple rows
 *
 * @example
 * const newUsers = await insertRows<User>('users', [
 *   { email: 'user1@example.com', full_name: 'User 1' },
 *   { email: 'user2@example.com', full_name: 'User 2' },
 * ]);
 */
export async function insertRows<T>(
  table: string,
  dataArray: Partial<T>[],
): Promise<T[]> {
  try {
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(dataArray as any)
      .select();

    if (error) {
      throw error;
    }

    return (inserted as T[]) || [];
  } catch (error) {
    logger.error(`Failed to insert multiple rows into ${table}`, error);
    throw new DatabaseError(`Failed to insert into ${table}`, error);
  }
}

/**
 * Type-safe update row
 *
 * @example
 * const updated = await updateRow<User>('users', { id: userId }, {
 *   full_name: 'New Name',
 *   email_verified_at: new Date().toISOString(),
 * });
 */
export async function updateRow<T>(
  table: string,
  filters: Record<string, any>,
  updates: Partial<T>,
): Promise<T> {
  try {
    let query = supabase
      .from(table)
      .update(updates as any);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select().single();

    if (error) {
      throw error;
    }

    return (data as T) || (updates as T);
  } catch (error) {
    logger.error(`Failed to update ${table}`, error);
    throw new DatabaseError(`Failed to update ${table}`, error);
  }
}

/**
 * Type-safe update multiple rows
 *
 * @example
 * const updated = await updateRows<User>('users', { role: 'CONSULTANT' }, {
 *   last_login_at: new Date().toISOString(),
 * });
 */
export async function updateRows<T>(
  table: string,
  filters: Record<string, any>,
  updates: Partial<T>,
): Promise<T[]> {
  try {
    let query = supabase
      .from(table)
      .update(updates as any);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();

    if (error) {
      throw error;
    }

    return (data as T[]) || [];
  } catch (error) {
    logger.error(`Failed to update multiple rows in ${table}`, error);
    throw new DatabaseError(`Failed to update ${table}`, error);
  }
}

/**
 * Type-safe delete row
 *
 * @example
 * await deleteRow('users', { id: userId });
 */
export async function deleteRow(
  table: string,
  filters: Record<string, any>,
): Promise<void> {
  try {
    let query = supabase.from(table).delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error(`Failed to delete from ${table}`, error);
    throw new DatabaseError(`Failed to delete from ${table}`, error);
  }
}

/**
 * Type-safe soft delete (sets deleted_at)
 * Useful for records with soft delete support
 *
 * @example
 * await softDeleteRow('users', { id: userId });
 */
export async function softDeleteRow<T>(
  table: string,
  filters: Record<string, any>,
): Promise<T> {
  try {
    let query = supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() } as any);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select().single();

    if (error) {
      throw error;
    }

    return (data as T) || ({} as T);
  } catch (error) {
    logger.error(`Failed to soft delete from ${table}`, error);
    throw new DatabaseError(`Failed to soft delete from ${table}`, error);
  }
}

export default {
  selectSingle,
  selectMultiple,
  selectWithCount,
  countRows,
  insertRow,
  insertRows,
  updateRow,
  updateRows,
  deleteRow,
  softDeleteRow,
};
