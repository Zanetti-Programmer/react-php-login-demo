<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $password;
    public $token;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create user
    function create() {
        $query = "INSERT INTO " . $this->table_name . " SET name=:name, email=:email, password=:password, token=:token";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->token = htmlspecialchars(strip_tags($this->token));

        // Hash password
        $this->password = password_hash($this->password, PASSWORD_DEFAULT);

        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":token", $this->token);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Check if email exists
    function emailExists() {
        $query = "SELECT id, name, email, password FROM " . $this->table_name . " WHERE email = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->email);
        $stmt->execute();

        $num = $stmt->rowCount();
        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->password = $row['password'];
            return true;
        }
        return false;
    }

    // Update user token
    function updateToken() {
        $query = "UPDATE " . $this->table_name . " SET token = :token WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':token', $this->token);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get user by token
    function getUserByToken() {
        $query = "SELECT id, name, email FROM " . $this->table_name . " WHERE token = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->token);
        $stmt->execute();

        $num = $stmt->rowCount();
        if($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            return true;
        }
        return false;
    }
}
?>