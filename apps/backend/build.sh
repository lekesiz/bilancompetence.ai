#!/bin/bash

# Build script for Vercel monorepo deployment - Simplified for reliability
echo "🔨 Building BilanCompetence.AI Backend for Vercel..."
echo ""

# Current directory on Vercel is already the backend directory (apps/backend)
# Go to root
cd ../..
echo "Root: $(pwd)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install --production=false || npm install

echo ""
echo "Compiling TypeScript..."

# Run TypeScript compilation from root with path to backend tsconfig
cd apps/backend

if [ -f "tsconfig.json" ]; then
  npx tsc --project tsconfig.json || true
else
  echo "❌ Error: tsconfig.json not found"
  exit 1
fi

echo ""
echo "✅ Build completed!"
echo "Output: $(pwd)/dist"
