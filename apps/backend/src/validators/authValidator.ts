import { z } from 'zod';

/**
 * Registration request validation schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .min(5, 'Email too short')
      .max(255, 'Email too long'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/\d/, 'Password must contain digit')
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain special character'),
    role: z.enum(['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN', 'ADMIN']).default('BENEFICIARY'),
  })
  .and(
    z.union([
      z.object({
        full_name: z
          .string()
          .min(2, 'Name must be at least 2 characters')
          .max(255, 'Name too long'),
      }),
      z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
      }),
    ])
  )
  .transform((data) => ({
    ...data,
    full_name: 'full_name' in data ? data.full_name : (data as any).fullName,
  }));

export type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * Login request validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(5, 'Email too short'),
  password: z.string().min(8, 'Password too short'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Refresh token request validation schema
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Invalid refresh token'),
});

export type RefreshRequest = z.infer<typeof refreshSchema>;

/**
 * Password reset request validation
 */
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type PasswordResetRequest = z.infer<typeof passwordResetSchema>;

/**
 * Password reset confirmation validation
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(20, 'Invalid token'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/\d/, 'Password must contain digit')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain special character'),
});

export type PasswordResetConfirmRequest = z.infer<typeof passwordResetConfirmSchema>;

/**
 * Email verification request
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(20, 'Invalid token'),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

/**
 * Validate and parse registration request
 */
export function validateRegisterRequest(data: unknown) {
  try {
    const parsed = registerSchema.parse(data);
    return { valid: true, data: parsed, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        data: null,
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return { valid: false, data: null, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate and parse login request
 */
export function validateLoginRequest(data: unknown) {
  try {
    const parsed = loginSchema.parse(data);
    return { valid: true, data: parsed, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        data: null,
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return { valid: false, data: null, errors: ['Unknown validation error'] };
  }
}

/**
 * Validate and parse refresh token request
 */
export function validateRefreshRequest(data: unknown) {
  try {
    const parsed = refreshSchema.parse(data);
    return { valid: true, data: parsed, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        data: null,
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      };
    }
    return { valid: false, data: null, errors: ['Unknown validation error'] };
  }
}
