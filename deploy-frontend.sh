#!/bin/bash

# Frontend deployment script for Vercel
# This script deploys only the frontend app to Vercel

set -e

echo "🚀 Starting Frontend Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Change to frontend directory
cd apps/frontend

echo "📦 Building frontend..."
npm run build

echo "🔐 Deploying to Vercel..."
# Deploy with explicit configuration
vercel deploy --prod \
  --token=$VERCEL_TOKEN \
  --name=bilancompetence-ai-frontend \
  --force

echo "✅ Frontend deployment completed successfully!"
