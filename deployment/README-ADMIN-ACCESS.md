# Admin Access Setup for MyNeedfully

This document explains how admin access is configured for production deployment of MyNeedfully.

## Designated Admin Users

The following email addresses are configured as permanent administrators:

- `ashleigh@elitewebdesign.us` 
- `info@myneedfully.com`

## How Admin Access Works

### 1. Automatic Setup During Deployment

The deployment script (`deployment/deploy.sh`) automatically runs `deployment/setup-admin-access.js` which:

- Checks if each designated admin email exists in the database
- Promotes them to admin status if they're regular users
- Logs the results for verification

### 2. Runtime Admin Checking

The server includes `deployment/ensure-admin-on-startup.js` which:

- Runs on every application startup
- Ensures admin emails maintain admin status
- Provides failsafe against accidental admin removal

### 3. Manual Admin Promotion

If needed, existing admins can promote other users via:

- Admin Dashboard → Administrative Actions → "Promote User"
- API endpoint: `POST /api/admin/promote-user` with `{ "email": "user@example.com" }`

## Production Deployment Steps

### For New Deployment

1. Deploy the application using `deployment/deploy.sh`
2. The script automatically sets up admin access
3. Verify admin access by logging in with designated emails

### For Existing Deployment

If you need to ensure admin access on an existing deployment:

```bash
# Run the admin setup script manually
cd /var/www/myneedfully
node deployment/setup-admin-access.js
```

### For Development/Testing

In development, you can manually promote users:

```sql
UPDATE users SET user_type = 'admin' WHERE email = 'your-email@example.com';
```

## Security Notes

- Admin status is automatically verified on server startup
- All admin actions are logged for security monitoring
- Admin access cannot be accidentally removed by the automated system
- Admin emails are hardcoded in deployment scripts for security

## Troubleshooting

### Admin User Not Found

If an admin email doesn't exist in the database:

1. The user must first create an account using that email
2. Run the admin setup script again: `node deployment/setup-admin-access.js`
3. Or have an existing admin promote them via the dashboard

### Admin Access Lost

If admin access is accidentally removed:

1. Check the server logs for admin setup messages
2. Restart the application (admin access is verified on startup)
3. Or run the manual setup script: `node deployment/setup-admin-access.js`

### Multiple Authentication Providers

If an admin user signs up with a different authentication provider (Google, Facebook, etc.) than expected:

1. Check the actual email in the database
2. Update the admin setup script if the email format differs
3. Ensure the email verification status doesn't block admin access

## Files Involved

- `deployment/setup-admin-access.js` - Main admin setup script
- `deployment/ensure-admin-on-startup.js` - Runtime admin checker
- `server/routes.ts` - Contains `/api/admin/promote-user` endpoint
- `deployment/deploy.sh` - Runs admin setup during deployment