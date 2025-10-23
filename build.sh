#!/bin/bash
# Build script for Vercel deployment of monorepo frontend

set -e

echo "Installing dependencies..."
npm install

echo "Building frontend..."
cd apps/frontend
npm run build

echo "Copying build output to root..."
cp -r .next ../../.next
cp -r public ../../public

echo "Build complete!"
