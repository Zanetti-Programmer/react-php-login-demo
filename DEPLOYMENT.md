# Deployment Guide

This guide will help you deploy the React PHP Login Demo to a production environment.

## Prerequisites

- Web server (Apache/Nginx) with PHP 7.4+
- MySQL 5.7+ or MariaDB
- Node.js 18+ (for building the React app)
- SSL certificate (recommended for production)

## Backend Deployment

### 1. Server Setup

1. **Upload Backend Files**
   ```bash
   # Upload the backend folder to your web server
   scp -r backend/ user@your-server.com:/var/www/html/react-php-login-demo/
   ```

2. **Set Permissions**
   ```bash
   # Set proper permissions
   chown -R www-data:www-data /var/www/html/react-php-login-demo/backend/
   chmod -R 755 /var/www/html/react-php-login-demo/backend/
   ```

### 2. Database Setup

1. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE react_php_login;
   CREATE USER 'phpuser'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON react_php_login.* TO 'phpuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Import Schema**
   ```bash
   mysql -u phpuser -p react_php_login < backend/setup_database.sql
   ```

### 3. Configuration

1. **Update Database Config**
   ```php
   // backend/config/database.php
   private $host = 'localhost';
   private $db_name = 'react_php_login';
   private $username = 'phpuser';
   private $password = 'secure_password';
   ```

2. **Update CORS Settings**
   ```php
   // backend/config/config.php
   const ALLOWED_ORIGINS = [
       'https://yourdomain.com',
       'https://www.yourdomain.com'
   ];
   ```

3. **Security Configuration**
   ```php
   // Change these in production
   const JWT_SECRET = 'your-very-secure-secret-key';
   const DEBUG_MODE = false;
   ```

### 4. Web Server Configuration

#### Apache (.htaccess)
```apache
# backend/.htaccess
RewriteEngine On

# CORS Headers
Header always set Access-Control-Allow-Origin "https://yourdomain.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Handle preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

#### Nginx
```nginx
location /react-php-login-demo/backend/api/ {
    add_header Access-Control-Allow-Origin "https://yourdomain.com";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
    
    if ($request_method = 'OPTIONS') {
        return 200;
    }
    
    try_files $uri $uri/ /index.php?$query_string;
}
```

## Frontend Deployment

### 1. Build Production Version

1. **Configure Environment**
   ```bash
   # Create .env.production
   REACT_APP_API_BASE_URL=https://yourdomain.com/react-php-login-demo/backend/api
   REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

2. **Build for Production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### 2. Deploy Build Files

1. **Upload Build Files**
   ```bash
   # Upload the build folder contents
   scp -r build/* user@your-server.com:/var/www/html/yourdomain.com/
   ```

2. **Configure Web Server**

#### Apache (Virtual Host)
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/html/yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Handle React Router
    FallbackResource /index.html
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' accounts.google.com; style-src 'self' 'unsafe-inline'"
</VirtualHost>
```

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    root /var/www/html/yourdomain.com;
    index index.html;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy (if needed)
    location /api/ {
        proxy_pass http://localhost/react-php-login-demo/backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

## Google OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized domains: `yourdomain.com`
6. Add authorized redirect URIs: `https://yourdomain.com`

### 2. Update Configuration

```php
// backend/config/config.php
const GOOGLE_CLIENT_ID = 'your-actual-google-client-id';
```

```bash
# frontend/.env.production
REACT_APP_GOOGLE_CLIENT_ID=your-actual-google-client-id
```

## Security Checklist

- [ ] Change default database credentials
- [ ] Update JWT secret key
- [ ] Disable debug mode in production
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set security headers
- [ ] Enable PHP security features
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Monitor error logs

## Performance Optimization

### Backend
- Enable PHP OPcache
- Use connection pooling
- Add Redis/Memcached for sessions
- Optimize database queries
- Enable gzip compression

### Frontend
- Enable gzip compression
- Set proper cache headers
- Use CDN for static assets
- Optimize images
- Enable HTTP/2

## Monitoring

### Error Logging
```php
// backend/config/config.php
const LOG_ERRORS = true;
const LOG_FILE = '/var/log/react-php-login/errors.log';
```

### Analytics
- Google Analytics
- Server monitoring (New Relic, DataDog)
- Database monitoring
- Error tracking (Sentry)

## Backup Strategy

1. **Database Backups**
   ```bash
   # Daily backup cron job
   0 2 * * * mysqldump -u phpuser -p react_php_login > /backups/db_$(date +\%Y\%m\%d).sql
   ```

2. **File Backups**
   ```bash
   # Weekly file backup
   0 3 * * 0 tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz /var/www/html/react-php-login-demo/
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check allowed origins in config
   - Verify web server CORS headers
   - Ensure OPTIONS requests are handled

2. **Database Connection**
   - Verify credentials
   - Check MySQL service status
   - Review PHP error logs

3. **Google OAuth Issues**
   - Verify client ID configuration
   - Check authorized domains
   - Ensure HTTPS is enabled

### Debug Mode
```php
// Enable temporarily for debugging
const DEBUG_MODE = true;
```

## Support

For deployment issues, check:
1. Web server error logs
2. PHP error logs
3. Browser developer console
4. Network requests in browser tools