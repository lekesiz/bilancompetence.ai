import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserPreferences,
  updateUserPreferences,
  deleteUserAccount,
  exportUserData,
  getOrganizationUsers,
} from '../services/userService.js';
import { createAuditLog } from '../services/supabaseService.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  },
});

// Validation schemas
const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  phone: z.string().optional(),
  bio: z.string().max(1000).optional(),
  specialization: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

const preferencesSchema = z.object({
  notifications_email: z.boolean().optional(),
  notifications_sms: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
});

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues,
      });
    }

    const updatedProfile = await updateUserProfile(req.user.id, validation.data);

    // Log the update
    await createAuditLog(req.user.id, 'PROFILE_UPDATED', 'user', req.user.id, validation.data, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
    });
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const stats = await getUserStats(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const preferences = await getUserPreferences(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: preferences || {},
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch preferences',
    });
  }
});

/**
 * PUT /api/users/preferences
 * Update user preferences
 */
router.put('/preferences', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const validation = preferencesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid preferences',
      });
    }

    const updatedPreferences = await updateUserPreferences(req.user.id, validation.data);

    return res.status(200).json({
      status: 'success',
      message: 'Preferences updated',
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update preferences',
    });
  }
});

/**
 * GET /api/users/export
 * Export user data (GDPR)
 */
router.get('/export', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const data = await exportUserData(req.user.id);

    // Log the export
    await createAuditLog(req.user.id, 'DATA_EXPORTED', 'user', req.user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export data',
    });
  }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { reason } = req.body;

    await deleteUserAccount(req.user.id, reason);

    // Log deletion
    await createAuditLog(req.user.id, 'ACCOUNT_DELETED', 'user', req.user.id, { reason }, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete account',
    });
  }
});

/**
 * GET /api/users/organization/:orgId
 * Get organization users (admin only)
 */
router.get(
  '/organization/:orgId',
  authMiddleware,
  requireRole('ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { orgId } = req.params;

      const users = await getOrganizationUsers(orgId);

      return res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      console.error('Get org users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch organization users',
      });
    }
  }
);

/**
 * POST /api/users/upload-cv
 * Upload user CV
 */
router.post('/upload-cv', authMiddleware, upload.single('cv'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    const { uploadCv } = await import('../services/cvService.js');
    const result = await uploadCv(req.user.id, req.file);

    // Log the upload
    await createAuditLog(
      req.user.id,
      'CV_UPLOADED',
      'user',
      req.user.id,
      { filename: req.file.originalname, size: req.file.size },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: 'CV uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Upload CV error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to upload CV',
    });
  }
});

/**
 * DELETE /api/users/delete-cv
 * Delete user CV
 */
router.delete('/delete-cv', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { deleteCv } = await import('../services/cvService.js');
    await deleteCv(req.user.id);

    // Log the deletion
    await createAuditLog(req.user.id, 'CV_DELETED', 'user', req.user.id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'CV deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete CV error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete CV',
    });
  }
});

export default router;
