/**
 * France Travail (Pôle Emploi) Integration Service
 *
 * This service handles all interactions with the France Travail API,
 * including authentication, job search, ROME code management,
 * competency mapping, and job scoring.
 *
 * @module franceTravailService
 * @version 1.0.0
 */

import { logger } from '../utils/logger';
import { supabase } from './supabaseService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * OAuth Token response from France Travail API
 */
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * ROME Code (French job classification)
 */
interface RomeCodeDetails {
  code: string;
  libelle: string;
  definition: string;
  formations: string[];
  competences: string[];
  alternativeCodes?: string[];
}

/**
 * ROME Code search result
 */
interface RomeCodeSearchResult {
  code: string;
  libelle: string;
  similarity: number; // 0-1
}

/**
 * Job posting from France Travail API
 */
interface JobPosting {
  id: string;
  intitule: string;
  entreprise: string;
  salaireMois?: number;
  dateCreation: string;
  lieuTravail: {
    codePostal: string;
    ville?: string;
  };
  description: string;
  competences: string[];
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Apprentissage';
  typePublicCible: string[];
  source: 'france_travail';
}

/**
 * Job search response
 */
interface JobSearchResult {
  resultats: JobPosting[];
  nbResultats: number;
  nbPages: number;
  page: number;
}

/**
 * User competency profile
 */
interface CompetencyProfile {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  importance?: number; // 0-1
}

/**
 * Match score result for a ROME code
 */
interface RomeCodeMatch {
  code: string;
  libelle: string;
  matchScore: number; // 0-100
  reasonsToMatch: string[];
  gap?: string[];
}

/**
 * Scored job result
 */
interface ScoredJob extends JobPosting {
  matchScore: number; // 0-100
  matchedCompetencies: string[];
  missingCompetencies: string[];
  salaryMatch: 'low' | 'medium' | 'high';
  locationMatch: 'far' | 'medium' | 'close';
  recommendationReason: string;
}

/**
 * Job recommendation request
 */
interface JobRecommendationRequest {
  userId?: string;
  assessmentId?: string;
  limit?: number;
  filters?: {
    minSalary?: number;
    maxSalary?: number;
    contractTypes?: string[];
    locations?: string[];
    maxDistance?: number;
  };
}

/**
 * API Error response
 */
interface ApiErrorResponse {
  status: number;
  message: string;
  code: string;
  details?: any;
}

// ============================================================================
// COMPETENCY TO ROME MAPPING
// ============================================================================

/**
 * Static mapping of competencies to ROME codes
 * This can be extended and improved over time
 */
const COMPETENCY_TO_ROME_MAP: Record<string, string[]> = {
  // Technical skills
  'Java': ['E1101', 'E1102', 'C1501'],
  'Python': ['E1101', 'E1102', 'E1103'],
  'JavaScript': ['E1101', 'E1102', 'C1501'],
  'TypeScript': ['E1101', 'E1102', 'C1501'],
  'Spring Boot': ['E1101', 'E1102'],
  'React': ['E1101', 'E1102'],
  'Angular': ['E1101', 'E1102'],
  'Vue.js': ['E1101', 'E1102'],
  'Docker': ['E1101', 'E1102', 'E1104'],
  'Kubernetes': ['E1101', 'E1104'],
  'AWS': ['E1101', 'E1104'],
  'Azure': ['E1101', 'E1104'],
  'Google Cloud': ['E1101', 'E1104'],
  'Microservices': ['E1101', 'E1102', 'E1104'],
  'REST API': ['E1101', 'E1102'],
  'GraphQL': ['E1101', 'E1102'],
  'SQL': ['E1104', 'E1103'],
  'NoSQL': ['E1104', 'E1103'],
  'MongoDB': ['E1104', 'E1103'],
  'PostgreSQL': ['E1104', 'E1103'],

  // Professional skills
  'Project Management': ['E1106', 'M1101', 'M1102'],
  'Agile': ['E1106', 'M1101'],
  'Scrum': ['E1106', 'M1101'],
  'Leadership': ['M1101', 'M1102', 'E1108'],
  'Team Management': ['M1101', 'M1102'],
  'Communication': ['M1202', 'M1203'],
  'Presentation': ['M1202', 'M1203'],

  // Domain skills
  'Sales': ['C1503', 'C1504', 'C1505'],
  'Marketing': ['M1507', 'M1402'],
  'Finance': ['M1601', 'M1602'],
  'HR': ['K1601', 'K1602'],
  'Business Analysis': ['M1403', 'E1106'],
  'Data Analysis': ['E1101', 'E1104', 'M1501'],
  'Machine Learning': ['E1101', 'E1104', 'E1103'],
  'AI': ['E1101', 'E1104', 'E1103'],
  'DevOps': ['E1101', 'E1104'],
  'System Administration': ['E1104', 'E1107'],
  'Network Administration': ['E1104', 'E1107'],
  'Security': ['E1101', 'E1107'],
  'Cybersecurity': ['E1107', 'E1101'],

  // Languages
  'French': ['K1202', 'K2406'],
  'English': ['K1202', 'K2406'],
  'German': ['K1202', 'K2406'],
  'Spanish': ['K1202', 'K2406'],
};

