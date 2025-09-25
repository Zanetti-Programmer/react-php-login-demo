<?php
// Application Configuration
class Config {
    // Database Configuration
    const DB_HOST = 'localhost';
    const DB_NAME = 'react_php_login';
    const DB_USER = 'root';
    const DB_PASS = '';
    
    // CORS Configuration
    const ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    
    // JWT Configuration
    const JWT_SECRET = 'your-secret-key-change-in-production';
    const JWT_EXPIRY = 86400; // 24 hours in seconds
    
    // Google OAuth Configuration
    const GOOGLE_CLIENT_ID = 'your-google-client-id';
    
    // Error Configuration
    const DEBUG_MODE = true;
    
    // Token Configuration
    const TOKEN_LENGTH = 64;
    
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