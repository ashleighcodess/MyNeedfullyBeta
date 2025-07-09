#!/bin/bash

# MyNeedfully VPS Setup Script
# Run this script on your Contabo VPS after SSH login

set -e

echo "🚀 Setting up MyNeedfully on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Git (if not already installed)
echo "📦 Installing Git..."
sudo apt install -y git

# Install SSL tools
echo "📦 Installing SSL tools..."
sudo apt install -y certbot python3-certbot-nginx

# Create application user
echo "👤 Creating application user..."
sudo useradd -m -s /bin/bash myneedfully
sudo usermod -aG sudo myneedfully

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/myneedfully
sudo chown myneedfully:myneedfully /var/www/myneedfully

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Clone your application code"
echo "3. Configure environment variables"
echo "4. Set up Nginx and SSL"