#!/bin/bash

# ========================================
# Sprint 1.1: Complete Error Handler Type Safety Fix
# ========================================
# This script fixes all 'error: any' occurrences across the backend
# Target: 103 in routes/ + 55 in services/ = 158 instances

echo "🔧 Starting comprehensive error handler type safety fix..."
echo ""

# Navigate to backend
cd /Users/mikail/Desktop/bilancompetence.ai/apps/backend/src

# ========================================
# STEP 1: Fix all route files
# ========================================
echo "📂 Fixing route files..."

for file in routes/*.ts; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")

    # Skip twoFactor.ts (already fixed)
    if [ "$filename" == "twoFactor.ts" ]; then
      echo "  ⏭️  Skipping $filename (already fixed)"
      continue
    fi

    # Check if file has 'error: any'
    if grep -q "error: any" "$file"; then
      echo "  🔄 Processing $filename..."

      # Add error handler imports if not present
      if ! grep -q "import.*getErrorMessage.*from.*types/errors" "$file"; then
        # Find the last import line
        last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

        if [ ! -z "$last_import" ]; then
          sed -i "" "${last_import}a\\
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';
" "$file"
        fi
      fi

      # Replace 'error: any' with 'error: unknown'
      sed -i "" 's/} catch (error: any) {/} catch (error: unknown) {/g' "$file"

      # Fix error handlers - Pattern 1: res.status(500).json({ error: error.message })
      perl -i -0777 -pe '
        s/res\.status\(500\)\.json\(\s*\{\s*error:\s*error\.message\s*(?:\|\|\s*[^\}]+)?\s*\}\s*\);/
          const statusCode = getErrorStatusCode(error);
          const message = getErrorMessage(error);
          res.status(statusCode).json({ error: message });
        /g;
      ' "$file"

      # Fix error handlers - Pattern 2: res.status(xxx).json({ error: 'message', details: error.message })
      perl -i -0777 -pe '
        s/details:\s*error\.message/details: getErrorMessage(error)/g;
      ' "$file"

      echo "  ✅ Fixed $filename"
    else
      echo "  ⏭️  Skipping $filename (no error: any found)"
    fi
  fi
done

echo ""

# ========================================
# STEP 2: Fix all service files
# ========================================
echo "📂 Fixing service files..."

for file in services/*.ts; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")

    # Check if file has 'error: any'
    if grep -q "error: any" "$file"; then
      echo "  🔄 Processing $filename..."

      # Add error handler imports if not present
      if ! grep -q "import.*getErrorMessage.*from.*types/errors" "$file"; then
        # Find the last import line
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

      # Fix throw statements with error.message
      perl -i -0777 -pe '
        s/throw new Error\(error\.message\)/throw new Error(getErrorMessage(error))/g;
      ' "$file"

      # Fix console.error with error.message
      perl -i -0777 -pe '
        s/console\.error\([^,]+,\s*error\.message\)/console.error($1, getErrorMessage(error))/g;
      ' "$file"

      echo "  ✅ Fixed $filename"
    else
      echo "  ⏭️  Skipping $filename (no error: any found)"
    fi
  fi
done

echo ""
echo "✅ All error handlers fixed!"
echo ""

# ========================================
# STEP 3: Verification
# ========================================
echo "📊 Verification:"
ROUTES_COUNT=$(grep -r "error: any" routes/ --include="*.ts" 2>/dev/null | wc -l | xargs)
SERVICES_COUNT=$(grep -r "error: any" services/ --include="*.ts" 2>/dev/null | wc -l | xargs)
TOTAL=$((ROUTES_COUNT + SERVICES_COUNT))

echo "  Routes:   $ROUTES_COUNT remaining 'error: any'"
echo "  Services: $SERVICES_COUNT remaining 'error: any'"
echo "  Total:    $TOTAL remaining (target: 0)"
echo ""

if [ $TOTAL -eq 0 ]; then
  echo "🎉 SUCCESS! All error handlers are now type-safe!"
else
  echo "⚠️  Some instances remain - manual review required"
fi
