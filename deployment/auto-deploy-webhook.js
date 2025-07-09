// GitHub Webhook Auto-Deploy Server
// Place this on your Contabo VPS to enable automatic updates

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 9000;
const WEBHOOK_SECRET = 'your-webhook-secret-here'; // Change this!

app.use(express.json());

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);

  if (!verifySignature(payload, signature)) {
    console.log('❌ Invalid signature');
    return res.status(401).send('Unauthorized');
  }

  // Only deploy on push to main branch
  if (req.body.ref === 'refs/heads/main') {
    console.log('🚀 Deploying latest changes...');
    
    exec('cd /var/www/myneedfully && ./update-from-github.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Deploy error:', error);
        return res.status(500).send('Deploy failed');
      }
      
      console.log('✅ Deploy output:', stdout);
      res.status(200).send('Deploy successful');
    });
  } else {
    res.status(200).send('Not main branch, ignoring');
  }
});

app.listen(PORT, () => {
  console.log(`🎣 Webhook server listening on port ${PORT}`);
});