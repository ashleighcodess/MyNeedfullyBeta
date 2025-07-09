# MyNeedfully VPS Deployment Guide

This guide helps you deploy MyNeedfully to your Contabo VPS with your own domain.

## Prerequisites

- Contabo VPS with Ubuntu 20.04+ 
- Your domain name configured
- SSH access to your VPS
- Basic command line knowledge

## Step-by-Step Deployment

### 1. Initial Server Setup

SSH into your VPS and run the server setup script:

```bash
chmod +x deployment/server-setup.sh
./deployment/server-setup.sh
```

### 2. Database Configuration

Set up PostgreSQL database:

```bash
chmod +x deployment/database-setup.sh
./deployment/database-setup.sh
```

**Important**: Change the default password in the script before running!

### 3. Application Deployment

Copy your project files to `/var/www/myneedfully` and run:

```bash
# Make deploy script executable
chmod +x deployment/deploy.sh

# Edit the domain in the script
nano deployment/deploy.sh  # Change "yourdomain.com" to your actual domain

# Run deployment
./deployment/deploy.sh
```

### 4. Environment Configuration

Edit the `.env` file with your actual values:

```bash
nano .env
```

Update these critical values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A secure random string (64+ characters)
- `SENDGRID_API_KEY` - Your SendGrid API key
- `SERPAPI_API_KEY` - Your SerpAPI key
- `RAINFOREST_API_KEY` - Your RainforestAPI key
- `REPL_ID` - Your Replit app ID
- `REPLIT_DOMAINS` - Your domain(s)

### 5. SSL Certificate Setup

After your domain DNS is configured:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6. DNS Configuration

Configure your domain's DNS records:
- A record: `yourdomain.com` → `your_vps_ip`
- A record: `www.yourdomain.com` → `your_vps_ip`

### 7. OAuth Setup

Update your Replit Auth app settings:
1. Go to your Replit app settings
2. Add your domain to authorized redirect URIs:
   - `https://yourdomain.com/api/callback`
   - `https://www.yourdomain.com/api/callback`

## Post-Deployment

### Monitoring

Check application status:
```bash
pm2 status
pm2 logs myneedfully
```

### Updates

To update your application:
```bash
cd /var/www/myneedfully
git pull origin main
npm install
npm run build
pm2 restart myneedfully
```

### Backup

Set up automated backups:
```bash
# Database backup
pg_dump myneedfully > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/myneedfully
```

## Troubleshooting

### Common Issues

1. **Database connection fails**: Check DATABASE_URL format
2. **OAuth redirect errors**: Verify REPLIT_DOMAINS matches your domain
3. **SSL certificate issues**: Ensure domain DNS is propagated
4. **PM2 process crashes**: Check logs with `pm2 logs myneedfully`

### Useful Commands

```bash
# Check Nginx configuration
sudo nginx -t

# Restart services
sudo systemctl restart nginx
pm2 restart myneedfully

# View logs
tail -f /var/log/myneedfully/combined.log
sudo tail -f /var/log/nginx/error.log
```

## Security Notes

- Change default passwords immediately
- Keep system packages updated
- Use strong session secrets
- Enable firewall (UFW)
- Monitor access logs regularly

## Support

For deployment issues, check:
1. Server logs (`pm2 logs`)
2. Nginx logs (`/var/log/nginx/`)
3. Database connectivity
4. Environment variables
5. Domain DNS propagation