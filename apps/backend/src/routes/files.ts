import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  uploadFile,
  uploadAvatar,
  getUserFiles,
  deleteFile,
  uploadAssessmentDocument,
  getAssessmentDocuments,
  getDownloadUrl,
} from '../services/fileServiceNeon.js';

const router = Router();

/**
 * POST /api/files/upload
 * Upload a file
 */
router.post('/upload', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Note: In production, use multer middleware to handle file uploads
    // This is a placeholder for file handling
    const { fileName, fileType, bucket = 'files' } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing fileName or fileType',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'File upload endpoint ready. Use multer middleware in production.',
      data: {
        fileName,
        fileType,
        bucket,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload file',
    });
  }
});

/**
 * POST /api/files/avatar
 * Upload avatar
 */
router.post('/avatar', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // In production, extract file from multipart form data using multer
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing fileName',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Avatar upload endpoint ready. Use multer middleware.',
      data: {
        userId: req.user.id,
        fileName,
      },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload avatar',
    });
  }
});

/**
 * GET /api/files
 * Get user files
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 100;
    const files = await getUserFiles(req.user.id, limit);

    return res.status(200).json({
      status: 'success',
      data: files,
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch files',
    });
  }
});

/**
 * DELETE /api/files/:id
 * Delete file
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await deleteFile(id);
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'File deleted',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete file',
    });
  }
});

/**
 * GET /api/files/:id/download
 * Get signed download URL
 */
router.get('/:id/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const expirySeconds = parseInt(req.query.expires as string) || 3600;

    const downloadUrl = await getDownloadUrl(id, expirySeconds);

    return res.status(200).json({
      status: 'success',
      data: {
        downloadUrl,
        expiresIn: expirySeconds,
      },
    });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate download URL',
    });
  }
});

/**
 * POST /api/files/assessments/:assessmentId/upload
 * Upload assessment document
 */
router.post(
  '/assessments/:assessmentId/upload',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      const { assessmentId } = req.params;
      const { fileName, fileType } = req.body;

      if (!fileName || !fileType) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing fileName or fileType',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Document upload endpoint ready.',
        data: {
          assessmentId,
          fileName,
          fileType,
        },
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to upload document',
      });
    }
  }
);

/**
 * GET /api/files/assessments/:assessmentId/documents
 * Get assessment documents
 */
router.get(
  '/assessments/:assessmentId/documents',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;

      const documents = await getAssessmentDocuments(assessmentId);

      return res.status(200).json({
        status: 'success',
        data: documents,
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch documents',
      });
    }
  }
);

export default router;
