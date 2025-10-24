import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * Service de gestion SSO (Single Sign-On)
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
      grant_type: 'authorization_code'
    });
    
    return response.data.access_token;
  } catch (error: any) {
    console.error('Erreur exchangeGoogleCode:', error.response?.data || error.message);
    throw new Error('Échec de l\'échange du code Google');
  }
}

/**
 * Récupère les informations utilisateur depuis Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Erreur getGoogleUserInfo:', error.response?.data || error.message);
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
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', googleUser.email)
      .single();
    
    let user;
    let isNewUser = false;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${fetchError.message}`);
    }
    
    if (existingUser) {
      // Utilisateur existant - mettre à jour les infos SSO
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          google_id: googleUser.id,
          avatar_url: googleUser.picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${updateError.message}`);
      }
      
      user = updatedUser;
    } else {
      // Nouvel utilisateur - créer le compte
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: googleUser.email,
          full_name: googleUser.name,
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          google_id: googleUser.id,
          avatar_url: googleUser.picture,
          email_verified: true,
          role: 'BENEFICIARY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
      }
      
      user = newUser;
      isNewUser = true;
    }
    
    // Générer un JWT token
    const token = await generateJWT(user);
    
    return {
      user,
      token,
      isNewUser
    };
  } catch (error: any) {
    console.error('Erreur authenticateWithGoogle:', error);
    throw error;
  }
}

/**
 * Échange le code d'autorisation Microsoft contre un access token
 */
export async function exchangeMicrosoftCode(code: string): Promise<string> {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
    
    const response = await axios.post(tokenEndpoint, new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI || '',
      grant_type: 'authorization_code',
      scope: 'openid profile email'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data.access_token;
  } catch (error: any) {
    console.error('Erreur exchangeMicrosoftCode:', error.response?.data || error.message);
    throw new Error('Échec de l\'échange du code Microsoft');
  }
}

/**
 * Récupère les informations utilisateur depuis Microsoft
 */
export async function getMicrosoftUserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Erreur getMicrosoftUserInfo:', error.response?.data || error.message);
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
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', msUser.mail || msUser.userPrincipalName)
      .single();
    
    let user;
    let isNewUser = false;
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Erreur lors de la recherche de l'utilisateur: ${fetchError.message}`);
    }
    
    if (existingUser) {
      // Utilisateur existant
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          microsoft_id: msUser.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${updateError.message}`);
      }
      
      user = updatedUser;
    } else {
      // Nouvel utilisateur
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: msUser.mail || msUser.userPrincipalName,
          full_name: msUser.displayName,
          first_name: msUser.givenName,
          last_name: msUser.surname,
          microsoft_id: msUser.id,
          email_verified: true,
          role: 'BENEFICIARY',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
      }
      
      user = newUser;
      isNewUser = true;
    }
    
    // Générer un JWT token
    const token = await generateJWT(user);
    
    return {
      user,
      token,
      isNewUser
    };
  } catch (error: any) {
    console.error('Erreur authenticateWithMicrosoft:', error);
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
    role: user.role
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
  
  return token;
}

/**
 * Déconnecte un utilisateur SSO
 */
export async function revokeSSOAccess(userId: string, provider: 'google' | 'microsoft'): Promise<void> {
  try {
    const updateData = provider === 'google' 
      ? { google_id: null }
      : { microsoft_id: null };
    
    const { error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Erreur lors de la révocation de l'accès SSO: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erreur revokeSSOAccess:', error);
    throw error;
  }
}

