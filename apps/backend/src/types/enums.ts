/**
 * Enum Constants for BilanCompetence.AI
 * Type-safe enum definitions to match database schema
 *
 * These constants prevent typos and ensure consistency
 * across the entire backend codebase.
 */

/**
 * Bilan/Assessment Status Enumeration
 * Matches database enum type from bilans table
 */
export const BilanStatus = {
  /** Assessment not started yet */
  PRELIMINARY: 'PRELIMINARY',
  /** Assessment in progress, investigating */
  INVESTIGATION: 'INVESTIGATION',
  /** Assessment conclusions formed */
  CONCLUSION: 'CONCLUSION',
  /** Assessment completed */
  COMPLETED: 'COMPLETED',
  /** Assessment archived/no longer active */
  ARCHIVED: 'ARCHIVED',
} as const;

export type BilanStatusType = (typeof BilanStatus)[keyof typeof BilanStatus];

/**
 * User Role Enumeration
 * Matches database enum type from users table
 */
export const UserRole = {
  /** Service beneficiary/client */
  BENEFICIARY: 'BENEFICIARY',
  /** Career consultant/advisor */
  CONSULTANT: 'CONSULTANT',
  /** Organization administrator */
  ORG_ADMIN: 'ORG_ADMIN',
  /** System administrator (super admin) */
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Session/Booking Status Enumeration
 * For session scheduling and booking management
 */
export const SessionStatus = {
  /** Appointment scheduled */
  SCHEDULED: 'SCHEDULED',
  /** Appointment confirmed by both parties */
  CONFIRMED: 'CONFIRMED',
  /** Session in progress */
  IN_PROGRESS: 'IN_PROGRESS',
  /** Session completed */
  COMPLETED: 'COMPLETED',
  /** Session cancelled */
  CANCELLED: 'CANCELLED',
  /** Beneficiary did not show up */
  NO_SHOW: 'NO_SHOW',
} as const;

export type SessionStatusType = (typeof SessionStatus)[keyof typeof SessionStatus];

/**
 * Qualiopi Compliance Status
 * For QUALIOPI certification tracking
 */
export const QualiopiStatus = {
  /** Not started */
  NOT_STARTED: 'NOT_STARTED',
  /** In progress */
  IN_PROGRESS: 'IN_PROGRESS',
  /** Completed */
  COMPLETED: 'COMPLETED',
  /** Certified */
  CERTIFIED: 'CERTIFIED',
  /** Failed */
  FAILED: 'FAILED',
} as const;

export type QualiopiStatusType = (typeof QualiopiStatus)[keyof typeof QualiopiStatus];

/**
 * Notification Type Enumeration
 */
export const NotificationType = {
  /** Session reminder notification */
  SESSION_REMINDER: 'SESSION_REMINDER',
  /** Assessment update notification */
  ASSESSMENT_UPDATE: 'ASSESSMENT_UPDATE',
  /** Job recommendation notification */
  JOB_RECOMMENDATION: 'JOB_RECOMMENDATION',
  /** System announcement */
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  /** Email verification required */
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  /** Password reset request */
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type NotificationTypeType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * File Upload Status
 */
export const FileStatus = {
  /** File upload in progress */
  UPLOADING: 'UPLOADING',
  /** File successfully uploaded */
  UPLOADED: 'UPLOADED',
  /** File upload failed */
  FAILED: 'FAILED',
  /** File deleted/removed */
  DELETED: 'DELETED',
} as const;

export type FileStatusType = (typeof FileStatus)[keyof typeof FileStatus];

/**
 * Question Type Enumeration
 * For assessment questions
 */
export const QuestionType = {
  /** Short text response */
  TEXT: 'TEXT',
  /** Rating scale (1-5) */
  RATING: 'RATING',
  /** Long open-ended text */
  OPEN_ENDED: 'OPEN_ENDED',
  /** Multiple choice */
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  /** Yes/No question */
  YES_NO: 'YES_NO',
  /** Dropdown select */
  SELECT: 'SELECT',
} as const;

export type QuestionTypeType = (typeof QuestionType)[keyof typeof QuestionType];

/**
 * Recommendation Priority Enumeration
 */
export const RecommendationPriority = {
  /** Low priority - nice to have */
  LOW: 'LOW',
  /** Medium priority - should consider */
  MEDIUM: 'MEDIUM',
  /** High priority - important */
  HIGH: 'HIGH',
  /** Critical priority - urgent action needed */
  CRITICAL: 'CRITICAL',
} as const;

export type RecommendationPriorityType = (typeof RecommendationPriority)[keyof typeof RecommendationPriority];

/**
 * Recommendation Type Enumeration
 */
export const RecommendationType = {
  /** Training course recommendation */
  TRAINING: 'TRAINING',
  /** Job opportunity */
  JOB_OPPORTUNITY: 'JOB_OPPORTUNITY',
  /** Career path */
  CAREER_PATH: 'CAREER_PATH',
  /** Skill development */
  SKILL_DEVELOPMENT: 'SKILL_DEVELOPMENT',
  /** Further assessment needed */
  FURTHER_ASSESSMENT: 'FURTHER_ASSESSMENT',
} as const;

export type RecommendationTypeType = (typeof RecommendationType)[keyof typeof RecommendationType];

/**
 * Helper function to validate enum value
 *
 * @example
 * if (isValidBilanStatus(status)) {
 *   console.log('Valid status:', status);
 * }
 */
export function isValidBilanStatus(value: any): value is BilanStatusType {
  return Object.values(BilanStatus).includes(value);
}

export function isValidUserRole(value: any): value is UserRoleType {
  return Object.values(UserRole).includes(value);
}

export function isValidSessionStatus(value: any): value is SessionStatusType {
  return Object.values(SessionStatus).includes(value);
}

export function isValidNotificationType(value: any): value is NotificationTypeType {
  return Object.values(NotificationType).includes(value);
}

export function isValidQuestionType(value: any): value is QuestionTypeType {
  return Object.values(QuestionType).includes(value);
}

/**
 * Helper function to get all values of an enum
 */
export function getEnumValues<T extends Record<string, string>>(enumObj: T): Array<T[keyof T]> {
  return Object.values(enumObj) as Array<T[keyof T]>;
}

/**
 * Helper function to get enum display name (with spaces and proper casing)
 *
 * @example
 * getEnumLabel(BilanStatus.PRELIMINARY) // Returns "Preliminary"
 */
export function getEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default {
  BilanStatus,
  UserRole,
  SessionStatus,
  QualiopiStatus,
  NotificationType,
  FileStatus,
  QuestionType,
  RecommendationPriority,
  RecommendationType,
  isValidBilanStatus,
  isValidUserRole,
  isValidSessionStatus,
  isValidNotificationType,
  isValidQuestionType,
  getEnumValues,
  getEnumLabel,
};
