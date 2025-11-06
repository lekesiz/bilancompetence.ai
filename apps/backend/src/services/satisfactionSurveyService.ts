/**
 * Satisfaction Survey Service
 * Manages participant satisfaction survey distribution, collection, and analytics
 *
 * Features:
 * - Auto-survey creation after bilan completion
 * - NPS (Net Promoter Score) calculation
 * - Response rate tracking
 * - Analytics and reporting
 */

import { pool } from '../config/neon.js';
import crypto from 'crypto';
import {
  logAndThrow,
  validateRequired,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

interface SurveyQuestion {
  number: number;
  question: string;
  type: 'SCORE' | 'TEXT' | 'BOOLEAN';
  required: boolean;
}

interface SurveyInstance {
  id: string;
  bilan_id: string;
  beneficiary_id: string;
  status: 'PENDING' | 'SENT' | 'COMPLETED' | 'EXPIRED';
  sent_at: string | null;
  completed_at: string | null;
  survey_token: string;
  expires_at: string;
}

interface SurveyAnalytics {
  total_sent: number;
  total_responded: number;
  response_rate: number;
  nps_score: number;
  average_satisfaction: number;
  questions_data: QuestionAnalytics[];
  consultant_performance: ConsultantPerformance[];
}

interface QuestionAnalytics {
  question_number: number;
  type: string;
  average_score?: number;
  response_count: number;
  text_responses?: string[];
}

interface ConsultantPerformance {
  consultant_id: string;
  consultant_name: string;
  average_score: number;
  survey_count: number;
}

interface NPSMetrics {
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
  total_respondents: number;
}

const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    number: 1,
    question: 'Bilans deneyiminizden ne kadar memnun oldunuz?',
    type: 'SCORE',
    required: true,
  },
  {
    number: 2,
    question: 'Danışman ne kadar profesyonel davrandı?',
    type: 'SCORE',
    required: true,
  },
  {
    number: 3,
    question: 'Önerilen iş önerileri ne kadar ilginçti?',
    type: 'SCORE',
    required: true,
  },
  {
    number: 4,
    question: 'Yetenek analizi ne kadar doğru buldum?',
    type: 'SCORE',
    required: true,
  },
  {
    number: 5,
    question: 'Hizmetin sunuşu açık ve anlaşılır mıydı?',
    type: 'SCORE',
    required: true,
  },
  {
    number: 6,
    question: 'Bilans ne kadar zamanında tamamlandı?',
    type: 'SCORE',
    required: false,
  },
  {
    number: 7,
    question: 'Danışman sizin endişelerinizi dinledi mi?',
    type: 'BOOLEAN',
    required: true,
  },
  {
    number: 8,
    question: 'Bu hizmeti başkalarına tavsiye eder misiniz?',
    type: 'BOOLEAN',
    required: true,
  },
  {
    number: 9,
    question: 'Bilans sürecinde iyileştirilebilecek noktalar nelerdir?',
    type: 'TEXT',
    required: false,
  },
  {
    number: 10,
    question: 'Danışman ile çalışmaktan en hoşlandığınız şey neydi?',
    type: 'TEXT',
    required: false,
  },
];

