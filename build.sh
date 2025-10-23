#!/bin/bash
# Build script for Vercel deployment of monorepo frontend

set -e

echo "Setting up monorepo for Vercel..."
# Vercel expects to find the .next directory in the root (or where it builds from)
# So we'll build the frontend normally and let Next.js output to apps/frontend/.next

echo "Building frontend..."
cd apps/frontend && npm run build && cd ../..

echo "Linking Next.js build output..."
# Create symlink or copy the .next directory to root for Vercel to find it
if [ ! -d ".next" ]; then
  ln -s apps/frontend/.next .next || cp -r apps/frontend/.next .next
fi

# Copy public directory if it exists
if [ ! -d "public" ] && [ -d "apps/frontend/public" ]; then
  ln -s apps/frontend/public ./public || cp -r apps/frontend/public ./public
fi

echo "Build complete!"
