import { pool } from '../config/neon.js';
import * as crypto from 'crypto';

/**
 * Service de gestion de l'authentification à deux facteurs (2FA)
 * Migrated to Neon PostgreSQL
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
  try {
    // Générer un secret aléatoire (base32)
    const secret = generateBase32Secret();

    // Récupérer les informations utilisateur
    const userResult = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }

    const user = userResult.rows[0];

    // Générer le QR code URL (compatible Google Authenticator)
    const appName = 'BilanCompetence.AI';
    const qrCodeUrl = generateQRCodeUrl(secret, user.email, appName);

    // Générer des codes de secours (backup codes)
    const backupCodes = generateBackupCodes(8);

    // Hasher les codes de secours avant stockage
    const hashedBackupCodes = backupCodes.map((code) => hashBackupCode(code));

    // Stocker le secret (non encore activé)
    await pool.query(
      `INSERT INTO user_two_factor (user_id, secret, is_enabled, backup_codes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET secret = $2, is_enabled = $3, backup_codes = $4, updated_at = NOW()`,
      [userId, secret, false, JSON.stringify(hashedBackupCodes)]
    );

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
  try {
    // Récupérer le secret
    const result = await pool.query(
      'SELECT secret, is_enabled FROM user_two_factor WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { isValid: false, message: '2FA non configuré pour cet utilisateur' };
    }

    const twoFactorData = result.rows[0];

    if (twoFactorData.is_enabled) {
      return { isValid: false, message: '2FA déjà activé' };
    }

    // Vérifier le token
    const isValid = verifyTOTP(twoFactorData.secret, token);

    if (!isValid) {
      return { isValid: false, message: 'Code invalide' };
    }

    // Activer le 2FA
    await pool.query(
      'UPDATE user_two_factor SET is_enabled = $1, updated_at = NOW() WHERE user_id = $2',
      [true, userId]
    );

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
  try {
    // Récupérer le secret et les backup codes
    const result = await pool.query(
      'SELECT secret, is_enabled, backup_codes FROM user_two_factor WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { isValid: false, message: '2FA non configuré' };
    }

    const twoFactorData = result.rows[0];

    if (!twoFactorData.is_enabled) {
      return { isValid: false, message: '2FA non activé' };
    }

    // Vérifier le token TOTP
    const isTOTPValid = verifyTOTP(twoFactorData.secret, token);

    if (isTOTPValid) {
      return { isValid: true, message: 'Code valide' };
    }

    // Si TOTP invalide, vérifier les backup codes
    const backupCodes = typeof twoFactorData.backup_codes === 'string'
      ? JSON.parse(twoFactorData.backup_codes)
      : twoFactorData.backup_codes || [];
    const hashedToken = hashBackupCode(token);

    const backupCodeIndex = backupCodes.findIndex((code: string) => code === hashedToken);

    if (backupCodeIndex !== -1) {
      // Supprimer le backup code utilisé
      backupCodes.splice(backupCodeIndex, 1);

      await pool.query(
        'UPDATE user_two_factor SET backup_codes = $1, updated_at = NOW() WHERE user_id = $2',
        [JSON.stringify(backupCodes), userId]
      );

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
  try {
    await pool.query('DELETE FROM user_two_factor WHERE user_id = $1', [userId]);
  } catch (error) {
    console.error('Erreur disableTwoFactor:', error);
    throw error;
  }
}

/**
 * Vérifie si le 2FA est activé pour un utilisateur
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT is_enabled FROM user_two_factor WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].is_enabled || false;
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
