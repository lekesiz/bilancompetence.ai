#!/bin/bash

# Fix middleware error handlers

echo "🔧 Fixing middleware error handlers..."

cd /Users/mikail/Desktop/bilancompetence.ai/apps/backend/src/middleware

for file in *.ts; do
  if [ -f "$file" ]; then
    if grep -q "error: any" "$file"; then
      echo "  🔄 Processing $file..."

      # Add error handler imports if not present
      if ! grep -q "import.*getErrorMessage.*from.*types/errors" "$file"; then
        last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
        if [ ! -z "$last_import" ]; then
          sed -i "" "${last_import}a\\
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';
" "$file"
        fi
      fi

      # Replace 'error: any' with 'error: unknown'
      sed -i "" 's/} catch (error: any) {/} catch (error: unknown) {/g' "$file"
      sed -i "" 's/(error: any)/(error: unknown)/g' "$file"

      # Fix error.message references
      sed -i "" 's/error\.message/getErrorMessage(error)/g' "$file"

      echo "  ✅ Fixed $file"
    fi
  fi
done

echo ""
echo "✅ Middleware error handlers fixed!"

# Verification
REMAINING=$(grep -r "error: any" . --include="*.ts" 2>/dev/null | wc -l | xargs)
echo "📊 Remaining 'error: any' in middleware: $REMAINING"
