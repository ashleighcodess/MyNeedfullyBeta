# Auto-Deploy Setup (Optional)

## Manual Updates (Recommended for Beginners)
1. Push to GitHub from Replit
2. SSH to your VPS: `ssh root@your-server-ip`
3. Run: `cd /var/www/myneedfully && ./update-from-github.sh`

## Automatic Updates (Advanced)

If you want your site to update automatically when you push to GitHub:

### Step 1: Install Webhook Server on VPS
```bash
# Copy the webhook file to your server
scp deployment/auto-deploy-webhook.js root@your-server-ip:/var/www/
cd /var/www
npm install express
```

### Step 2: Start Webhook Service
```bash
# Create systemd service
sudo tee /etc/systemd/system/myneedfully-webhook.service > /dev/null <<EOF
[Unit]
Description=MyNeedfully Auto-Deploy Webhook
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www
ExecStart=/usr/bin/node auto-deploy-webhook.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start the service
sudo systemctl enable myneedfully-webhook
sudo systemctl start myneedfully-webhook
```

### Step 3: Configure GitHub Webhook
1. Go to your GitHub repo → Settings → Webhooks
2. Click "Add webhook"
3. Payload URL: `http://your-server-ip:9000/webhook`
4. Content type: `application/json`
5. Secret: Use the same secret from the webhook file
6. Events: Just "push" events
7. Save

### Step 4: Test
Push a change to GitHub and watch your VPS automatically update!

## Comparison

| Method | Pros | Cons |
|--------|------|------|
| Manual | Simple, reliable, you control timing | Need to SSH and run command |
| Auto | Instant updates, no manual work | More complex setup, potential issues |

**Recommendation:** Start with manual updates. Once you're comfortable, add auto-deploy later.