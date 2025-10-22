import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getUserById,
  getBilansByBeneficiary,
  getRecommendationsByBeneficiary,
  getBilansByConsultant,
  getClientsByConsultant,
  getAllBilans,
  getOrganizationStats,
  getRecentActivityByOrganization,
} from '../services/supabaseService.js';

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
 *
 * Returns:
 * - bilans: All career assessments for the beneficiary
 * - recommendations: AI recommendations based on assessments
 * - stats: Count of completed/pending bilans
 */
router.get('/beneficiary', authMiddleware, requireRole('BENEFICIARY'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Get beneficiary's bilans
    const bilans = await getBilansByBeneficiary(req.user.id);

    // Get recommendations for beneficiary
    const recommendations = await getRecommendationsByBeneficiary(req.user.id);

    // Calculate stats
    const completedBilans = bilans.filter(b => b.status === 'COMPLETED').length;
    const pendingBilans = bilans.filter(b => b.status !== 'COMPLETED' && b.status !== 'ARCHIVED').length;

    return res.status(200).json({
      status: 'success',
      data: {
        bilans,
        recommendations,
        stats: {
          totalBilans: bilans.length,
          completedBilans,
          pendingBilans,
          averageSatisfaction: bilans.length > 0
            ? Math.round(
                bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0) / bilans.length * 10
              ) / 10
            : 0,
        },
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
 *
 * Returns:
 * - bilans: All bilans assigned to this consultant
 * - clients: Unique beneficiaries working with this consultant
 * - stats: Count of active/completed assessments
 */
router.get('/consultant', authMiddleware, requireRole('CONSULTANT'), async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Get consultant's bilans
    const bilans = await getBilansByConsultant(req.user.id);

    // Get unique clients
    const clients = await getClientsByConsultant(req.user.id);

    // Calculate stats
    const completedBilans = bilans.filter(b => b.status === 'COMPLETED').length;
    const activeBilans = bilans.filter(b => b.status === 'PRELIMINARY' || b.status === 'INVESTIGATION' || b.status === 'CONCLUSION').length;
    const averageSatisfaction = bilans.length > 0
      ? Math.round(
          bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0) / bilans.length * 10
        ) / 10
      : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        bilans,
        clients,
        stats: {
          totalBilans: bilans.length,
          activeBilans,
          completedBilans,
          totalClients: clients.length,
          averageSatisfaction,
        },
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
 *
 * Returns:
 * - stats: Organization-wide statistics
 * - recentActivity: Last 20 activities in organization
 */
router.get('/admin', authMiddleware, requireRole('ORG_ADMIN'), async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Get user to extract organization_id (currently using user ID as proxy)
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Get organization stats
    const stats = await getOrganizationStats(user.id);

    // Get recent activity
    const recentActivity = await getRecentActivityByOrganization(user.id, 20);

    return res.status(200).json({
      status: 'success',
      data: {
        stats,
        recentActivity,
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
 * Get user-specific statistics (joined date, last active, etc.)
 *
 * Returns:
 * - userRole: User's role in the system
 * - joinedAt: User account creation date
 * - lastActive: User's last login
 * - email: User's email address
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Get user from database
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
        userId: user.id,
        userRole: user.role,
        email: user.email,
        fullName: user.full_name,
        joinedAt: user.created_at,
        lastActive: user.last_login_at,
        emailVerified: !!user.email_verified_at,
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
