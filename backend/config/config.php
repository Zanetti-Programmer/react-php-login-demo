<?php
// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

// Load environment variables from .env file
loadEnv(__DIR__ . '/../.env');

// Application Configuration
class Config {
    // Helper method to get environment variables
    public static function getEnv($key, $default = null) {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
    
    // Database Configuration
    public static function getDbHost() {
        return self::getEnv('DB_HOST', 'localhost');
    }
    
    public static function getDbName() {
        return self::getEnv('DB_NAME', 'react_php_login');
    }
    
    public static function getDbUser() {
        return self::getEnv('DB_USER', 'root');
    }
    
    public static function getDbPass() {
        return self::getEnv('DB_PASS', '');
    }
    
    // CORS Configuration
    const ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ];
    
    // JWT Configuration
    public static function getJwtSecret() {
        return self::getEnv('JWT_SECRET', 'your-secret-key-change-in-production');
    }
    
    const JWT_EXPIRY = 86400; // 24 hours in seconds
    
    // Google OAuth Configuration
    public static function getGoogleClientId() {
        return self::getEnv('GOOGLE_CLIENT_ID', 'your-google-client-id');
    }
    
    // Error Configuration
    public static function getDebugMode() {
        return self::getEnv('DEBUG_MODE', 'false') === 'true';
    }
    
    // Token Configuration
    public static function getTokenLength() {
        return (int) self::getEnv('TOKEN_LENGTH', '64');
    }
    
    public static function getCorsHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, self::ALLOWED_ORIGINS)) {
            return [
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Max-Age' => '3600',
                'Access-Control-Allow-Credentials' => 'true'
            ];
        }
        
        return [];
    }
    
    public static function handleCors() {
        $headers = self::getCorsHeaders();
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }
        
        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
?>