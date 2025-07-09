#!/bin/bash

# MyNeedfully - Quick Update Script
# Run this on your server to deploy latest changes from GitHub

echo "🚀 Updating MyNeedfully from GitHub..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the myneedfully directory?"
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Check if package.json changed (new dependencies)
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
    echo "📦 Installing new dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart myneedfully
    echo "✅ Application restarted with PM2"
elif systemctl is-active --quiet myneedfully; then
    sudo systemctl restart myneedfully
    echo "✅ Application restarted with systemctl"
else
    echo "⚠️  Please manually restart your application"
fi

echo "🎉 Update complete! Your site is now running the latest version."

# Show status
if command -v pm2 &> /dev/null; then
    pm2 status myneedfully
fi