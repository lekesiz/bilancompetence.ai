#!/bin/bash
# Build script for Vercel deployment of monorepo frontend

set -e

echo "Building frontend..."
npm run build

echo "Copying build output to root..."
cp -r apps/frontend/.next ./.next
cp -r apps/frontend/public ./public

echo "Build complete!"
