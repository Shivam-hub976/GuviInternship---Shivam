<?php
// 1. Load Dependencies
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use Predis\Client as RedisClient;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Headers for JSON response
header('Content-Type: application/json');

// 2. Connect to MySQL
$conn = new mysqli(
    $_ENV['DB_HOST'], 
    $_ENV['DB_USER'], 
    $_ENV['DB_PASS'], 
    $_ENV['DB_NAME']
);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database Connection Failed"]);
    exit();
}

// 3. Connect to Redis
try {
    $redis = new RedisClient([
        'host' => $_ENV['REDIS_HOST'],
        'port' => $_ENV['REDIS_PORT'],
        'database' => $_ENV['REDIS_DB']
    ]);
    // Test connection
    $redis->ping();
} catch (\Exception $e) {
    echo json_encode(["status" => "error", "message" => "Redis Connection Failed: " . $e->getMessage()]);
    exit();
}

// 4. Get login credentials from POST request
$email = $_POST['email'] ?? '';
$pass = $_POST['password'] ?? '';

if (empty($email) || empty($pass)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit();
}

// 5. Fetch User from MySQL using Prepared Statement
$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // 6. Verify Password using password_verify
    if (password_verify($pass, $row['password'])) {
        
        // 7. Generate Secure Random Token
        $token = bin2hex(random_bytes(32));

        // 8. Store Session in Redis (Expires in 1 hour = 3600 seconds)
        // Key: Token, Value: Email
        try {
            $redis->setex($token, 3600, $email);
            echo json_encode(["status" => "success", "token" => $token, "message" => "Login successful"]);
        } catch (\Exception $e) {
            echo json_encode(["status" => "error", "message" => "Session storage failed: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
}

$stmt->close();
$conn->close();
?>