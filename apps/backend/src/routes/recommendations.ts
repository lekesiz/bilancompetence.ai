import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { FranceTravailService } from '../services/franceTravailService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Initialize France Travail Service
const franceTravailService = new FranceTravailService();

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Schema for job recommendation request
 */
const jobRecommendationSchema = z.object({
  competencyIds: z.array(z.string()).optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  location: z.string().optional(),
  contractTypes: z.array(z.string()).optional(),
  limit: z.number().default(10).optional(),
});

/**
 * Schema for saving a job
 */
const saveJobSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(['interested', 'applied', 'saved']).default('saved').optional(),
});

/**
 * Schema for ROME code search
 */
const romeCodeSearchSchema = z.object({
  query: z.string().min(1).max(255),
  limit: z.number().default(10).optional(),
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST /api/recommendations/jobs
 * Get job recommendations based on user competencies
 *
 * @requires Bearer token (authentication)
 * @param {string} req.user.id - User ID from JWT
 * @param {Object} req.body - Request body with filters
 * @returns {Object} Array of recommended jobs with scores
 */
router.post(
  '/jobs',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required',
        });
      }

      // Validate request body
      const validationResult = jobRecommendationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid request parameters',
          errors: validationResult.error.flatten(),
        });
      }

      const {
        competencyIds,
        minSalary,
        maxSalary,
        location,
        contractTypes,
        limit = 10,
      } = validationResult.data;

      logger.info(`Generating job recommendations for user ${userId}`);

      // Use findMatchingRomeCodes to get ROME codes for user
      let romeMatches: any[] = [];
      try {
        const romeCodeMatches = await franceTravailService.findMatchingRomeCodes(
          competencyIds && competencyIds.length > 0
            ? competencyIds.map(id => ({ name: id, level: 'intermediate' }))
            : []
        );
        romeMatches = romeCodeMatches;
      } catch (error) {
        logger.warn(`Could not find matching ROME codes: ${error}`);
        // Try using competencies directly if provided
        if (!competencyIds || competencyIds.length === 0) {
          return res.status(400).json({
            status: 'error',
            message:
              'No competencies found for user. Please complete your assessment first.',
          });
        }
      }

      if (romeMatches.length === 0 && (!competencyIds || competencyIds.length === 0)) {
        return res.status(400).json({
          status: 'error',
          message:
            'No matching job categories found for your competencies. Please try updating your skills.',
        });
      }

      // Search jobs for matching ROME codes
      const allJobs: any[] = [];
      const errors: string[] = [];
      const romeCodesToSearch = romeMatches.length > 0
        ? romeMatches.slice(0, 5).map(m => m.code)
        : [];

      for (const romeCode of romeCodesToSearch) {
        try {
          const searchResult = await franceTravailService.searchJobsByRomeCode(
            romeCode,
            {
              page: 1,
              minSalary,
              contractType: contractTypes?.[0],
              range: location,
            }
          );

          // Extract jobs from result
          if (searchResult.resultats && Array.isArray(searchResult.resultats)) {
            allJobs.push(...searchResult.resultats);
          }
        } catch (error) {
          logger.warn(`Error searching jobs for ROME code ${romeCode}`);
          errors.push(
            `Failed to fetch jobs for category ${romeCode.toUpperCase()}`
          );
        }
      }

      if (allJobs.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No jobs found matching your criteria',
          errors: errors.length > 0 ? errors : undefined,
        });
      }

      // Score and rank jobs
      let scoredJobs: any[] = [];
      try {
        scoredJobs = await franceTravailService.scoreJobMatches(
          userId,
          allJobs
        );

        // Sort by score descending and limit results
        scoredJobs = scoredJobs
          .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
          .slice(0, limit);
      } catch (error) {
        logger.error(`Error scoring jobs: ${error}`);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to score job recommendations',
        });
      }

      logger.info(
        `Generated ${scoredJobs.length} recommendations for user ${userId}`
      );

      return res.status(200).json({
        status: 'success',
        data: {
          recommendations: scoredJobs,
          count: scoredJobs.length,
          filters: {
            competencies: competencyIds || [],
            romeMatches: romeMatches.map((m) => ({
              code: m.code,
              label: m.libelle || m.label || '',
            })),
          },
        },
      });
    } catch (error) {
      logger.error(`Error in job recommendations endpoint: ${error}`);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred while generating recommendations',
      });
    }
  }
);

/**
 * POST /api/recommendations/:jobId/save
 * Save a job to user's saved list
 *
 * @requires Bearer token (authentication)
 * @param {string} req.params.jobId - Job ID
 * @param {string} req.user.id - User ID from JWT
 * @param {Object} req.body - Optional notes and status
 * @returns {Object} Saved job record
 */
