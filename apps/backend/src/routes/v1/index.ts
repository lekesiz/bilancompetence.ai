import { Router } from 'express';
import authRoutes from '../auth.js';
import parcoursRoutes from '../parcours.js';
import testsRoutes from '../tests.js';
import aiRoutes from '../ai.js';
import documentsRoutes from '../documents.js';
import chatRoutes from '../chat.js';
import paymentsRoutes from '../payments.js';
import schedulingRoutes from '../scheduling.js';
import wedofRoutes from '../wedof.js';
import pennylaneRoutes from '../pennylane.js';

/**
 * API v1 Router
 * All v1 endpoints are prefixed with /api/v1
 */
const v1Router = Router();

// Mount all route modules
v1Router.use('/auth', authRoutes);
v1Router.use('/parcours', parcoursRoutes);
v1Router.use('/tests', testsRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/documents', documentsRoutes);
v1Router.use('/messages', chatRoutes);
v1Router.use('/payments', paymentsRoutes);
v1Router.use('/scheduling', schedulingRoutes);
v1Router.use('/wedof', wedofRoutes);
v1Router.use('/pennylane', pennylaneRoutes);

export default v1Router;
