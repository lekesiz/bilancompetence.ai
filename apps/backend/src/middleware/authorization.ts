/**
 * Authorization Middleware
 * Vérifie que l'utilisateur a le droit d'accéder aux ressources
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Type de ressource à autoriser
 */
export type ResourceType =
  | 'bilan'
  | 'assessment'
  | 'appointment'
  | 'document'
  | 'cv_analysis'
  | 'job_recommendation'
  | 'personality_analysis'
  | 'action_plan';

/**
 * Interface pour les requêtes authentifiées
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' | 'ORGANIZATION_ADMIN' | 'ADMIN';
    organization_id?: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * Middleware d'autorisation basé sur les ressources
 * Vérifie que l'utilisateur a le droit d'accéder à la ressource demandée
 *
 * @param resourceType - Type de ressource à vérifier
 * @returns Middleware Express
 */
export const authorizeResource = (resourceType: ResourceType) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const userOrgId = req.user?.organization_id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      }

      // Les ORG_ADMIN ont accès à tout dans leur organisation
      // Les ADMIN ont accès à tout dans le système (super admin)

      // Récupérer l'ID de la ressource depuis les paramètres
      const resourceId =
        req.params.id ||
        req.params.bilanId ||
        req.params.assessmentId ||
        req.params.appointmentId ||
        req.params.documentId ||
        req.params.analysisId ||
        req.params.recommendationId ||
        req.params.planId;

      if (!resourceId) {
        return res.status(400).json({ error: 'Bad Request: Resource ID missing' });
      }

      // Vérifier l'autorisation selon le type de ressource
      const authorized = await checkAuthorization(
        resourceType,
        resourceId,
        userId,
        userRole,
        userOrgId
      );

      if (!authorized) {
        return res.status(403).json({
          error: 'Forbidden: You do not have access to this resource',
          resourceType,
          resourceId,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error during authorization' });
    }
  };
};

/**
 * Vérifie l'autorisation pour une ressource spécifique
 */
async function checkAuthorization(
  resourceType: ResourceType,
  resourceId: string,
  userId: string,
  userRole?: string,
  userOrgId?: string
): Promise<boolean> {
  switch (resourceType) {
    case 'bilan':
      return await checkBilanAuthorization(resourceId, userId, userRole, userOrgId);

    case 'assessment':
      return await checkAssessmentAuthorization(resourceId, userId, userRole);

    case 'appointment':
      return await checkAppointmentAuthorization(resourceId, userId, userRole);

    case 'document':
      return await checkDocumentAuthorization(resourceId, userId, userRole);

    case 'cv_analysis':
      return await checkCVAnalysisAuthorization(resourceId, userId, userRole);

    case 'job_recommendation':
      return await checkJobRecommendationAuthorization(resourceId, userId, userRole);

    case 'personality_analysis':
      return await checkPersonalityAnalysisAuthorization(resourceId, userId, userRole);

    case 'action_plan':
      return await checkActionPlanAuthorization(resourceId, userId, userRole);

    default:
      console.warn(`Unknown resource type: ${resourceType}`);
      return false;
  }
}

/**
 * Vérifie l'autorisation pour un bilan
 * - Bénéficiaire : peut accéder à ses propres bilans
 * - Consultant : peut accéder aux bilans qu'il gère
 * - Organization Admin : peut accéder aux bilans de son organisation
 */
async function checkBilanAuthorization(
  bilanId: string,
  userId: string,
  userRole?: string,
  userOrgId?: string
): Promise<boolean> {
  const { data: bilan, error } = await supabase
    .from('bilans')
    .select('beneficiary_id, consultant_id, organization_id')
    .eq('id', bilanId)
    .single();

  if (error || !bilan) {
    console.error('Error fetching bilan:', error);
    return false;
  }

  // Bénéficiaire peut accéder à son propre bilan
  if (bilan.beneficiary_id === userId) {
    return true;
  }

  // Consultant peut accéder aux bilans qu'il gère
  if (userRole === 'CONSULTANT' && bilan.consultant_id === userId) {
    return true;
  }

  // Organization Admin peut accéder aux bilans de son organisation
  if (userRole === 'ORG_ADMIN' && bilan.organization_id === userOrgId) {
    return true;
  }

  return false;
}

