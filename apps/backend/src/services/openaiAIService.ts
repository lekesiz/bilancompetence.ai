/**
 * OpenAI GPT-4 AI Service
 *
 * This service provides integration with OpenAI's GPT-4 models for:
 * - Text generation and completion
 * - Code analysis and debugging
 * - Professional assessment support
 * - Career guidance and recommendations
 *
 * Part of the AI Team orchestration system for BilanCompetence.ai
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface OpenAIResponse {
  text: string;
  model: string;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIAIService {
  private client: OpenAI;
  private config: Required<OpenAIConfig>;

  constructor(config: OpenAIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gpt-4-turbo-preview',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 4096,
      topP: config.topP ?? 1.0,
      frequencyPenalty: config.frequencyPenalty ?? 0.0,
      presencePenalty: config.presencePenalty ?? 0.0,
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    });

    logger.info(`✅ OpenAI Service initialized with model: ${this.config.model}`);
  }

  /**
   * Generate a response from OpenAI GPT
   */
  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    options?: Partial<OpenAIConfig>
  ): Promise<OpenAIResponse> {
    try {
      const messages: OpenAIChatMessage[] = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model,
        messages,
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        top_p: options?.topP ?? this.config.topP,
        frequency_penalty: options?.frequencyPenalty ?? this.config.frequencyPenalty,
        presence_penalty: options?.presencePenalty ?? this.config.presencePenalty,
      });

      const choice = response.choices[0];

      return {
        text: choice.message.content || '',
        model: response.model,
        tokensUsed: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a response with conversation history
   */
  async chat(
    messages: OpenAIChatMessage[],
    options?: Partial<OpenAIConfig>
  ): Promise<OpenAIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model,
        messages,
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        top_p: options?.topP ?? this.config.topP,
        frequency_penalty: options?.frequencyPenalty ?? this.config.frequencyPenalty,
        presence_penalty: options?.presencePenalty ?? this.config.presencePenalty,
      });

      const choice = response.choices[0];

      return {
        text: choice.message.content || '',
        model: response.model,
        tokensUsed: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      logger.error('OpenAI chat error:', error);
      throw new Error(`OpenAI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze code for issues and improvements
   */
  async analyzeCode(
    code: string,
    language: string = 'typescript',
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are an expert ${language} developer specializing in code review and analysis.
Provide detailed, actionable feedback on code quality, potential bugs, performance issues, and best practices.`;

    const prompt = context
      ? `Context: ${context}\n\nAnalyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      : `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.3, // Lower temperature for more focused analysis
    });

    return response.text;
  }

  /**
   * Debug code and suggest fixes
   */
  async debugCode(
    code: string,
    error: string,
    language: string = 'typescript'
  ): Promise<string> {
    const systemPrompt = `You are an expert ${language} debugger.
Analyze the error, identify the root cause, and provide a clear explanation with a corrected code solution.`;

    const prompt = `Error: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nDebug this code and provide a fix.`;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.2, // Very low temperature for precise debugging
    });

    return response.text;
  }

  /**
   * Generate professional assessment insights
   */
  async generateAssessmentInsights(
    userData: {
      skills: string[];
      experience: string[];
      goals: string[];
      personality?: string;
    }
  ): Promise<string> {
    const systemPrompt = `You are a professional career counselor and skills assessment expert specializing in French professional development (bilan de compétences).
Provide thoughtful, personalized insights in French that help individuals understand their career potential and next steps.`;

    const prompt = `Génère des insights professionnels personnalisés pour ce profil:

**Compétences:**
${userData.skills.join(', ')}

**Expérience:**
${userData.experience.join('\n')}

**Objectifs:**
${userData.goals.join('\n')}

${userData.personality ? `**Personnalité:**\n${userData.personality}` : ''}

Fournis une analyse détaillée incluant:
1. Forces principales
2. Opportunités de développement
3. Pistes de carrière recommandées
4. Prochaines étapes concrètes`;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.8, // Higher temperature for creative insights
      maxTokens: 2048,
    });

    return response.text;
  }

  /**
   * Generate career recommendations
   */
  async generateCareerRecommendations(
    profile: {
      currentRole: string;
      skills: string[];
      interests: string[];
      experience: number;
      education: string;
    }
  ): Promise<string> {
    const systemPrompt = `You are a career guidance expert specializing in French employment market and professional transitions (bilan de compétences).
Provide realistic, actionable career recommendations in French based on current market trends.`;

    const prompt = `Génère des recommandations de carrière pour ce profil:

**Rôle actuel:** ${profile.currentRole}
**Compétences:** ${profile.skills.join(', ')}
**Intérêts:** ${profile.interests.join(', ')}
**Années d'expérience:** ${profile.experience}
**Formation:** ${profile.education}

Recommande:
1. 3-5 métiers correspondant au profil
2. Compétences à développer pour chaque métier
3. Formations ou certifications pertinentes
4. Estimation du potentiel salarial`;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.7,
      maxTokens: 3000,
    });

    return response.text;
  }

  /**
   * Generate documentation
   */
  async generateDocumentation(
    code: string,
    language: string = 'typescript',
    style: 'jsdoc' | 'markdown' | 'inline' = 'jsdoc'
  ): Promise<string> {
    const systemPrompt = `You are a technical documentation expert.
Generate clear, comprehensive ${style} documentation that follows best practices for ${language}.`;

    const prompt = `Generate ${style} documentation for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.3,
    });

    return response.text;
  }

  /**
   * Translate content
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<string> {
    const systemPrompt = `You are a professional translator specializing in ${sourceLang} to ${targetLang} translation.
Maintain tone, context, and cultural nuances while ensuring accuracy.`;

    const prompt = context
      ? `Context: ${context}\n\nTranslate from ${sourceLang} to ${targetLang}:\n\n${text}`
      : `Translate from ${sourceLang} to ${targetLang}:\n\n${text}`;

    const response = await this.generateResponse(prompt, systemPrompt, {
      temperature: 0.3,
    });

    return response.text;
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateResponse('Hello', 'You are a helpful assistant. Respond with a single word: OK', {
        maxTokens: 10,
        temperature: 0,
      });
      return response.text.includes('OK');
    } catch (error) {
      logger.error('OpenAI health check failed:', error);
      return false;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Omit<Required<OpenAIConfig>, 'apiKey'> {
    const { apiKey, ...config } = this.config;
    return config;
  }
}

// Singleton instance
let openaiService: OpenAIAIService | null = null;

export function initOpenAIService(config: OpenAIConfig): OpenAIAIService {
  if (!openaiService) {
    openaiService = new OpenAIAIService(config);
  }
  return openaiService;
}

export function getOpenAIService(): OpenAIAIService {
  if (!openaiService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI service not initialized and OPENAI_API_KEY not found');
    }
    openaiService = new OpenAIAIService({
      apiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096'),
    });
  }
  return openaiService;
}

export default OpenAIAIService;
