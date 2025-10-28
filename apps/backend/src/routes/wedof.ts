import { Router, Request, Response } from 'express';
import wedofService from '../services/wedofService.js';

const router = Router();

// ============================================
// REGISTRATION FOLDERS
// ============================================

/**
 * GET /api/wedof/folders/:reference
 * Get registration folder by reference number (N° dossier)
 */
router.get('/folders/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const folder = await wedofService.getRegistrationFolderByReference(reference);
    res.json({ success: true, data: folder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/wedof/folders
 * List all registration folders
 */
router.get('/folders', async (req: Request, res: Response) => {
  try {
    const { state, limit, offset } = req.query;
    const folders = await wedofService.listRegistrationFolders({
      state: state as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data: folders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/folders
 * Create registration folder
 */
router.post('/folders', async (req: Request, res: Response) => {
  try {
    const folder = await wedofService.createRegistrationFolder(req.body);
    res.json({ success: true, data: folder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/wedof/folders/:id
 * Update registration folder
 */
router.patch('/folders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const folder = await wedofService.updateRegistrationFolder(id, req.body);
    res.json({ success: true, data: folder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/folders/:id/entree-formation
 * Declare "Entrée en formation"
 */
router.post('/folders/:id/entree-formation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date } = req.body;

    if (!start_date) {
      return res.status(400).json({ success: false, error: 'start_date is required' });
    }

    const result = await wedofService.declareEntreeFormation(id, start_date);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/folders/:id/sortie-formation
 * Declare "Sortie de formation"
 */
router.post('/folders/:id/sortie-formation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { end_date } = req.body;

    if (!end_date) {
      return res.status(400).json({ success: false, error: 'end_date is required' });
    }

    const result = await wedofService.declareSortieFormation(id, end_date);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/folders/:id/service-fait
 * Declare "Service fait"
 */
router.post('/folders/:id/service-fait', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await wedofService.declareServiceFait(id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ATTENDEES
// ============================================

/**
 * GET /api/wedof/attendees/:id
 * Get attendee by ID
 */
router.get('/attendees/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attendee = await wedofService.getAttendee(id);
    res.json({ success: true, data: attendee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/wedof/attendees
 * List attendees
 */
router.get('/attendees', async (req: Request, res: Response) => {
  try {
    const { email, limit, offset } = req.query;
    const attendees = await wedofService.listAttendees({
      email: email as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data: attendees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/attendees
 * Create attendee
 */
router.post('/attendees', async (req: Request, res: Response) => {
  try {
    const attendee = await wedofService.createAttendee(req.body);
    res.json({ success: true, data: attendee });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TRAINING ACTIONS & SESSIONS
// ============================================

/**
 * GET /api/wedof/training-actions
 * List training actions
 */
router.get('/training-actions', async (req: Request, res: Response) => {
  try {
    const actions = await wedofService.listTrainingActions(req.query);
    res.json({ success: true, data: actions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/wedof/sessions
 * List sessions
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const sessions = await wedofService.listSessions(req.query);
    res.json({ success: true, data: sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// WEBHOOKS
// ============================================

/**
 * GET /api/wedof/webhooks
 * List webhooks
 */
router.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const webhooks = await wedofService.listWebhooks();
    res.json({ success: true, data: webhooks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/wedof/webhooks
 * Create webhook
 */
router.post('/webhooks', async (req: Request, res: Response) => {
  try {
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'url and events array are required',
      });
    }

    const webhook = await wedofService.createWebhook({ url, events });
    res.json({ success: true, data: webhook });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/wedof/webhooks/:id
 * Delete webhook
 */
router.delete('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await wedofService.deleteWebhook(id);
    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * POST /api/wedof/sync/import-folder
 * Import registration folder from Wedof to our system
 */
router.post('/sync/import-folder', async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'reference is required' });
    }

    // Get folder from Wedof
    const folder = await wedofService.getRegistrationFolderByReference(reference);

    // Get attendee details
    const attendee = await wedofService.getAttendee(folder.attendee_id);

    // TODO: Save to our database
    // This would typically involve creating/updating records in Supabase

    res.json({
      success: true,
      data: {
        folder,
        attendee,
      },
      message: 'Folder imported successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
