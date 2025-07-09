#!/bin/bash

# MyNeedfully Deployment Script
# Run this script in your project directory on the VPS

set -e

DOMAIN="yourdomain.com"  # Change this to your domain
APP_DIR="/var/www/myneedfully"
USER="myneedfully"

echo "🚀 Deploying MyNeedfully..."

# Create log directory
sudo mkdir -p /var/log/myneedfully
sudo chown $USER:$USER /var/log/myneedfully

# Navigate to app directory
cd $APP_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🔨 Building application..."
npm run build

# Set up environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp deployment/.env.production .env
    echo "❗ Please edit .env file with your actual values before continuing"
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:push

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo cp deployment/nginx.conf /etc/nginx/sites-available/myneedfully
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/myneedfully
sudo ln -sf /etc/nginx/sites-available/myneedfully /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Start/restart services
echo "🔄 Starting services..."
sudo systemctl restart nginx

# Set up PM2
echo "📊 Setting up PM2..."
pm2 delete myneedfully || true
pm2 start deployment/pm2.config.js
pm2 startup
pm2 save

echo "✅ Deployment complete!"
echo "🌍 Your app should be available at: http://$DOMAIN"
echo ""
echo "Next steps:"
echo "1. Set up SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "2. Configure your domain's DNS A records to point to this server"
echo "3. Update Replit Auth settings to include your domain"
echo "4. Test the application thoroughly"