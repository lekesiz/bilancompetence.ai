import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de sanitization pour protéger contre XSS et SQL Injection
 * 
 * Nettoie les données entrantes (body, query, params) en:
 * - Échappant les caractères HTML dangereux
 * - Détectant les patterns SQL suspects
 * - Limitant la longueur des chaînes
 * - Validant les types de données
 */

interface SanitizationOptions {
  maxStringLength?: number;
  allowHTML?: boolean;
  strictMode?: boolean;
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  maxStringLength: 10000,
  allowHTML: false,
  strictMode: true
};

/**
 * Patterns SQL suspects à détecter
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
  /(--|;|\/\*|\*\/)/g,
  /(\bOR\b.*=.*)/gi,
  /(\bAND\b.*=.*)/gi,
  /(\'|\"|`)/g
];

/**
 * Patterns XSS suspects
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onerror, etc.
  /<embed/gi,
  /<object/gi
];

/**
 * Échappe les caractères HTML dangereux
 */
function escapeHTML(str: string): string {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Détecte les tentatives d'injection SQL
 */
function detectSQLInjection(str: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Détecte les tentatives XSS
 */
function detectXSS(str: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(str));
}

/**
 * Sanitize une valeur string
 */
function sanitizeString(value: string, options: SanitizationOptions): string {
  // Vérifier la longueur
  if (options.maxStringLength && value.length > options.maxStringLength) {
    throw new Error(`String trop longue (max: ${options.maxStringLength} caractères)`);
  }
  
  // Détecter SQL Injection
  if (options.strictMode && detectSQLInjection(value)) {
    throw new Error('Tentative d\'injection SQL détectée');
  }
  
  // Détecter XSS
  if (options.strictMode && detectXSS(value)) {
    throw new Error('Tentative XSS détectée');
  }
  
  // Échapper HTML si nécessaire
  if (!options.allowHTML) {
    return escapeHTML(value);
  }
  
  return value;
}

/**
 * Sanitize récursivement un objet
 */
function sanitizeObject(obj: any, options: SanitizationOptions): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key], options);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware de sanitization
 */
export function sanitizeInput(options: SanitizationOptions = {}) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, mergedOptions);
      }
      
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query, mergedOptions);
      }
      
      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params, mergedOptions);
      }
      
      next();
    } catch (error: any) {
      console.error('Erreur de sanitization:', error);
      res.status(400).json({ 
        error: 'Données invalides',
        message: error.message 
      });
    }
  };
}

/**
 * Middleware de sanitization strict (pour les routes sensibles)
 */
export const strictSanitization = sanitizeInput({
  maxStringLength: 5000,
  allowHTML: false,
  strictMode: true
});

/**
 * Middleware de sanitization permissif (pour les champs de texte riche)
 */
export const permissiveSanitization = sanitizeInput({
  maxStringLength: 50000,
  allowHTML: true,
  strictMode: false
});

/**
 * Validation d'email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validation de numéro de téléphone français
 */
export function validatePhoneFR(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validation de SIRET (France)
 */
export function validateSIRET(siret: string): boolean {
  const siretRegex = /^\d{14}$/;
  if (!siretRegex.test(siret)) {
    return false;
  }
  
  // Algorithme de Luhn pour vérifier le SIRET
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  
  return sum % 10 === 0;
}

/**
 * Validation de CPF (Compte Personnel de Formation - France)
 */
export function validateCPF(cpf: string): boolean {
  // Format: 11 chiffres
  const cpfRegex = /^\d{11}$/;
  return cpfRegex.test(cpf);
}

/**
 * Nettoie les données sensibles des logs
 */
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }
  
  return sanitized;
}

