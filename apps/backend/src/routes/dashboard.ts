import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { getUserById } from '../services/supabaseService';

const router = Router();

/**
 * GET /api/dashboard/me
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
        email_verified_at: user.email_verified_at,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard',
    });
  }
});

/**
 * GET /api/dashboard/beneficiary
 * Beneficiary dashboard (assessments, recommendations)
 */
router.get('/beneficiary', authMiddleware, requireRole('BENEFICIARY'), async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        assessments: [],
        recommendations: [],
        completedBilans: 0,
        pendingBilans: 0,
      },
    });
  } catch (error) {
    console.error('Beneficiary dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch beneficiary dashboard',
    });
  }
});

/**
 * GET /api/dashboard/consultant
 * Consultant dashboard (manage assessments, clients)
 */
router.get('/consultant', authMiddleware, requireRole('CONSULTANT'), async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        clients: [],
        assessments: [],
        totalClients: 0,
        assessmentsCompleted: 0,
      },
    });
  } catch (error) {
    console.error('Consultant dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch consultant dashboard',
    });
  }
});

/**
 * GET /api/dashboard/admin
 * Admin dashboard (organization management, analytics)
 */
router.get('/admin', authMiddleware, requireRole('ORG_ADMIN'), async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        totalUsers: 0,
        totalAssessments: 0,
        totalRecommendations: 0,
        activeConsultants: 0,
        recentActivity: [],
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch admin dashboard',
    });
  }
});

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        userRole: req.user?.role,
        joinedAt: new Date(),
        lastActive: new Date(),
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
    });
  }
});

export default router;