// ============================================================================
// FRANCE TRAVAIL SERVICE CLASS
// ============================================================================

class FranceTravailService {
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private grantType: string;
  private scope: string;

  /**
   * Initialize the France Travail Service
   */
  constructor() {
    this.baseUrl = process.env.FRANCE_TRAVAIL_API_BASE_URL || 'https://api.francetravail.io/v1';
    this.clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID || '';
    this.clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET || '';
    this.grantType = process.env.FRANCE_TRAVAIL_GRANT_TYPE || 'client_credentials';
    this.scope = process.env.FRANCE_TRAVAIL_SCOPE || 'api/readonly';

    if (!this.clientId || !this.clientSecret) {
      logger.warn('France Travail API credentials not configured. Service will not work.');
    }
  }

  // ========================================================================
  // AUTHENTICATION METHODS
  // ========================================================================

  /**
   * Get a valid access token, refreshing if necessary
   * @returns Access token string
   */
  async getValidAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    // Refresh token if expired or not present
    return await this.refreshAccessToken();
  }

  /**
   * Refresh the access token from France Travail OAuth endpoint
   * @returns New access token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      logger.debug('Refreshing France Travail access token...');

      const response = await fetch(`${this.baseUrl}/oauth/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: this.grantType,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: this.scope,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('France Travail authentication failed', {
          status: response.status,
          error: errorData,
        });
        throw new Error(`France Travail authentication failed: ${response.statusText}`);
      }

      const data = await response.json() as TokenResponse;

      // Cache the token
      this.accessToken = data.access_token;
      this.tokenExpiryTime = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

      logger.debug('France Travail access token refreshed successfully');
      return data.access_token;
    } catch (error) {
      logger.error('Failed to refresh France Travail token', error);
      throw error;
    }
  }

  /**
   * Validate that API credentials are configured
   * @returns True if credentials are valid
   */
  private async validateCredentials(): Promise<boolean> {
    if (!this.clientId || !this.clientSecret) {
      logger.warn('France Travail API credentials not configured');
      return false;
    }

    try {
      await this.getValidAccessToken();
      return true;
    } catch (error) {
      logger.error('France Travail credentials validation failed', error);
      return false;
    }
  }

  // ========================================================================
  // JOB SEARCH METHODS
  // ========================================================================

  /**
   * Search jobs by ROME code
   * @param romeCode ROME code to search for
   * @param options Search options
   * @returns Job search results
   */
  async searchJobsByRomeCode(
    romeCode: string,
    options?: {
      page?: number;
      range?: string;
      minSalary?: number;
      contractType?: string;
    }
  ): Promise<JobSearchResult> {
    try {
      const token = await this.getValidAccessToken();

      const params = new URLSearchParams({
        codeROME: romeCode,
        page: String(options?.page || 1),
      });

      if (options?.range) params.append('range', options.range);
      if (options?.minSalary) params.append('minSalary', String(options.minSalary));
      if (options?.contractType) params.append('typeContrat', options.contractType);

      const response = await this.retryWithBackoff(async () => {
        return await fetch(`${this.baseUrl}/offres/search?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      });

      if (!response.ok) {
        throw new Error(`Job search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateAndParseJobSearchResponse(data);
    } catch (error) {
      logger.error('Error searching jobs by ROME code', { romeCode, error });
      throw error;
    }
  }

  /**
   * Search jobs by location
   * @param location Location code (e.g., "75" for Paris)
   * @param options Search options
   * @returns Job search results
   */
  async searchJobsByLocation(
    location: string,
    options?: {
      page?: number;
      keyword?: string;
      minSalary?: number;
    }
  ): Promise<JobSearchResult> {
    try {
      const token = await this.getValidAccessToken();

      const params = new URLSearchParams({
        range: location,
        page: String(options?.page || 1),
      });

      if (options?.keyword) params.append('keywords', options.keyword);
      if (options?.minSalary) params.append('minSalary', String(options.minSalary));

      const response = await this.retryWithBackoff(async () => {
        return await fetch(`${this.baseUrl}/offres/search?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      });

      if (!response.ok) {
        throw new Error(`Job search by location failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateAndParseJobSearchResponse(data);
    } catch (error) {
      logger.error('Error searching jobs by location', { location, error });
      throw error;
    }
  }

  // ========================================================================
  // ROME CODE MANAGEMENT METHODS
  // ========================================================================

  /**
   * Get detailed information about a ROME code
   * @param code ROME code
   * @returns ROME code details
   */
  async getRomeCodeDetails(code: string): Promise<RomeCodeDetails> {
    try {
      const token = await this.getValidAccessToken();

      // Try to get from cache first
      const cached = await this.getRomCodeCached(code);
      if (cached) {
        logger.debug(`ROME code ${code} retrieved from cache`);
        return cached;
      }

      const response = await this.retryWithBackoff(async () => {
        return await fetch(`${this.baseUrl}/referentiel/codeROME/${code}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      });

      if (!response.ok) {
        throw new Error(`Failed to get ROME code details: ${response.statusText}`);
      }

      const data = await response.json();
      const details = this.validateAndParseRomeCodeResponse(data);

      // Cache the result
      await this.cacheRomeCode(code, details);

      return details;
    } catch (error) {
      logger.error('Error getting ROME code details', { code, error });
      throw error;
    }
  }

  /**
   * Search ROME codes by keyword
   * @param keyword Search keyword
   * @param limit Maximum results
   * @returns ROME code search results
   */
  async searchRomeCodes(keyword: string, limit: number = 10): Promise<RomeCodeSearchResult[]> {
    try {
      const token = await this.getValidAccessToken();

      const params = new URLSearchParams({
        keyword: keyword,
        limit: String(limit),
      });

      const response = await this.retryWithBackoff(async () => {
        return await fetch(`${this.baseUrl}/referentiel/codeROME/search?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      });

      if (!response.ok) {
        throw new Error(`ROME code search failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.validateAndParseRomeCodeSearchResponse(data);
    } catch (error) {
      logger.error('Error searching ROME codes', { keyword, error });
      throw error;
    }
  }

  /**
   * Get related ROME codes for a given code
   * @param code ROME code
   * @returns Array of related ROME codes
   */
  async getRelatedRomeCodes(code: string): Promise<string[]> {
    try {
      const details = await this.getRomeCodeDetails(code);
      return details.alternativeCodes || [];
    } catch (error) {
      logger.error('Error getting related ROME codes', { code, error });
      return [];
    }
  }

  // ========================================================================
  // COMPETENCY MAPPING METHODS
  // ========================================================================

  /**
   * Map user competencies to ROME codes
   * @param competencies User competencies
   * @param proficiency User proficiency level
   * @returns Mapping results
   */
  async mapCompetenciesToRomeCodes(
    competencies: string[],
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  ): Promise<Map<string, number>> {
    try {
      const romeScores = new Map<string, number>();

      // Get proficiency weight
      const proficiencyWeight = this.getProficiencyWeight(proficiency);

      for (const competency of competencies) {
        const mappedCodes = COMPETENCY_TO_ROME_MAP[competency] || [];

        // If exact match exists, use it
        if (mappedCodes.length > 0) {
          for (const code of mappedCodes) {
            const currentScore = romeScores.get(code) || 0;
            romeScores.set(code, currentScore + proficiencyWeight);
          }
        } else {
          // Try fuzzy matching
          const fuzzyMatches = this.findFuzzyCompetencyMatches(competency);
          for (const match of fuzzyMatches) {
            const matchedCodes = COMPETENCY_TO_ROME_MAP[match.competency] || [];
            for (const code of matchedCodes) {
              const currentScore = romeScores.get(code) || 0;
              const adjustedWeight = proficiencyWeight * match.similarity;
              romeScores.set(code, currentScore + adjustedWeight);
            }
          }
        }
      }

      return romeScores;
    } catch (error) {
      logger.error('Error mapping competencies to ROME codes', { competencies, error });
      throw error;
    }
  }

  /**
   * Find the best matching ROME codes for user skills
   * @param userCompetencies User competency profiles
   * @returns Ranked ROME code matches
   */
  async findMatchingRomeCodes(
    userCompetencies: CompetencyProfile[]
  ): Promise<RomeCodeMatch[]> {
    try {
      const romeScores = new Map<string, number>();

      for (const competency of userCompetencies) {
        const weight = this.getProficiencyWeight(competency.level);
        const importance = competency.importance || 1;
        const finalWeight = weight * importance;

        const mappedCodes = COMPETENCY_TO_ROME_MAP[competency.name] || [];

        for (const code of mappedCodes) {
          const currentScore = romeScores.get(code) || 0;
          romeScores.set(code, currentScore + finalWeight);
        }
      }

      // Convert to sorted array
      const matches: RomeCodeMatch[] = [];

      const codeScorePairs = Array.from(romeScores.entries());
      for (const [code, score] of codeScorePairs) {
        try {
          const details = await this.getRomeCodeDetails(code);
          matches.push({
            code,
            libelle: details.libelle,
            matchScore: Math.min(100, score * 25), // Normalize to 0-100
            reasonsToMatch: this.getMatchReasons(userCompetencies, code),
            gap: this.calculateCompetencyGap(userCompetencies, details),
          });
        } catch (error) {
          logger.warn(`Could not get details for ROME code ${code}`, error);
        }
      }

      // Sort by match score descending
      return matches.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      logger.error('Error finding matching ROME codes', { error });
      throw error;
    }
  }

  // ========================================================================
  // JOB SCORING METHODS
  // ========================================================================

  /**
   * Calculate skill match percentage between user and job
   * @param userSkills User skills
   * @param jobRequiredSkills Job required skills
   * @returns Match percentage (0-100)
   */
  private calculateSkillMatch(userSkills: string[], jobRequiredSkills: string[]): number {
    if (jobRequiredSkills.length === 0) return 100;

    let matchedCount = 0;
    for (const required of jobRequiredSkills) {
      const hasSkill = userSkills.some(skill =>
        skill.toLowerCase() === required.toLowerCase() ||
        this.stringSimilarity(skill, required) > 0.7
      );
      if (hasSkill) matchedCount++;
    }

    return (matchedCount / jobRequiredSkills.length) * 100;
  }

  /**
   * Score jobs based on user skill match
   * @param userId User ID
   * @param jobs Jobs to score
   * @returns Scored jobs sorted by match
   */
  async scoreJobMatches(
    userId: string,
    jobs: JobPosting[]
  ): Promise<ScoredJob[]> {
    try {
      // Get user's assessment and competencies
      const userCompetencies = await this.getUserCompetencies(userId);
      const userSkillNames = userCompetencies.map(c => c.name);

      const scoredJobs: ScoredJob[] = [];

      for (const job of jobs) {
        const matchScore = this.calculateSkillMatch(userSkillNames, job.competences);
        const matchedCompetencies = userSkillNames.filter(skill =>
          job.competences.some(req => this.stringSimilarity(skill, req) > 0.7)
        );
        const missingCompetencies = job.competences.filter(required =>
          !matchedCompetencies.some(skill => this.stringSimilarity(skill, required) > 0.7)
        );

        const salaryMatch = this.calculateSalaryMatch(job.salaireMois);
        const locationMatch = 'medium' as const; // Placeholder - would use user location

        scoredJobs.push({
          ...job,
          matchScore: Math.round(matchScore),
          matchedCompetencies,
          missingCompetencies,
          salaryMatch,
          locationMatch,
          recommendationReason: this.getRecommendationReason(matchScore, matchedCompetencies),
        });
      }

      // Sort by match score descending
      return scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      logger.error('Error scoring job matches', { userId, error });
      throw error;
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get proficiency weight for scoring
   */
  private getProficiencyWeight(level: string): number {
    switch (level.toLowerCase()) {
      case 'expert':
        return 1.0;
      case 'advanced':
        return 0.9;
      case 'intermediate':
        return 0.7;
      case 'beginner':
        return 0.5;
      default:
        return 0.5;
    }
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  private stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Levenshtein distance
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  }

  /**
   * Find fuzzy matching competencies
   */
  private findFuzzyCompetencyMatches(competency: string): Array<{ competency: string; similarity: number }> {
    const matches: Array<{ competency: string; similarity: number }> = [];

    for (const mapped of Object.keys(COMPETENCY_TO_ROME_MAP)) {
      const similarity = this.stringSimilarity(competency, mapped);
      if (similarity > 0.6) {
        matches.push({ competency: mapped, similarity });
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  /**
   * Calculate salary match quality
   */
  private calculateSalaryMatch(salary?: number): 'low' | 'medium' | 'high' {
    if (!salary) return 'medium';
    if (salary > 4000) return 'high';
    if (salary > 2500) return 'medium';
    return 'low';
  }

  /**
   * Get reasons why a job matches user profile
   */
  private getMatchReasons(userCompetencies: CompetencyProfile[], romeCode: string): string[] {
    const reasons = [];

    // This is simplified - would match against ROME code competencies in production
    for (const comp of userCompetencies) {
      const mapped = COMPETENCY_TO_ROME_MAP[comp.name] || [];
      if (mapped.includes(romeCode)) {
        reasons.push(`Your ${comp.level} ${comp.name} skill is relevant`);
      }
    }

    return reasons.length > 0 ? reasons : ['Matches your professional profile'];
  }

  /**
   * Calculate competency gap between user and job
   */
  private calculateCompetencyGap(
    userCompetencies: CompetencyProfile[],
    romeDetails: RomeCodeDetails
  ): string[] {
    const userSkills = userCompetencies.map(c => c.name.toLowerCase());
    const gap: string[] = [];

    for (const requiredSkill of romeDetails.competences) {
      const hasSkill = userSkills.some(skill =>
        skill === requiredSkill.toLowerCase() ||
        this.stringSimilarity(skill, requiredSkill.toLowerCase()) > 0.7
      );

      if (!hasSkill) {
        gap.push(requiredSkill);
      }
    }

    return gap;
  }

  /**
   * Get recommendation reason for a job match
   */
  private getRecommendationReason(matchScore: number, matchedCompetencies: string[]): string {
    if (matchScore >= 90) {
      return `Excellent match! Your ${matchedCompetencies.join(', ')} skills align well with this role.`;
    } else if (matchScore >= 75) {
      return `Strong match. You have most required skills (${matchedCompetencies.join(', ')}).`;
    } else if (matchScore >= 60) {
      return `Moderate match. You have some relevant skills (${matchedCompetencies.join(', ')}).`;
    } else {
      return `Some potential. Consider developing additional skills for this role.`;
    }
  }

  /**
   * Retry API request with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Validate and parse job search response
   */
  private validateAndParseJobSearchResponse(data: any): JobSearchResult {
    if (!data || !Array.isArray(data.resultats)) {
      throw new Error('Invalid job search response format');
    }

    return {
      resultats: data.resultats || [],
      nbResultats: data.nbResultats || 0,
      nbPages: data.nbPages || 0,
      page: data.page || 1,
    };
  }

  /**
   * Validate and parse ROME code response
   */
  private validateAndParseRomeCodeResponse(data: any): RomeCodeDetails {
    if (!data || !data.code) {
      throw new Error('Invalid ROME code response format');
    }

    return {
      code: data.code,
      libelle: data.libelle || '',
      definition: data.definition || '',
      formations: data.formations || [],
      competences: data.competences || [],
      alternativeCodes: data.alternativeCodes,
    };
  }

  /**
   * Validate and parse ROME code search response
   */
  private validateAndParseRomeCodeSearchResponse(data: any): RomeCodeSearchResult[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      code: item.code || '',
      libelle: item.libelle || '',
      similarity: item.similarity || 0,
    }));
  }

  // ========================================================================
  // CACHING METHODS
  // ========================================================================

  /**
   * Get ROME code from cache
   */
  private async getRomCodeCached(code: string): Promise<RomeCodeDetails | null> {
    try {
      const { data, error } = await supabase
        .from('rome_code_cache')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) return null;

      return {
        code: (data as any).code,
        libelle: (data as any).libelle,
        definition: (data as any).definition,
        formations: (data as any).formations || [],
        competences: (data as any).competences || [],
      };
    } catch (error) {
      logger.debug('Error retrieving ROME code from cache', error);
      return null;
    }
  }

  /**
   * Cache ROME code details
   */
  private async cacheRomeCode(code: string, details: RomeCodeDetails): Promise<void> {
    try {
      await supabase.from('rome_code_cache').insert({
        code,
        libelle: details.libelle,
        definition: details.definition,
        formations: details.formations,
        competences: details.competences,
      });
    } catch (error) {
      logger.warn('Error caching ROME code', error);
    }
  }

  // ========================================================================
  // DATABASE METHODS
  // ========================================================================

  /**
   * Get user competencies from their assessment
   */
  private async getUserCompetencies(userId: string): Promise<CompetencyProfile[]> {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('competencies')
        .eq('beneficiary_id', userId)
        .eq('status', 'COMPLETED')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !assessment) {
        logger.warn(`No completed assessment found for user ${userId}`);
        return [];
      }

      // Parse competencies from assessment
      const competencies = (assessment as any).competencies || [];
      return competencies.map((comp: any) => ({
        name: comp.name || comp,
        level: comp.level || 'intermediate',
        importance: comp.importance || 1,
      }));
    } catch (error) {
      logger.error('Error getting user competencies', { userId, error });
      return [];
    }
  }

  /**
   * Save job recommendation to database
   */
  async saveJobRecommendation(
    userId: string,
    jobId: string,
    assessmentId: string | null,
    jobData: JobPosting,
    matchScore: number,
    matchedCompetencies: string[]
  ): Promise<string> {
    try {
      const { data, error } = await supabase.from('job_recommendations').insert({
        user_id: userId,
        assessment_id: assessmentId,
        job_id: jobId,
        france_travail_job_data: jobData,
        match_score: matchScore,
        matched_competencies: matchedCompetencies,
      }).select('id').single();

      if (error) throw error;

      return (data as any).id;
    } catch (error) {
      logger.error('Error saving job recommendation', { userId, jobId, error });
      throw error;
    }
  }

  /**
   * Save a job to user's saved list
   */
  async saveJobToUserList(
    userId: string,
    jobId: string,
    jobData: JobPosting,
    notes?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.from('saved_jobs').insert({
        user_id: userId,
        france_travail_job_id: jobId,
        job_data: jobData,
        notes,
      }).select('id').single();

      if (error) throw error;

      return (data as any).id;
    } catch (error) {
      logger.error('Error saving job to user list', { userId, jobId, error });
      throw error;
    }
  }

  /**
   * Get user's saved jobs
   */
  async getUserSavedJobs(userId: string, limit: number = 10, page: number = 1): Promise<any[]> {
    try {
      const offset = (page - 1) * limit;
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting user saved jobs', { userId, error });
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const franceTravailService = new FranceTravailService();

export {
  FranceTravailService,
  TokenResponse,
  RomeCodeDetails,
  RomeCodeSearchResult,
  JobPosting,
  JobSearchResult,
  CompetencyProfile,
  RomeCodeMatch,
  ScoredJob,
  JobRecommendationRequest,
  ApiErrorResponse,
};
