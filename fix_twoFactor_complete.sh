#!/bin/bash

# Complete fix for twoFactor.ts security issues

FILE="apps/backend/src/routes/twoFactor.ts"

echo "🔧 Fixing twoFactor.ts..."

# Step 1: Add imports
sed -i '' '3 a\
import { comparePassword } from '\''../services/authService.js'\'';\
import { pool } from '\''../config/neon.js'\'';\
import { getErrorMessage, getErrorStatusCode } from '\''../types/errors.js'\'';
' "$FILE"

# Step 2: Replace all 'error: any' with 'error: unknown'
sed -i '' 's/} catch (error: any) {/} catch (error: unknown) {/g' "$FILE"

# Step 3: Fix TODO on line ~211 (password verification)
# Find the line with TODO and replace the section
perl -i -pe '
  if (/TODO: Vérifier le mot de passe avec authService/) {
    $_ = qq{    // ✅ SECURITY FIX: Verify password before disabling 2FA
    const userResult = await pool.query(
      '\''SELECT password_hash FROM users WHERE id = \$1'\'',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: '\''Utilisateur non trouvé'\'' });
    }

    const isPasswordValid = await comparePassword(password, userResult.rows[0].password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: '\''Mot de passe incorrect'\'' });
    }

};
  }
' "$FILE"

# Step 4: Fix all error handlers - replace error.message with proper type-safe handling
perl -i -0777 -pe '
  s{res\.status\(500\)\.json\(\{ error: error\.message \|\| ([^\}]+) \}\);}{
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);
    res.status(statusCode).json({ error: message || $1 });
  }g;
' "$FILE"

echo "✅ twoFactor.ts fixed!"
echo ""
echo "Changes applied:"
echo "  1. ✅ Added security imports (comparePassword, pool, error helpers)"
echo "  2. ✅ Replaced 'error: any' with 'error: unknown'"
echo "  3. ✅ Implemented password verification for 2FA disable"
echo "  4. ✅ Fixed all error handlers with proper type safety"
