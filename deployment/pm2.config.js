module.exports = {
  apps: [{
    name: 'myneedfully',
    script: 'server/index.js',
    cwd: '/var/www/myneedfully',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/myneedfully/error.log',
    out_file: '/var/log/myneedfully/out.log',
    log_file: '/var/log/myneedfully/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};