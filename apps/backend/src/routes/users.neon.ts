import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateUserCV,
  deleteUserCV,
  getAllUsers,
  getUsersByOrganization,
} from '../services/userServiceNeon.js';
import { uploadCV, deleteCV } from '../services/cvServiceNeon.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Configure multer for CV uploads
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

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization_id: user.organization_id,
        cv_url: user.cv_url,
        cv_uploaded_at: user.cv_uploaded_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error: any) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/users/profile
 * Get current user profile (alias for /me)
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
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    // Validate request body
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.error.errors,
      });
    }

    // Update profile with RLS
    const updatedProfile = await updateUserProfile(req.user.id, validation.data);
    if (!updatedProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found or update failed',
      });
    }

    logger.info('Profile updated successfully', { userId: req.user.id });

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/users/upload-cv
 * Upload CV file
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

    const userId = req.user.id;

    // Upload CV to Supabase Storage and update Neon database
    const result = await uploadCV(userId, req.file);
    const updatedUser = await getUserById(userId);

    if (!updatedUser) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update CV URL in database',
      });
    }

    logger.info('CV uploaded successfully', { userId, cvUrl: result.cv_url });

    return res.status(200).json({
      status: 'success',
      message: 'CV uploaded successfully',
      data: {
        cv_url: updatedUser.cv_url,
        cv_uploaded_at: updatedUser.cv_uploaded_at,
      },
    });
  } catch (error: any) {
    logger.error('CV upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload CV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * DELETE /api/users/delete-cv
 * Delete CV file
 */
router.delete('/delete-cv', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const userId = req.user.id;
    const user = await getUserById(userId);

    if (!user?.cv_url) {
      return res.status(404).json({
        status: 'error',
        message: 'No CV found',
      });
    }

    // Delete CV from Supabase Storage and update Neon database
    await deleteCV(userId);
    const updatedUser = await getUserById(userId);

    if (!updatedUser) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete CV from database',
      });
    }

    logger.info('CV deleted successfully', { userId });

    return res.status(200).json({
      status: 'success',
      message: 'CV deleted successfully',
    });
  } catch (error: any) {
    logger.error('CV delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete CV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authMiddleware, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const users = await getAllUsers(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error: any) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/users/organization/:organizationId
 * Get users by organization (consultant/admin only)
 */
router.get(
  '/organization/:organizationId',
  authMiddleware,
  requireRole('CONSULTANT', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { organizationId } = req.params;

      const users = await getUsersByOrganization(req.user.id, organizationId);

      return res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error: any) {
      logger.error('Get organization users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch organization users',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

export default router;

