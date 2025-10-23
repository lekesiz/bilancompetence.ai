#!/bin/bash
# Build script for Vercel deployment of monorepo frontend

set -e

echo "Building frontend..."
npm run build

echo "Preparing Next.js output for Vercel..."
# The build output is in apps/frontend/.next
# Vercel expects it in the current directory for standalone mode

# Wait a moment for the build to fully complete
sleep 2

# Copy the .next directory to root if it doesn't exist
if [ ! -d ".next" ]; then
  echo "Copying .next directory from apps/frontend/ to root..."
  cp -r apps/frontend/.next .next
  echo "Successfully copied .next directory"
fi

# Ensure public directory is accessible if it exists
if [ ! -d "public" ] && [ -d "apps/frontend/public" ]; then
  echo "Copying public directory..."
  cp -r apps/frontend/public ./public
fi

echo "Build complete!"
