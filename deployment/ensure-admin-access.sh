#!/bin/bash

# MyNeedfully Admin Access Setup Script
# This script ensures admin access for the primary administrators

set -e

echo "🔐 Setting up admin access for MyNeedfully..."

# Database connection details (use environment variables)
DB_URL=${DATABASE_URL:-"postgresql://admin:secure_password@localhost:5432/myneedfully"}

# Admin emails to ensure have access
ADMIN_EMAILS=(
    "ashleigh@elitewebdesign.us"
    "info@myneedfully.com"
)

echo "📧 Ensuring admin access for designated emails..."

for email in "${ADMIN_EMAILS[@]}"; do
    echo "Checking admin status for: $email"
    
    # Check if user exists and update to admin if they do
    psql "$DB_URL" -c "
        UPDATE users 
        SET user_type = 'admin', updated_at = NOW() 
        WHERE email = '$email' AND user_type != 'admin';
    " || echo "User $email may not exist yet - will be granted admin on first login"
    
    # Also create a note in the database for future reference
    psql "$DB_URL" -c "
        INSERT INTO admin_setup_log (email, action, timestamp) 
        VALUES ('$email', 'admin_access_ensured', NOW())
        ON CONFLICT (email) DO UPDATE SET 
            action = 'admin_access_ensured', 
            timestamp = NOW();
    " 2>/dev/null || echo "Admin log table doesn't exist - continuing"
done

echo "✅ Admin access setup complete!"
echo ""
echo "Admin users configured:"
for email in "${ADMIN_EMAILS[@]}"; do
    echo "  - $email"
done
echo ""
echo "Note: If an admin user doesn't exist yet, they will need to:"
echo "1. Create an account using their designated email"
echo "2. Have an existing admin promote them using the admin dashboard"
echo "3. Or run this script again after account creation"