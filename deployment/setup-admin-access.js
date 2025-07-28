#!/usr/bin/env node

/**
 * MyNeedfully Admin Access Setup
 * This script ensures designated emails have admin access in production
 */

const { Client } = require('pg');

// Admin emails that should always have admin access
const ADMIN_EMAILS = [
  'ashleigh@elitewebdesign.us',
  'info@MyNeedfully.com'
];

async function setupAdminAccess() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔐 Setting up admin access for MyNeedfully...');

    for (const email of ADMIN_EMAILS) {
      console.log(`📧 Checking admin status for: ${email}`);
      
      // Check if user exists
      const userResult = await client.query(
        'SELECT id, email, user_type FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        if (user.user_type !== 'admin') {
          // Promote to admin
          await client.query(
            'UPDATE users SET user_type = $1, updated_at = NOW() WHERE id = $2',
            ['admin', user.id]
          );
          console.log(`✅ Promoted ${email} to admin`);
        } else {
          console.log(`✅ ${email} already has admin access`);
        }
      } else {
        console.log(`⚠️  User ${email} not found - will be granted admin on first login`);
      }
    }

    console.log('\n🎉 Admin access setup complete!');
    console.log('\nConfigured admin users:');
    ADMIN_EMAILS.forEach(email => console.log(`  - ${email}`));
    
  } catch (error) {
    console.error('❌ Error setting up admin access:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  setupAdminAccess();
}

module.exports = { setupAdminAccess, ADMIN_EMAILS };