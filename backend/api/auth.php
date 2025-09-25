<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_REQUEST['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'register':
        if(!empty($data->name) && !empty($data->email) && !empty($data->password)) {
            $user->name = $data->name;
            $user->email = $data->email;
            $user->password = $data->password;
            $user->token = bin2hex(random_bytes(50));

            // Check if email already exists
            if($user->emailExists()) {
                http_response_code(400);
                echo json_encode(array("message" => "Email already exists."));
            }
            else {
                if($user->create()) {
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "User was created.",
                        "token" => $user->token,
                        "user" => array(
                            "name" => $user->name,
                            "email" => $user->email
                        )
                    ));
                }
                else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to create user."));
                }
            }
        }
        else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
        }
        break;

    case 'login':
        if(!empty($data->email) && !empty($data->password)) {
            $user->email = $data->email;
            
            if($user->emailExists()) {
                if(password_verify($data->password, $user->password)) {
                    $user->token = bin2hex(random_bytes(50));
                    if($user->updateToken()) {
                        http_response_code(200);
                        echo json_encode(array(
                            "message" => "Successful login.",
                            "token" => $user->token,
                            "user" => array(
                                "id" => $user->id,
                                "name" => $user->name,
                                "email" => $user->email
                            )
                        ));
                    }
                    else {
                        http_response_code(503);
                        echo json_encode(array("message" => "Unable to update token."));
                    }
                }
                else {
                    http_response_code(401);
                    echo json_encode(array("message" => "Login failed. Invalid credentials."));
                }
            }
            else {
                http_response_code(401);
                echo json_encode(array("message" => "Login failed. User not found."));
            }
        }
        else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to login. Data is incomplete."));
        }
        break;

    case 'verify':
        $headers = apache_request_headers();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
        
        if(!empty($token)) {
            $user->token = $token;
            if($user->getUserByToken()) {
                http_response_code(200);
                echo json_encode(array(
                    "message" => "Valid token.",
                    "user" => array(
                        "id" => $user->id,
                        "name" => $user->name,
                        "email" => $user->email
                    )
                ));
            }
            else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid token."));
            }
        }
        else {
            http_response_code(400);
            echo json_encode(array("message" => "Token is required."));
        }
        break;

    case 'google':
        if(!empty($data->token)) {
            // In a real application, you would verify the Google token here
            // For now, we'll just extract the user info from the token payload
            // This should be replaced with proper Google OAuth verification
            
            if(!empty($data->name) && !empty($data->email)) {
                $user->name = $data->name;
                $user->email = $data->email;
                $user->password = password_hash(uniqid(), PASSWORD_DEFAULT); // Random password for Google users
                $user->token = bin2hex(random_bytes(50));

                // Check if user already exists
                if($user->emailExists()) {
                    // Update token for existing user
                    if($user->updateToken()) {
                        http_response_code(200);
                        echo json_encode(array(
                            "message" => "Google login successful.",
                            "token" => $user->token,
                            "user" => array(
                                "id" => $user->id,
                                "name" => $user->name,
                                "email" => $user->email
                            )
                        ));
                    }
                    else {
                        http_response_code(503);
                        echo json_encode(array("message" => "Unable to update token."));
                    }
                }
                else {
                    // Create new user
                    if($user->create()) {
                        http_response_code(201);
                        echo json_encode(array(
                            "message" => "Google user created and logged in.",
                            "token" => $user->token,
                            "user" => array(
                                "name" => $user->name,
                                "email" => $user->email
                            )
                        ));
                    }
                    else {
                        http_response_code(503);
                        echo json_encode(array("message" => "Unable to create user."));
                    }
                }
            }
            else {
                http_response_code(400);
                echo json_encode(array("message" => "Invalid Google token data."));
            }
        }
        else {
            http_response_code(400);
            echo json_encode(array("message" => "Google token is required."));
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(array("message" => "Endpoint not found."));
        break;
}
?>