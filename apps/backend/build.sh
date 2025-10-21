#!/bin/bash
set -e

# Build script for Vercel monorepo deployment
# This script handles installing dependencies from root and building backend

echo "Starting build for BilanCompetence.AI Backend..."
echo ""

# Get to root directory (Vercel sets CWD to project root automatically)
echo "Step 1: Installing dependencies from root (respects workspaces)..."
npm install

echo ""
echo "Step 2: Compiling TypeScript for backend..."
cd apps/backend
tsc

echo ""
echo "✅ Build completed successfully!"
echo "Backend compiled to: ./dist"
