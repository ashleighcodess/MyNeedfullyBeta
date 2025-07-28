/**
 * MyNeedfully Startup Admin Checker
 * This module ensures admin access is properly configured on application startup
 * Include this in your main server startup process
 */

const { neon } = require('@neondatabase/serverless');

const ADMIN_EMAILS = [
  'ashleigh@elitewebdesign.us',
  'info@MyNeedfully.com'
];

async function ensureAdminAccess() {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not found - skipping admin setup');
    return;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔐 Ensuring admin access...');
    
    for (const email of ADMIN_EMAILS) {
      // Check if user exists and update to admin if needed
      const result = await sql`
        UPDATE users 
        SET user_type = 'admin', updated_at = NOW() 
        WHERE email = ${email} AND user_type != 'admin'
        RETURNING email, user_type;
      `;
      
      if (result.length > 0) {
        console.log(`✅ Promoted ${email} to admin`);
      } else {
        // Check if user exists but already admin
        const existingUser = await sql`
          SELECT email, user_type FROM users WHERE email = ${email};
        `;
        
        if (existingUser.length > 0) {
          console.log(`✅ ${email} already has admin access`);
        } else {
          console.log(`ℹ️  ${email} will be granted admin access on first login`);
        }
      }
    }
    
  } catch (error) {
    console.error('⚠️  Admin access setup failed:', error);
    // Don't fail application startup for admin setup issues
  }
}

module.exports = { ensureAdminAccess, ADMIN_EMAILS };