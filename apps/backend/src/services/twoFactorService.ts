import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Make Supabase optional - only initialize if credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Service de gestion de l'authentification à deux facteurs (2FA)
 * Supporte TOTP (Time-based One-Time Password) via Google Authenticator, Authy, etc.
 */

interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorVerification {
  isValid: boolean;
  message: string;
}

/**
 * Génère un secret TOTP pour un utilisateur
 */
export async function generateTwoFactorSecret(userId: string): Promise<TwoFactorSecret> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }
  try {
    // Générer un secret aléatoire (base32)
    const secret = generateBase32Secret();

    // Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Générer le QR code URL (compatible Google Authenticator)
    const appName = 'BilanCompetence.AI';
    const qrCodeUrl = generateQRCodeUrl(secret, user.email, appName);

    // Générer des codes de secours (backup codes)
    const backupCodes = generateBackupCodes(8);

    // Hasher les codes de secours avant stockage
    const hashedBackupCodes = backupCodes.map((code) => hashBackupCode(code));

    // Stocker le secret (non encore activé)
    const { error: insertError } = await supabase.from('user_two_factor').upsert({
      user_id: userId,
      secret: secret,
      is_enabled: false,
      backup_codes: hashedBackupCodes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error(`Erreur lors de la sauvegarde du secret 2FA: ${insertError.message}`);
    }

    return {
      secret,
      qrCode: qrCodeUrl,
      backupCodes, // Retourner les codes en clair (une seule fois)
    };
  } catch (error) {
    console.error('Erreur generateTwoFactorSecret:', error);
    throw error;
  }
}

/**
 * Active le 2FA après vérification du premier code
 */
export async function enableTwoFactor(
  userId: string,
  token: string
): Promise<TwoFactorVerification> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }
  try {
    // Récupérer le secret
    const { data: twoFactorData, error: fetchError } = await supabase
      .from('user_two_factor')
      .select('secret, is_enabled')
      .eq('user_id', userId)
      .single();

    if (fetchError || !twoFactorData) {
      return { isValid: false, message: '2FA non configuré pour cet utilisateur' };
    }

    if (twoFactorData.is_enabled) {
      return { isValid: false, message: '2FA déjà activé' };
    }

    // Vérifier le token
    const isValid = verifyTOTP(twoFactorData.secret, token);

    if (!isValid) {
      return { isValid: false, message: 'Code invalide' };
    }

    // Activer le 2FA
    const { error: updateError } = await supabase
      .from('user_two_factor')
      .update({
        is_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Erreur lors de l'activation du 2FA: ${updateError.message}`);
    }

    return { isValid: true, message: '2FA activé avec succès' };
  } catch (error) {
    console.error('Erreur enableTwoFactor:', error);
    throw error;
  }
}

/**
 * Vérifie un code 2FA lors de la connexion
 */
export async function verifyTwoFactorToken(
  userId: string,
  token: string
): Promise<TwoFactorVerification> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }
  try {
    // Récupérer le secret et les backup codes
    const { data: twoFactorData, error: fetchError } = await supabase
      .from('user_two_factor')
      .select('secret, is_enabled, backup_codes')
      .eq('user_id', userId)
      .single();

    if (fetchError || !twoFactorData) {
      return { isValid: false, message: '2FA non configuré' };
    }

    if (!twoFactorData.is_enabled) {
      return { isValid: false, message: '2FA non activé' };
    }

    // Vérifier le token TOTP
    const isTOTPValid = verifyTOTP(twoFactorData.secret, token);

    if (isTOTPValid) {
      return { isValid: true, message: 'Code valide' };
    }

    // Si TOTP invalide, vérifier les backup codes
    const backupCodes = twoFactorData.backup_codes || [];
    const hashedToken = hashBackupCode(token);

    const backupCodeIndex = backupCodes.findIndex((code: string) => code === hashedToken);

    if (backupCodeIndex !== -1) {
      // Supprimer le backup code utilisé
      backupCodes.splice(backupCodeIndex, 1);

      await supabase
        .from('user_two_factor')
        .update({
          backup_codes: backupCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return { isValid: true, message: 'Code de secours valide (code consommé)' };
    }

    return { isValid: false, message: 'Code invalide' };
  } catch (error) {
    console.error('Erreur verifyTwoFactorToken:', error);
    throw error;
  }
}

/**
 * Désactive le 2FA pour un utilisateur
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }
  try {
    const { error } = await supabase.from('user_two_factor').delete().eq('user_id', userId);

    if (error) {
      throw new Error(`Erreur lors de la désactivation du 2FA: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur disableTwoFactor:', error);
    throw error;
  }
}

/**
 * Vérifie si le 2FA est activé pour un utilisateur
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  if (!supabase) {
    return false; // If Supabase is not configured, 2FA is not enabled
  }
  try {
    const { data, error } = await supabase
      .from('user_two_factor')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_enabled || false;
  } catch (error) {
    console.error('Erreur isTwoFactorEnabled:', error);
    return false;
  }
}

// ============= Fonctions utilitaires =============

/**
 * Génère un secret base32 aléatoire
 */
function generateBase32Secret(): string {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Encode en base32 (compatible avec Google Authenticator)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Génère l'URL du QR code pour Google Authenticator
 */
function generateQRCodeUrl(secret: string, email: string, appName: string): string {
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
}

/**
 * Génère des codes de secours aléatoires
 */
function generateBackupCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash un code de secours
 */
function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Vérifie un token TOTP
 */
function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const time = Math.floor(Date.now() / 1000 / 30);

  // Vérifier le token actuel et les fenêtres adjacentes (±30s)
  for (let i = -window; i <= window; i++) {
    const expectedToken = generateTOTP(secret, time + i);
    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

/**
 * Génère un token TOTP
 */
function generateTOTP(secret: string, time: number): string {
  const key = base32Decode(secret);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Décode une chaîne base32
 */
function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil((input.length * 5) / 8));

  for (let i = 0; i < input.length; i++) {
    const char = input[i].toUpperCase();
    const val = alphabet.indexOf(char);

    if (val === -1) continue;

    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}
