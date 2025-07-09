#!/bin/bash

echo "🚨 IMMEDIATE VPS FIX - No Git/PM2 Required"

# Create the corrected HTML file directly
echo "📝 Creating corrected HTML file..."
cat > /tmp/fixed-index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>MyNeedfully - A Registry For Recovery, Relief and Hardships</title>
    <meta name="description" content="Connect hearts and fulfill needs through our innovative wishlist-based donation platform. Help families in crisis, support communities, and make a difference.">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo "✅ Fixed HTML file created at /tmp/fixed-index.html"
echo ""
echo "📋 COPY AND PASTE THESE COMMANDS ON YOUR VPS:"
echo ""
echo "# 1. Navigate to your app directory"
echo "cd /var/www/myneedfully"
echo ""
echo "# 2. Install PM2 process manager"
echo "npm install -g pm2"
echo ""
echo "# 3. Replace the broken HTML file"
echo "mkdir -p dist/public"
echo "cat > dist/public/index.html << 'HTMLEOF'"
cat /tmp/fixed-index.html
echo "HTMLEOF"
echo ""
echo "# 4. Start or restart your app with PM2"
echo "pm2 stop myneedfully 2>/dev/null || true"
echo "NODE_ENV=production pm2 start dist/index.js --name myneedfully"
echo "pm2 save"
echo ""
echo "🎯 Your app should now work without the blank screen!"