import { Router, Request, Response } from 'express';
import { createPDFGenerator } from '../services/pdfGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = Router();

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure documents directory exists
const DOCUMENTS_DIR = path.join(__dirname, '../../documents');
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

/**
 * POST /api/documents/synthese
 * Generate Synthèse de Bilan PDF
 */
router.post('/synthese', async (req: Request, res: Response) => {
  try {
    const { user, assessment, testResults, actionPlan } = req.body;

    if (!user || !assessment) {
      return res.status(400).json({ error: 'Missing required fields: user, assessment' });
    }

    const pdfGenerator = createPDFGenerator(DOCUMENTS_DIR);
    const filepath = await pdfGenerator.generateSynthese(user, assessment, testResults, actionPlan);

    res.json({
      message: 'Synthèse generated successfully',
      filename: path.basename(filepath),
      downloadUrl: `/api/documents/download/${path.basename(filepath)}`
    });

  } catch (error: any) {
    console.error('Synthese generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/documents/attestation
 * Generate Attestation de Réalisation PDF
 */
router.post('/attestation', async (req: Request, res: Response) => {
  try {
    const { user, assessment, consultant } = req.body;

    if (!user || !assessment || !consultant) {
      return res.status(400).json({ error: 'Missing required fields: user, assessment, consultant' });
    }

    const pdfGenerator = createPDFGenerator(DOCUMENTS_DIR);
    const filepath = await pdfGenerator.generateAttestation(user, assessment, consultant);

    res.json({
      message: 'Attestation generated successfully',
      filename: path.basename(filepath),
      downloadUrl: `/api/documents/download/${path.basename(filepath)}`
    });

  } catch (error: any) {
    console.error('Attestation generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/documents/action-plan
 * Generate Plan d'Action PDF
 */
router.post('/action-plan', async (req: Request, res: Response) => {
  try {
    const { user, actionPlan } = req.body;

    if (!user || !actionPlan) {
      return res.status(400).json({ error: 'Missing required fields: user, actionPlan' });
    }

    const pdfGenerator = createPDFGenerator(DOCUMENTS_DIR);
    const filepath = await pdfGenerator.generateActionPlan(user, actionPlan);

    res.json({
      message: 'Action plan generated successfully',
      filename: path.basename(filepath),
      downloadUrl: `/api/documents/download/${path.basename(filepath)}`
    });

  } catch (error: any) {
    console.error('Action plan generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/download/:filename
 * Download generated PDF
 */
router.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(DOCUMENTS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Download failed' });
      }
    });

  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/documents/list
 * List all generated documents
 */
router.get('/list', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(DOCUMENTS_DIR);
    const documents = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const stats = fs.statSync(path.join(DOCUMENTS_DIR, file));
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          downloadUrl: `/api/documents/download/${file}`
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ documents });

  } catch (error: any) {
    console.error('List documents error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/documents/:filename
 * Delete a generated document
 */
router.delete('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(DOCUMENTS_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filepath);

    res.json({ message: 'Document deleted successfully' });

  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

