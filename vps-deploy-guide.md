# VPS Deployment Guide - Fix for Blank Screen

## The Issue
Your VPS is serving HTML but missing the compiled frontend assets (`/assets/index-CActLCm2.js`, `/assets/index-DrwGcKPi.css`).

## Solution

### Step 1: Build Properly on Replit
```bash
./vps-build-fix.sh
```

### Step 2: Upload to Your VPS
```bash
# Option A: Using git (recommended)
git add .
git commit -m "Added production build files"
git push origin main

# Then on VPS:
cd /var/www/myneedfully
git pull origin main
```

### Step 3: Start Production Server
```bash
# On your VPS:
cd /var/www/myneedfully
NODE_ENV=production pm2 start dist/index.js --name myneedfully
```

## Alternative: Direct Upload
If git doesn't work, upload the dist/ folder directly:

```bash
# From Replit, upload dist/ to your VPS
rsync -avz dist/ root@your-vps-ip:/var/www/myneedfully/dist/
```

## Verification
Check if it's working:
```bash
# On VPS:
curl http://localhost:5000
# Should return HTML with working asset links

# Check assets exist:
ls -la /var/www/myneedfully/dist/public/assets/
```

## If Still Broken
The emergency fallback will serve a development-style HTML that loads assets differently, which should work even without full compilation.