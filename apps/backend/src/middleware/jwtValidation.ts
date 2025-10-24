import { z } from 'zod';

/**
 * Zod schema for JWT payload validation
 */
export const jwtPayloadSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  organization_id: z.string().uuid('Invalid organization ID').optional(),
  iat: z.number().int().positive().optional(),
  exp: z.number().int().positive().optional(),
});

export type JWTPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Validate and parse JWT payload
 */
export function validateJWTPayload(payload: unknown): JWTPayload {
  return jwtPayloadSchema.parse(payload);
}

