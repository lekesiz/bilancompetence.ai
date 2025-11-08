import { pool } from '../config/neon.js';
import axios from 'axios';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Service de gestion SSO (Single Sign-On)
 * Migrated to Neon PostgreSQL
 * Supporte Google OAuth et Microsoft OAuth
 */

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

interface SSOAuthResult {
  user: any;
  token: string;
  isNewUser: boolean;
}

/**
 * Échange le code d'autorisation Google contre un access token
 */
export async function exchangeGoogleCode(code: string): Promise<string> {
  try {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';

    const response = await axios.post(tokenEndpoint, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    return response.data.access_token;
  } catch (error: unknown) {
    logger.error('Erreur exchangeGoogleCode:', error.response?.data || error.message);
    throw new Error("Échec de l'échange du code Google");
  }
}

/**
 * Récupère les informations utilisateur depuis Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    logger.error('Erreur getGoogleUserInfo:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des informations Google');
  }
}

/**
 * Authentifie ou crée un utilisateur via Google OAuth
 */
export async function authenticateWithGoogle(code: string): Promise<SSOAuthResult> {
  try {
    // Échanger le code contre un access token
    const accessToken = await exchangeGoogleCode(code);

    // Récupérer les informations utilisateur
    const googleUser = await getGoogleUserInfo(accessToken);

    if (!googleUser.verified_email) {
      throw new Error('Email Google non vérifié');
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUserResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [googleUser.email]
    );

    let user;
    let isNewUser = false;

    if (existingUserResult.rows.length > 0) {
      // Utilisateur existant - mettre à jour les infos SSO
      const updatedUserResult = await pool.query(
        `UPDATE users
         SET google_id = $1, avatar_url = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [googleUser.id, googleUser.picture, existingUserResult.rows[0].id]
      );

      user = updatedUserResult.rows[0];
    } else {
      // Nouvel utilisateur - créer le compte
      const newUserResult = await pool.query(
        `INSERT INTO users (email, full_name, first_name, last_name, google_id, avatar_url, email_verified, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [
          googleUser.email,
          googleUser.name,
          googleUser.given_name,
          googleUser.family_name,
          googleUser.id,
          googleUser.picture,
          true,
          'BENEFICIARY',
        ]
      );

      user = newUserResult.rows[0];
      isNewUser = true;
    }

    // Générer un JWT token
    const token = await generateJWT(user);

    return {
      user,
      token,
      isNewUser,
    };
  } catch (error: unknown) {
    logger.error('Erreur authenticateWithGoogle:', error);
    throw error;
  }
}

/**
 * Échange le code d'autorisation Microsoft contre un access token
 */
export async function exchangeMicrosoftCode(code: string): Promise<string> {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

    const response = await axios.post(
      tokenEndpoint,
      new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI || '',
        grant_type: 'authorization_code',
        scope: 'openid profile email',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error: unknown) {
    logger.error('Erreur exchangeMicrosoftCode:', error.response?.data || error.message);
    throw new Error("Échec de l'échange du code Microsoft");
  }
}

/**
 * Récupère les informations utilisateur depuis Microsoft
 */
export async function getMicrosoftUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    logger.error('Erreur getMicrosoftUserInfo:', error.response?.data || error.message);
    throw new Error('Échec de la récupération des informations Microsoft');
  }
}

/**
 * Authentifie ou crée un utilisateur via Microsoft OAuth
 */
export async function authenticateWithMicrosoft(code: string): Promise<SSOAuthResult> {
  try {
    // Échanger le code contre un access token
    const accessToken = await exchangeMicrosoftCode(code);

    // Récupérer les informations utilisateur
    const msUser = await getMicrosoftUserInfo(accessToken);

    const email = msUser.mail || msUser.userPrincipalName;

    // Vérifier si l'utilisateur existe déjà
    const existingUserResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user;
    let isNewUser = false;

    if (existingUserResult.rows.length > 0) {
      // Utilisateur existant
      const updatedUserResult = await pool.query(
        `UPDATE users
         SET microsoft_id = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [msUser.id, existingUserResult.rows[0].id]
      );

      user = updatedUserResult.rows[0];
    } else {
      // Nouvel utilisateur
      const newUserResult = await pool.query(
        `INSERT INTO users (email, full_name, first_name, last_name, microsoft_id, email_verified, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          email,
          msUser.displayName,
          msUser.givenName,
          msUser.surname,
          msUser.id,
          true,
          'BENEFICIARY',
        ]
      );

      user = newUserResult.rows[0];
      isNewUser = true;
    }

    // Générer un JWT token
    const token = await generateJWT(user);

    return {
      user,
      token,
      isNewUser,
    };
  } catch (error: unknown) {
    logger.error('Erreur authenticateWithMicrosoft:', error);
    throw error;
  }
}

/**
 * Génère un JWT token pour l'utilisateur
 */
async function generateJWT(user: any): Promise<string> {
  // Utiliser le service d'authentification existant
  const jwt = require('jsonwebtoken');

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

  return token;
}

/**
 * Déconnecte un utilisateur SSO
 */
export async function revokeSSOAccess(
  userId: string,
  provider: 'google' | 'microsoft'
): Promise<void> {
  try {
    const field = provider === 'google' ? 'google_id' : 'microsoft_id';

    await pool.query(
      `UPDATE users
       SET ${field} = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  } catch (error: unknown) {
    logger.error('Erreur revokeSSOAccess:', error);
    throw error;
  }
}
