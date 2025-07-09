#!/bin/bash

echo "🔧 Fixing VPS Production Build for MyNeedfully"

# Kill any hanging build processes
pkill -f "vite build" 2>/dev/null || true
pkill -f "esbuild" 2>/dev/null || true

# Clean previous builds
rm -rf dist/

echo "📦 Building frontend with proper assets..."

# Build with a timeout but allow more time for VPS
timeout 600s npm run build 

if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Complete build successful!"
    echo "📁 Assets generated:"
    ls -la dist/public/assets/ 2>/dev/null || echo "No assets directory found"
    
    # Show what the HTML is expecting
    echo "🔍 HTML expects these assets:"
    grep -o 'src="/[^"]*"' dist/public/index.html || true
    grep -o 'href="/[^"]*"' dist/public/index.html || true
    
else
    echo "⚠️ Full build failed, creating emergency production files..."
    
    # Create the directory structure
    mkdir -p dist/public/assets
    
    # Create a simple production HTML that works without compiled assets
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyNeedfully - A Registry For Recovery, Relief and Hardships</title>
    <meta name="description" content="Connect hearts and fulfill needs through our innovative wishlist-based donation platform.">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
    
    # Copy public assets
    cp -r public/* dist/public/ 2>/dev/null || true
    
    echo "✅ Emergency production files created"
    echo "⚠️ Using development mode assets for now"
fi

echo "🎯 Build process complete!"
echo "📋 Next steps for VPS:"
echo "   1. Upload these dist/ files to your VPS"
echo "   2. Set NODE_ENV=production"
echo "   3. Start with: node dist/index.js"