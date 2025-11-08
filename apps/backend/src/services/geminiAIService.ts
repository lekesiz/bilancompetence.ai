/**
 * Gemini AI Service
 * Google's Gemini API integration for AI Team collaboration
 *
 * Features:
 * - Multi-modal AI capabilities (text, image, video)
 * - Fast response times with gemini-2.0-flash-exp
 * - Structured output support
 * - Token counting and cost tracking
 *
 * @module services/geminiAIService
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string | { text: string }[];
}

export interface GeminiResponse {
  text: string;
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  safetyRatings?: any[];
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      model: config.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      temperature: config.temperature || Number(process.env.GEMINI_TEMPERATURE) || 0.7,
      maxTokens: config.maxTokens || Number(process.env.GEMINI_MAX_TOKENS) || 2048,
      topP: config.topP || 0.95,
      topK: config.topK || 40,
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.model });
  }

  /**
   * Generate a response from Gemini
   */
  async generateResponse(prompt: string, systemPrompt?: string): Promise<GeminiResponse> {
    try {
      const generationConfig: GenerationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      };

      // Combine system prompt with user prompt if provided
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser: ${prompt}`
        : prompt;

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      return {
        text,
        tokensUsed: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      console.error('[GeminiAIService] Error generating response:', error);
      throw error;
    }
  }

  /**
   * Chat conversation with context
   */
  async chat(messages: GeminiMessage[], systemPrompt?: string): Promise<GeminiResponse> {
    try {
      const chat = this.model.startChat({
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
          topP: this.config.topP,
          topK: this.config.topK,
        },
        history: systemPrompt
          ? [
              { role: 'user', parts: [{ text: systemPrompt }] },
              { role: 'model', parts: [{ text: 'Understood. I\'m ready to assist.' }] },
              ...messages.slice(0, -1).map(msg => ({
                role: msg.role,
                parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }],
              }))
            ]
          : messages.slice(0, -1).map(msg => ({
              role: msg.role,
              parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }],
            })),
      });

      const lastMessage = messages[messages.length - 1];
      const lastMessageText = Array.isArray(lastMessage.parts)
        ? lastMessage.parts.map(p => typeof p === 'string' ? p : p.text).join(' ')
        : lastMessage.parts;

      const result = await chat.sendMessage(lastMessageText);
      const response = result.response;
      const text = response.text();

      return {
        text,
        tokensUsed: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error) {
      console.error('[GeminiAIService] Error in chat:', error);
      throw error;
    }
  }

  /**
   * Analyze code or technical content
   */
  async analyzeCode(code: string, language: string, task: string): Promise<GeminiResponse> {
    const systemPrompt = `You are an expert code analyzer specializing in ${language}.
Your task is to: ${task}

Provide detailed, technical analysis with specific recommendations.
Format your response in clear sections with code examples where applicable.`;

    return this.generateResponse(`\`\`\`${language}\n${code}\n\`\`\``, systemPrompt);
  }

  /**
   * Debug assistance
   */
  async debugAssistance(
    code: string,
    error: string,
    language: string
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are a debugging expert for ${language}.
Analyze the error and code, then provide:
1. Root cause analysis
2. Step-by-step solution
3. Prevention strategies
4. Code example of the fix`;

    const prompt = `Code:
\`\`\`${language}
${code}
\`\`\`

Error:
\`\`\`
${error}
\`\`\`

Please help debug this issue.`;

    return this.generateResponse(prompt, systemPrompt);
  }

  /**
   * Document generation
   */
  async generateDocumentation(
    code: string,
    language: string,
    style: 'jsdoc' | 'markdown' | 'inline' = 'jsdoc'
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are a technical documentation expert.
Generate comprehensive ${style} documentation for the provided code.
Include:
- Function/class descriptions
- Parameter descriptions with types
- Return value descriptions
- Usage examples
- Edge cases and notes`;

    return this.generateResponse(`\`\`\`${language}\n${code}\n\`\`\``, systemPrompt);
  }

  /**
   * Code review
   */
  async reviewCode(
    code: string,
    language: string,
    focusAreas: string[] = ['security', 'performance', 'best-practices']
  ): Promise<GeminiResponse> {
    const systemPrompt = `You are a senior code reviewer with expertise in ${language}.
Focus on: ${focusAreas.join(', ')}

Provide structured feedback:
1. ✅ Strengths
2. ⚠️ Issues (with severity: critical, major, minor)
3. 💡 Suggestions for improvement
4. 📝 Code examples for fixes`;

    return this.generateResponse(`\`\`\`${language}\n${code}\n\`\`\``, systemPrompt);
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      provider: 'Google Gemini',
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      capabilities: [
        'text-generation',
        'chat',
        'code-analysis',
        'multi-modal (text, image, video)',
        'structured-output',
      ],
    };
  }

  /**
   * Count tokens (approximate)
   */
  async countTokens(text: string): Promise<number> {
    try {
      const result = await this.model.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('[GeminiAIService] Error counting tokens:', error);
      // Fallback: rough estimate (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
  }
}

// Singleton instance
let geminiInstance: GeminiAIService | null = null;

export const getGeminiService = (config?: Partial<GeminiConfig>): GeminiAIService => {
  if (!geminiInstance) {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }
    geminiInstance = new GeminiAIService({ apiKey, ...config });
  }
  return geminiInstance;
};

export default GeminiAIService;
