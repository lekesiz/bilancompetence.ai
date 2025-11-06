import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getUserById } from '../services/userServiceNeon.js';
import {
  getBilansByBeneficiary,
  getRecommendationsByBeneficiary,
  getBilansByConsultant,
  getClientsByConsultant,
  getAllBilans,
  getOrganizationStats,
  getRecentActivityByOrganization,
} from '../services/dashboardServiceNeon.js';
import { BilanStatus } from '../types/enums.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/dashboard/beneficiary:
 *   get:
 *     summary: Get beneficiary dashboard
 *     description: Retrieve beneficiary's assessments, recommendations, and stats
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Beneficiary dashboard data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
      const completedBilans = bilans.filter((b) => b.status === BilanStatus.COMPLETED).length;
      const pendingBilans = bilans.filter(
        (b) => b.status !== BilanStatus.COMPLETED && b.status !== BilanStatus.ARCHIVED
      ).length;

      return res.status(200).json({
        status: 'success',
        data: {
          bilans,
          recommendations,
          stats: {
            totalBilans: bilans.length,
            completedBilans,
            pendingBilans,
            averageSatisfaction:
              bilans.length > 0
                ? Math.round(
                    (bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0) /
                      bilans.length) *
                      10
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
  }
);

/**
 * @swagger
 * /api/dashboard/consultant:
 *   get:
 *     summary: Get consultant dashboard
 *     description: Retrieve consultant's assessments, clients, and stats
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consultant dashboard data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
      const completedBilans = bilans.filter((b) => b.status === BilanStatus.COMPLETED).length;
      const activeBilans = bilans.filter(
        (b) =>
          b.status === BilanStatus.PRELIMINARY ||
          b.status === BilanStatus.INVESTIGATION ||
          b.status === BilanStatus.CONCLUSION
      ).length;
      const averageSatisfaction =
        bilans.length > 0
          ? Math.round(
              (bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0) / bilans.length) * 10
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
  }
);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     description: Retrieve organization-wide stats and recent activity (ORG_ADMIN only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
  }
);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get role-based dashboard
 *     description: Automatically return dashboard data based on user role (BENEFICIARY, CONSULTANT, ORG_ADMIN)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data for user's role
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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

        const completedBilans = bilans.filter(
          (b: any) => b.status === BilanStatus.COMPLETED
        ).length;
        const pendingBilans = bilans.filter(
          (b: any) => b.status === BilanStatus.INVESTIGATION
        ).length;

        dashboardData = {
          role: 'BENEFICIARY',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            email_verified: !!user.email_verified_at,
            last_login: user.last_login_at,
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

        const activeBilans = bilans.filter(
          (b: any) => b.status === BilanStatus.INVESTIGATION
        ).length;
        const completedBilans = bilans.filter(
          (b: any) => b.status === BilanStatus.COMPLETED
        ).length;

        dashboardData = {
          role: 'CONSULTANT',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            email_verified: !!user.email_verified_at,
            last_login: user.last_login_at,
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
            email_verified: !!user.email_verified_at,
            last_login: user.last_login_at,
          },
          bilans: allBilans || [],
          stats: orgStats || {
            totalBilans: allBilans?.length || 0,
            activeBilans:
              allBilans?.filter((b: any) => b.status === BilanStatus.INVESTIGATION).length || 0,
            completedBilans:
              allBilans?.filter((b: any) => b.status === BilanStatus.COMPLETED).length || 0,
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
    console.error('Dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
    });
  }
});

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
