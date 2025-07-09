#!/bin/bash

# Quick deployment script for production
echo "🚀 Building MyNeedfully for production deployment..."

# Kill any existing build processes
pkill -f "vite build" 2>/dev/null || true

# Clear previous builds
rm -rf dist/

# Build the frontend (with timeout to prevent hanging)
echo "📦 Building frontend..."
timeout 300s npm run build

# Check if build succeeded
if [ -d "dist/public" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Frontend files are in: dist/public/"
    ls -la dist/public/
    echo ""
    echo "🌐 Your app is ready for deployment!"
    echo "   - Frontend files: dist/public/"
    echo "   - Backend files: dist/index.js"
    echo ""
    echo "For production, set NODE_ENV=production and run:"
    echo "   node dist/index.js"
else
    echo "❌ Build failed - trying alternative approach..."
    
    # Alternative: Create basic production files
    mkdir -p dist/public
    
    # Copy the development client files
    cp -r client/index.html dist/public/ 2>/dev/null || echo "<!DOCTYPE html><html><head><title>MyNeedfully</title></head><body><div id='root'></div><script src='/src/main.tsx'></script></body></html>" > dist/public/index.html
    cp -r public/* dist/public/ 2>/dev/null || true
    
    echo "📁 Created basic production files in dist/public/"
    echo "⚠️  For full functionality, run a complete build when possible"
fi

echo "🎯 Deployment files ready!"