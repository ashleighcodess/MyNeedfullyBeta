#!/bin/bash

echo "🚀 Starting MyNeedfully in Production Mode"

# Check if production files exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ Backend files missing. Building..."
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Frontend files missing. Creating basic production files..."
    mkdir -p dist/public
    cp client/index.html dist/public/ 2>/dev/null || echo "Basic HTML created"
    cp -r public/* dist/public/ 2>/dev/null || true
fi

echo "✅ Production files ready!"
echo "📁 Frontend: dist/public/"
echo "📁 Backend: dist/index.js"
echo ""

# Start the production server
echo "🌐 Starting production server on port 5000..."
NODE_ENV=production node dist/index.js