/**
 * Vérifie l'autorisation pour une évaluation
 * - Utilisateur : peut accéder à ses propres évaluations
 * - Consultant : peut accéder à toutes les évaluations
 */
async function checkAssessmentAuthorization(
  assessmentId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('user_id')
    .eq('id', assessmentId)
    .single();

  if (error || !assessment) {
    console.error('Error fetching assessment:', error);
    return false;
  }

  // L'utilisateur peut accéder à sa propre évaluation
  if (assessment.user_id === userId) {
    return true;
  }

  // Les consultants peuvent accéder à toutes les évaluations
  if (userRole === 'CONSULTANT') {
    return true;
  }

  return false;
}

/**
 * Vérifie l'autorisation pour un rendez-vous
 * - Bénéficiaire : peut accéder à ses propres rendez-vous
 * - Consultant : peut accéder aux rendez-vous qu'il anime
 */
async function checkAppointmentAuthorization(
  appointmentId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('beneficiary_id, consultant_id')
    .eq('id', appointmentId)
    .single();

  if (error || !appointment) {
    console.error('Error fetching appointment:', error);
    return false;
  }

  // Bénéficiaire ou consultant concerné
  return appointment.beneficiary_id === userId || appointment.consultant_id === userId;
}

/**
 * Vérifie l'autorisation pour un document
 * - Propriétaire : peut accéder à ses propres documents
 * - Consultant : peut accéder aux documents des bilans qu'il gère
 */
async function checkDocumentAuthorization(
  documentId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: document, error } = await supabase
    .from('documents')
    .select('user_id, bilan_id')
    .eq('id', documentId)
    .single();

  if (error || !document) {
    console.error('Error fetching document:', error);
    return false;
  }

  // L'utilisateur peut accéder à ses propres documents
  if (document.user_id === userId) {
    return true;
  }

  // Si le document est lié à un bilan, vérifier l'accès au bilan
  if (document.bilan_id) {
    return await checkBilanAuthorization(document.bilan_id, userId, userRole);
  }

  return false;
}

/**
 * Vérifie l'autorisation pour une analyse de CV
 */
async function checkCVAnalysisAuthorization(
  analysisId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: analysis, error } = await supabase
    .from('cv_analyses')
    .select('user_id')
    .eq('id', analysisId)
    .single();

  if (error || !analysis) {
    console.error('Error fetching CV analysis:', error);
    return false;
  }

  return analysis.user_id === userId || userRole === 'CONSULTANT';
}

/**
 * Vérifie l'autorisation pour une recommandation d'emploi
 */
async function checkJobRecommendationAuthorization(
  recommendationId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: recommendation, error } = await supabase
    .from('job_recommendations')
    .select('user_id')
    .eq('id', recommendationId)
    .single();

  if (error || !recommendation) {
    console.error('Error fetching job recommendation:', error);
    return false;
  }

  return recommendation.user_id === userId || userRole === 'CONSULTANT';
}

/**
 * Vérifie l'autorisation pour une analyse de personnalité
 */
async function checkPersonalityAnalysisAuthorization(
  analysisId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: analysis, error } = await supabase
    .from('personality_analyses')
    .select('user_id')
    .eq('id', analysisId)
    .single();

  if (error || !analysis) {
    console.error('Error fetching personality analysis:', error);
    return false;
  }

  return analysis.user_id === userId || userRole === 'CONSULTANT';
}

/**
 * Vérifie l'autorisation pour un plan d'action
 */
async function checkActionPlanAuthorization(
  planId: string,
  userId: string,
  userRole?: string
): Promise<boolean> {
  const { data: plan, error } = await supabase
    .from('action_plans')
    .select('user_id')
    .eq('id', planId)
    .single();

  if (error || !plan) {
    console.error('Error fetching action plan:', error);
    return false;
  }

  return plan.user_id === userId || userRole === 'CONSULTANT';
}

/**
 * Middleware pour vérifier que l'utilisateur a un rôle spécifique
 *
 * @param allowedRoles - Rôles autorisés
 * @returns Middleware Express
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized: User role not found' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole,
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur appartient à une organisation
 */
export const requireOrganization = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userOrgId = req.user?.organization_id;

    if (!userOrgId) {
      return res.status(403).json({
        error: 'Forbidden: User must belong to an organization',
      });
    }

    next();
  };
};

export default {
  authorizeResource,
  requireRole,
  requireOrganization,
};
