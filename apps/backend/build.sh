#!/bin/bash
set -e

# Build script for Vercel monorepo deployment
# This script handles installing dependencies from root and building backend

echo "Starting build for BilanCompetence.AI Backend..."
echo "Current directory: $(pwd)"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Script location: $SCRIPT_DIR"
echo ""

# Go to root (parent of apps, then parent of backend)
cd "$SCRIPT_DIR/../.."
ROOT_DIR="$(pwd)"
echo "Root directory: $ROOT_DIR"
echo ""

# Step 1: Install dependencies from root (respects workspaces)
echo "Step 1: Installing dependencies from root (respects workspaces)..."
npm install

echo ""
echo "Step 2: Compiling TypeScript for backend..."
cd "$SCRIPT_DIR"
echo "Backend directory: $(pwd)"
echo ""

# Use TypeScript from root node_modules since that's where npm installed it
TSC_PATH="$ROOT_DIR/node_modules/.bin/tsc"

if [ ! -f "$TSC_PATH" ]; then
  echo "❌ Error: TypeScript compiler not found at $TSC_PATH"
  echo "Available binaries:"
  ls -la "$ROOT_DIR/node_modules/.bin/" 2>/dev/null || echo "No .bin directory found"
  exit 1
fi

echo "Using TypeScript from: $TSC_PATH"
echo ""

# Run TypeScript compiler with absolute path
"$TSC_PATH"

echo ""
echo "✅ Build completed successfully!"
echo "Backend compiled to: $SCRIPT_DIR/dist"
