<?php
// Include configuration
include_once '../config/config.php';
include_once '../config/database.php';
include_once '../models/User.php';

// Handle CORS
Config::handleCors();

// Set content type
header("Content-Type: application/json; charset=UTF-8");

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Check for database connection and provide mock responses in debug mode
if (!$db && Config::getDebugMode()) {
    error_log("Database connection failed, using mock responses for development");
    
    // Handle mock responses for development
    if ($action === 'google' || $action === 'login' || $action === 'register') {
        sendSuccess("Mock authentication successful (database not available)", array(
            "token" => "mock-token-" . uniqid(),
            "user" => array(
                "id" => 1,
                "name" => $data->name ?? "Mock User",
                "email" => $data->email ?? "mock@example.com"
            )
        ));
        exit();
    }
}

if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
    exit();
}

// Error handling function
function handleError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(array("message" => $message));
    exit();
}

// Success response function
function sendSuccess($message, $data = null, $code = 200) {
    http_response_code($code);
    $response = array("message" => $message);
    if ($data) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

try {
    switch($action) {
        case 'register':
            if(empty($data->name) || empty($data->email) || empty($data->password)) {
                handleError("All fields are required for registration.");
            }
            
            if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                handleError("Invalid email format.");
            }
            
            if (strlen($data->password) < 6) {
                handleError("Password must be at least 6 characters long.");
            }

            $user->name = $data->name;
            $user->email = $data->email;
            $user->password = $data->password;
            $user->token = bin2hex(random_bytes(Config::getTokenLength() / 2));

            // Check if email already exists
            if($user->emailExists()) {
                handleError("Email already exists.", 409);
            }

            if($user->create()) {
                sendSuccess("User created successfully.", array(
                    "token" => $user->token,
                    "user" => array(
                        "name" => $user->name,
                        "email" => $user->email
                    )
                ), 201);
            } else {
                handleError("Failed to create user.", 500);
            }
            break;

        case 'login':
            if(empty($data->email) || empty($data->password)) {
                handleError("Email and password are required.");
            }
            
            if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                handleError("Invalid email format.");
            }

            $user->email = $data->email;
            
            if($user->emailExists()) {
                if(password_verify($data->password, $user->password)) {
                    $user->token = bin2hex(random_bytes(Config::getTokenLength() / 2));
                    if($user->updateToken()) {
                        sendSuccess("Login successful.", array(
                            "token" => $user->token,
                            "user" => array(
                                "id" => $user->id,
                                "name" => $user->name,
                                "email" => $user->email
                            )
                        ));
                    } else {
                        handleError("Failed to generate session token.", 500);
                    }
                } else {
                    handleError("Invalid credentials.", 401);
                }
            } else {
                handleError("User not found.", 401);
            }
            break;

        case 'verify':
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            $token = str_replace('Bearer ', '', $authHeader);
            
            if(empty($token)) {
                handleError("Authorization token is required.", 401);
            }

            $user->token = $token;
            if($user->getUserByToken()) {
                sendSuccess("Token is valid.", array(
                    "user" => array(
                        "id" => $user->id,
                        "name" => $user->name,
                        "email" => $user->email
                    )
                ));
            } else {
                handleError("Invalid or expired token.", 401);
            }
            break;

        case 'google':
            if(empty($data->token) || empty($data->name) || empty($data->email)) {
                handleError("Google authentication data is incomplete.");
            }
            
            if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
                handleError("Invalid email format from Google.");
            }

            // TODO: Verify Google token with Google's API
            // For now, we trust the client-side verification
            
            $user->name = $data->name;
            $user->email = $data->email;
            $user->password = password_hash(uniqid(), PASSWORD_DEFAULT); // Random password for Google users
            $user->token = bin2hex(random_bytes(Config::getTokenLength() / 2));

            // Check if user already exists
            if($user->emailExists()) {
                // Update token for existing user
                if($user->updateToken()) {
                    sendSuccess("Google login successful.", array(
                        "token" => $user->token,
                        "user" => array(
                            "id" => $user->id,
                            "name" => $user->name,
                            "email" => $user->email
                        )
                    ));
                } else {
                    handleError("Failed to update session token.", 500);
                }
            } else {
                // Create new user
                if($user->create()) {
                    sendSuccess("Google account linked successfully.", array(
                        "token" => $user->token,
                        "user" => array(
                            "name" => $user->name,
                            "email" => $user->email
                        )
                    ), 201);
                } else {
                    handleError("Failed to create user account.", 500);
                }
            }
            break;

        case 'logout':
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            $token = str_replace('Bearer ', '', $authHeader);
            
            if(!empty($token)) {
                $user->token = $token;
                if($user->getUserByToken()) {
                    $user->token = null;
                    $user->updateToken();
                }
            }
            
            sendSuccess("Logged out successfully.");
            break;

        default:
            handleError("Invalid action specified.", 404);
            break;
    }
    
} catch (Exception $e) {
    if (Config::getDebugMode()) {
        handleError("Server error: " . $e->getMessage(), 500);
    } else {
        handleError("Internal server error.", 500);
    }
}
?>