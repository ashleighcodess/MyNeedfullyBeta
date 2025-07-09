#!/bin/bash

# PostgreSQL Database Setup for MyNeedfully
# Run this script after server-setup.sh

set -e

echo "🗄️  Setting up PostgreSQL database..."

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE myneedfully;
CREATE USER myneedfully WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE myneedfully TO myneedfully;
\q
EOF

echo "✅ Database setup complete!"
echo "⚠️  Remember to:"
echo "1. Change the default password above"
echo "2. Update your .env file with the correct DATABASE_URL"
echo "3. Run 'npm run db:push' after deploying your app"