router.post(
  '/:jobId/save',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required',
        });
      }

      if (!jobId) {
        return res.status(400).json({
          status: 'error',
          message: 'Job ID is required',
        });
      }

      // Validate request body
      const validationResult = saveJobSchema.safeParse(req.body || {});
      if (!validationResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid request parameters',
          errors: validationResult.error.flatten(),
        });
      }

      const { notes, status = 'saved' } = validationResult.data;

      logger.info(`Saving job ${jobId} for user ${userId}`);

      try {
        // Create job data object with minimum required fields
        const jobData = {
          id: jobId,
          intitule: 'Job Title',
          entreprise: 'Company',
          description: '',
          competences: [],
          typeContrat: 'CDI' as const,
          typePublicCible: [],
          dateCreation: new Date().toISOString(),
          lieuTravail: { codePostal: '', ville: '' },
          source: 'france_travail' as const,
        };

        const savedJobId = await franceTravailService.saveJobToUserList(
          userId,
          jobId,
          jobData,
          notes
        );

        logger.info(`Job ${jobId} saved successfully for user ${userId}`);

        return res.status(201).json({
          status: 'success',
          data: {
            id: savedJobId,
            jobId,
            userId,
            status,
            notes,
          },
        });
      } catch (error) {
        logger.error(`Error saving job to user list: ${error}`);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to save job',
        });
      }
    } catch (error) {
      logger.error(`Error in save job endpoint: ${error}`);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred while saving the job',
      });
    }
  }
);

/**
 * GET /api/recommendations/:userId/saved-jobs
 * Retrieve user's saved jobs
 *
 * @requires Bearer token (authentication)
 * @param {string} req.params.userId - User ID
 * @param {number} req.query.limit - Max results (default: 20)
 * @param {number} req.query.offset - Pagination offset (default: 0)
 * @returns {Object} Array of saved jobs
 */
router.get(
  '/:userId/saved-jobs',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;
      const limit = Math.min(
        Math.max(1, parseInt(req.query.limit as string) || 20),
        100
      );
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      // Authorization: users can only see their own saved jobs
      if (currentUserId !== userId) {
        const userRole = req.user?.role;
        if (userRole !== 'CONSULTANT' && userRole !== 'ORG_ADMIN') {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to view these jobs',
          });
        }
      }

      logger.info(`Fetching saved jobs for user ${userId}`);

      try {
        const page = Math.floor(offset / limit) + 1;
        const savedJobs = await franceTravailService.getUserSavedJobs(
          userId,
          limit,
          page
        );

        return res.status(200).json({
          status: 'success',
          data: {
            jobs: savedJobs,
            count: savedJobs.length,
            pagination: {
              limit,
              offset,
              page,
            },
          },
        });
      } catch (error) {
        logger.error(`Error fetching saved jobs: ${error}`);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to retrieve saved jobs',
        });
      }
    } catch (error) {
      logger.error(`Error in get saved jobs endpoint: ${error}`);
      return res.status(500).json({
        status: 'error',
        message: 'An unexpected error occurred while retrieving saved jobs',
      });
    }
  }
);

/**
 * GET /api/recommendations/rome-codes/:code
 * Get ROME code details
 *
 * @requires Bearer token (authentication)
 * @param {string} req.params.code - ROME code (e.g., "E1101")
 * @returns {Object} ROME code details with job count and salary range
 */
router.get(
  '/rome-codes/:code',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      if (!code || !/^[A-Z0-9]+$/.test(code)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid ROME code format',
        });
      }

      logger.info(`Fetching ROME code details for ${code}`);

      try {
        const romeDetails = await franceTravailService.getRomeCodeDetails(code);

        if (!romeDetails) {
          return res.status(404).json({
            status: 'error',
            message: `ROME code ${code} not found`,
          });
        }

        return res.status(200).json({
          status: 'success',
          data: romeDetails,
        });
      } catch (error) {
        logger.error(`Error fetching ROME code details: ${error}`);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to retrieve ROME code details',
        });
      }
    } catch (error) {
      logger.error(`Error in get ROME code endpoint: ${error}`);
      return res.status(500).json({
        status: 'error',
        message:
          'An unexpected error occurred while retrieving ROME code details',
      });
    }
  }
);

/**
 * GET /api/recommendations/rome-codes/search
 * Search ROME codes by keyword
 *
 * @requires Bearer token (authentication)
 * @param {string} req.query.query - Search query
 * @param {number} req.query.limit - Max results (default: 10)
 * @returns {Object} Array of matching ROME codes
 */
router.get(
  '/rome-codes/search',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      const limit = Math.min(
        Math.max(1, parseInt(req.query.limit as string) || 10),
        50
      );

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Search query is required',
        });
      }

      logger.info(`Searching ROME codes for query: "${query}"`);

      // Validate against schema
      const validationResult = romeCodeSearchSchema.safeParse({
        query,
        limit,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid search parameters',
          errors: validationResult.error.flatten(),
        });
      }

      try {
        const results = await franceTravailService.searchRomeCodes(
          query,
          limit
        );

        return res.status(200).json({
          status: 'success',
          data: {
            results,
            count: results.length,
            query,
          },
        });
      } catch (error) {
        logger.error(`Error searching ROME codes: ${error}`);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to search ROME codes',
        });
      }
    } catch (error) {
      logger.error(`Error in ROME code search endpoint: ${error}`);
      return res.status(500).json({
        status: 'error',
        message:
          'An unexpected error occurred while searching ROME codes',
      });
    }
  }
);

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler for unknown paths under /recommendations
 */
router.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

export default router;
