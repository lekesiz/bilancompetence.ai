import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getUserById } from '../services/userServiceNeon.js';
import { logger } from '../utils/logger.js';
import {
  getBilansByBeneficiary,
  getRecommendationsByBeneficiary,
  getBilansByConsultant,
  getClientsByConsultant,
  getAllBilans,
  getOrganizationStats,
  getOrganizationInfo,
  getUsersByOrganization,
  getRecentActivityByOrganization,
} from '../services/dashboardServiceNeon.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to fetch user profile.
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
  } catch (error) {
    logger.error('Dashboard /me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile',
    });
  }
});

/**
 * @swagger
 * /api/dashboard/beneficiary:
 *   get:
 *     summary: Get beneficiary dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beneficiary dashboard data retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Failed to fetch beneficiary dashboard.
 */
router.get(
  '/beneficiary',
  authMiddleware,
  requireRole('BENEFICIARY'),
  async (req: Request, res: Response) => {
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
      const completedBilans = bilans.filter((b) => b.status === 'COMPLETED').length;
      const pendingBilans = bilans.filter(
        (b) => b.status !== 'COMPLETED' && b.status !== 'ARCHIVED'
      ).length;

      const totalSatisfaction = bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0);
      const averageSatisfaction =
        bilans.length > 0 ? Math.round((totalSatisfaction / bilans.length) * 10) / 10 : 0;

      return res.status(200).json({
        status: 'success',
        data: {
          bilans,
          recommendations,
          stats: {
            totalBilans: bilans.length,
            completedBilans,
            pendingBilans,
            averageSatisfaction,
          },
        },
      });
    } catch (error) {
      logger.error('Beneficiary dashboard error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch beneficiary dashboard',
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/consultant:
 *   get:
 *     summary: Get consultant dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consultant dashboard data retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Failed to fetch consultant dashboard.
 */
router.get(
  '/consultant',
  authMiddleware,
  requireRole('CONSULTANT'),
  async (req: Request, res: Response) => {
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
      const completedBilans = bilans.filter((b) => b.status === 'COMPLETED').length;
      const inProgressBilans = bilans.filter(
        (b) =>
          b.status === 'PRELIMINARY' || b.status === 'INVESTIGATION' || b.status === 'CONCLUSION' || b.status === 'IN_PROGRESS'
      ).length;

      const totalSatisfaction = bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0);
      const averageSatisfaction =
        bilans.length > 0 ? Math.round((totalSatisfaction / bilans.length) * 10) / 10 : 0;

      // Transform stats to match frontend expectations
      const stats = {
        activeClients: clients.length,
        inProgressAssessments: inProgressBilans,
        completedAssessments: completedBilans,
        averageSatisfaction,
      };

      return res.status(200).json({
        status: 'success',
        data: {
          clients,
          assessments: bilans, // Frontend expects 'assessments' not 'bilans'
          recommendations: [], // Placeholder for now
          stats,
        },
      });
    } catch (error) {
      logger.error('Consultant dashboard error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch consultant dashboard',
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to fetch admin dashboard.
 */
router.get(
  '/admin',
  authMiddleware,
  requireRole('ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Get user to extract organization_id
      const user = await getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      if (!user.organization_id) {
        return res.status(403).json({
          status: 'error',
          message: 'User is not associated with an organization',
        });
      }

      // Get organization info
      const organization = await getOrganizationInfo(user.organization_id);

      // Get organization stats
      const rawStats = await getOrganizationStats(user.organization_id);

      // Get all users in organization
      const users = await getUsersByOrganization(user.organization_id);

      // Get recent activity
      const recentActivity = await getRecentActivityByOrganization(user.organization_id, 20);

      // Transform stats to match frontend expectations
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'ACTIVE').length,
        totalAssessments: rawStats.totalBilans,
        completedAssessments: rawStats.completedBilans,
        averageSatisfaction: rawStats.averageSatisfaction,
      };

      // Prepare analytics data (placeholder for now)
      const analytics = {
        chartData: {
          completionTrend: [],
          statusDistribution: [],
          roleDistribution: [],
        },
      };

      return res.status(200).json({
        status: 'success',
        data: {
          organization,
          users,
          stats,
          analytics,
          recentActivity,
        },
      });
    } catch (error) {
      logger.error('Admin dashboard error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch admin dashboard',
      });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get user-specific statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to fetch statistics.
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
        lastActive: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data based on user role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Invalid user role.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Failed to fetch dashboard data.
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Get user from database to check role
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Redirect to role-specific dashboard data
    let dashboardData;

    switch (user.role) {
      case 'BENEFICIARY': {
        const bilans = await getBilansByBeneficiary(user.id);
        const recommendations = await getRecommendationsByBeneficiary(user.id);

        const completedBilans = bilans.filter((b) => b.status === 'COMPLETED').length;
        const pendingBilans = bilans.filter((b) => b.status === 'INVESTIGATION').length;

        dashboardData = {
          role: 'BENEFICIARY',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          bilans: bilans || [],
          recommendations: recommendations || [],
          stats: {
            completedBilans,
            pendingBilans,
            totalRecommendations: recommendations?.length || 0,
          },
        };
        break;
      }

      case 'CONSULTANT': {
        const bilans = await getBilansByConsultant(user.id);
        const clients = await getClientsByConsultant(user.id);

        const activeBilans = bilans.filter((b) => b.status === 'INVESTIGATION').length;
        const completedBilans = bilans.filter((b) => b.status === 'COMPLETED').length;

        dashboardData = {
          role: 'CONSULTANT',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          bilans: bilans || [],
          clients: clients || [],
          stats: {
            activeBilans,
            completedBilans,
            totalClients: clients?.length || 0,
          },
        };
        break;
      }

      case 'ORG_ADMIN': {
        const allBilans = await getAllBilans();
        const orgStats = user.organization_id
          ? await getOrganizationStats(user.organization_id)
          : null;
        const recentActivity = user.organization_id
          ? await getRecentActivityByOrganization(user.organization_id)
          : [];

        dashboardData = {
          role: user.role,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          bilans: allBilans || [],
          stats: orgStats || {
            totalBilans: allBilans?.length || 0,
            activeBilans: allBilans?.filter((b) => b.status === 'INVESTIGATION').length || 0,
            completedBilans: allBilans?.filter((b) => b.status === 'COMPLETED').length || 0,
          },
          recentActivity: recentActivity || [],
        };
        break;
      }

      default:
        return res.status(403).json({
          status: 'error',
          message: 'Invalid user role',
        });
    }

    return res.status(200).json({
      status: 'success',
      data: dashboardData,
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
    });
  }
});

export default router;