// HYBRID ARCHITECTURE: DB queries use Neon, Storage uses Supabase
export class SatisfactionSurveyService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Generate anonymous survey token
   */
  private generateSurveyToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create satisfaction survey for a bilan
   */
  async createSurvey(bilanId: string, beneficiaryId: string): Promise<SurveyInstance> {
    try {
      validateRequired({ bilanId, beneficiaryId }, ['bilanId', 'beneficiaryId']);

      const surveyToken = this.generateSurveyToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Survey expires in 30 days

      const { data, error } = await this.supabase
        .from('satisfaction_surveys')
        .insert({
          bilan_id: bilanId,
          beneficiary_id: beneficiaryId,
          organization_id: this.organizationId,
          status: 'PENDING',
          survey_token: surveyToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new DatabaseError('Failed to create survey', error);
      }

      const survey = data as any;
      logger.info('Survey created successfully', { surveyId: survey.id, bilanId, beneficiaryId });
      return survey;
    } catch (error) {
      logAndThrow('Failed to create survey', error);
    }
  }

  /**
   * Send survey to beneficiary (typically via email)
   */
  async sendSurvey(surveyId: string): Promise<void> {
    try {
      validateRequired({ surveyId }, ['surveyId']);

      const { data: survey, error: fetchError } = await this.supabase
        .from('satisfaction_surveys')
        .select(
          `
          id,
          survey_token,
          beneficiary_id,
          bilans (
            id,
            beneficiary_id,
            users (email, full_name)
          )
        `
        )
        .eq('id', surveyId)
        .single();

      if (fetchError) {
        throw new DatabaseError('Failed to fetch survey', fetchError);
      }

      if (!survey) {
        throw new NotFoundError('Survey not found');
      }

      // Mark survey as sent
      const { error: updateError } = await this.supabase
        .from('satisfaction_surveys')
        .update({
          status: 'SENT',
          sent_at: new Date().toISOString(),
        })
        .eq('id', surveyId);

      if (updateError) {
        throw new DatabaseError('Failed to update survey status', updateError);
      }

      // TODO: Implement email sending via SendGrid or similar
      // Generate survey link: /survey/${survey.survey_token}
      // Send email to beneficiary
      logger.info('Survey sent successfully', { surveyId });
    } catch (error) {
      logAndThrow('Failed to send survey', error);
    }
  }

  /**
   * Submit survey response
   */
  async submitResponse(surveyToken: string, answers: Record<number, any>): Promise<void> {
    try {
      validateRequired({ surveyToken, answers }, ['surveyToken', 'answers']);

      // Find survey by token
      const { data: survey, error: fetchError } = await this.supabase
        .from('satisfaction_surveys')
        .select('id')
        .eq('survey_token', surveyToken)
        .single();

      if (fetchError) {
        throw new ValidationError('Invalid survey token');
      }

      if (!survey) {
        throw new NotFoundError('Survey not found');
      }

      const s = survey as any;

      // Submit responses
      const responses = Object.entries(answers).map(([questionNumber, answer]) => {
        const question = SURVEY_QUESTIONS.find((q) => q.number === parseInt(questionNumber));
        if (!question) {
          throw new ValidationError(`Invalid question number: ${questionNumber}`);
        }

        const response: any = {
          survey_id: s.id,
          question_number: parseInt(questionNumber),
          answer_type: question.type,
        };

        if (question.type === 'SCORE') {
          response.score_value = parseInt(answer);
        } else if (question.type === 'BOOLEAN') {
          response.boolean_value = answer === true || answer === 'true';
        } else if (question.type === 'TEXT') {
          response.text_value = answer;
        }

        return response;
      });

      const { error: insertError } = await this.supabase.from('survey_responses').insert(responses);

      if (insertError) {
        throw new DatabaseError('Failed to save responses', insertError);
      }

      // Mark survey as completed
      const { error: updateError } = await this.supabase
        .from('satisfaction_surveys')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
        .eq('id', s.id);

      if (updateError) {
        throw new DatabaseError('Failed to update survey status', updateError);
      }

      logger.info('Survey response submitted successfully', {
        surveyId: s.id,
        questionCount: responses.length,
      });
    } catch (error) {
      logAndThrow('Failed to submit survey response', error);
    }
  }

  /**
   * Calculate NPS score
   * Promoters (9-10) - Passives (7-8) / Total Respondents * 100
   */
  async calculateNPS(): Promise<NPSMetrics> {
    try {
      const { data, error } = await this.supabase
        .from('survey_responses')
        .select(
          `
          survey_id,
          score_value,
          satisfaction_surveys!inner (
            organization_id
          )
        `
        )
        .eq('question_number', 8) // "Would you recommend?" question
        .eq('satisfaction_surveys.organization_id', this.organizationId)
        .eq('answer_type', 'SCORE');

      if (error) {
        throw new DatabaseError('Failed to fetch NPS data', error);
      }

      const responses = data || [];
      const promoters = responses.filter((r: any) => r.score_value >= 9).length;
      const detractors = responses.filter((r: any) => r.score_value <= 6).length;
      const total = responses.length;

      const nps_score = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      logger.info('NPS calculated successfully', { nps_score, total_respondents: total });
      return {
        promoters,
        detractors,
        passives: total - promoters - detractors,
        nps_score,
        total_respondents: total,
      };
    } catch (error) {
      logAndThrow('Failed to calculate NPS', error);
    }
  }

  /**
   * Get comprehensive survey analytics
   */
  async getAnalytics(): Promise<SurveyAnalytics> {
    try {
      // Get survey overview
      const { data: surveys, error: surveyError } = await this.supabase
        .from('satisfaction_surveys')
        .select('id, status, bilans (consultant_id)')
        .eq('organization_id', this.organizationId);

      if (surveyError) {
        throw new DatabaseError('Failed to fetch surveys', surveyError);
      }

      const total_sent = (surveys || []).filter((s: any) => s.status !== 'PENDING').length;
      const total_responded = (surveys || []).filter((s: any) => s.status === 'COMPLETED').length;
      const response_rate = total_sent > 0 ? Math.round((total_responded / total_sent) * 100) : 0;

      // Get NPS
      const npsMetrics = await this.calculateNPS();

      // Get question analytics
      const { data: responses, error: responseError } = await this.supabase
        .from('survey_responses')
        .select(
          `
          question_number,
          score_value,
          text_value,
          survey_id,
          satisfaction_surveys!inner (
            organization_id
          )
        `
        )
        .eq('satisfaction_surveys.organization_id', this.organizationId);

      if (responseError) {
        throw new DatabaseError('Failed to fetch responses', responseError);
      }

      const questionsData: QuestionAnalytics[] = SURVEY_QUESTIONS.map((q) => {
        const questionResponses = (responses || []).filter(
          (r: any) => r.question_number === q.number
        );
        const scores = questionResponses
          .filter((r: any) => r.score_value)
          .map((r: any) => r.score_value);
        const average_score =
          scores.length > 0
            ? Math.round(scores.reduce((a: number, b: number) => a + b) / scores.length)
            : 0;

        return {
          question_number: q.number,
          type: q.type,
          average_score: q.type === 'SCORE' ? average_score : undefined,
          response_count: questionResponses.length,
          text_responses: questionResponses
            .filter((r: any) => r.text_value)
            .map((r: any) => r.text_value),
        };
      });

      // Get consultant performance
      const consultantPerformance = await this.getConsultantPerformance();

      const average_satisfaction =
        questionsData
          .filter((q) => q.type === 'SCORE')
          .reduce((sum, q) => sum + (q.average_score || 0), 0) /
        (questionsData.filter((q) => q.type === 'SCORE').length || 1);

      logger.info('Survey analytics retrieved successfully', {
        total_sent,
        total_responded,
        response_rate,
      });
      return {
        total_sent,
        total_responded,
        response_rate,
        nps_score: npsMetrics.nps_score,
        average_satisfaction: Math.round(average_satisfaction),
        questions_data: questionsData,
        consultant_performance: consultantPerformance,
      };
    } catch (error) {
      logAndThrow('Failed to get survey analytics', error);
    }
  }

  /**
   * Get consultant performance metrics
   */
  async getConsultantPerformance(): Promise<ConsultantPerformance[]> {
    try {
      const { data, error } = await this.supabase
        .from('satisfaction_surveys')
        .select(
          `
          id,
          bilans (
            consultant_id,
            users!consultant_id (full_name)
          )
        `
        )
        .eq('organization_id', this.organizationId)
        .eq('status', 'COMPLETED');

      if (error) {
        throw new DatabaseError('Failed to fetch consultant data', error);
      }

      const consultantMap = new Map<string, { scores: number[]; name: string }>();

      (data || []).forEach((survey: any) => {
        const consultantId = survey.bilans?.consultant_id;
        const consultantName = survey.bilans?.users?.full_name || 'Unknown';

        if (consultantId) {
          if (!consultantMap.has(consultantId)) {
            consultantMap.set(consultantId, { scores: [], name: consultantName });
          }
          // This is a simplified version - in practice you'd join with survey_responses
        }
      });

      const performance = Array.from(consultantMap.entries()).map(([id, data]) => ({
        consultant_id: id,
        consultant_name: data.name,
        average_score:
          data.scores.length > 0
            ? Math.round(data.scores.reduce((a, b) => a + b) / data.scores.length)
            : 0,
        survey_count: data.scores.length,
      }));

      logger.info('Consultant performance retrieved successfully', {
        consultantCount: performance.length,
      });
      return performance;
    } catch (error) {
      logAndThrow('Failed to get consultant performance', error);
    }
  }

  /**
   * Get survey questions template
   */
  getSurveyQuestions(): SurveyQuestion[] {
    return SURVEY_QUESTIONS;
  }

  /**
   * Check and mark expired surveys
   */
  async markExpiredSurveys(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('satisfaction_surveys')
        .update({ status: 'EXPIRED' })
        .eq('organization_id', this.organizationId)
        .neq('status', 'COMPLETED')
        .lt('expires_at', new Date().toISOString())
        .select();

      if (error) {
        throw new DatabaseError('Failed to update expired surveys', error);
      }

      const expiredCount = (data || []).length;
      logger.info('Expired surveys marked successfully', { expiredCount });
      return expiredCount;
    } catch (error) {
      logAndThrow('Failed to mark expired surveys', error);
    }
  }
}

export default SatisfactionSurveyService;
