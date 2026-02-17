<?php
// 1. Load Dependencies & Security Variables
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use MongoDB\Client as MongoClient;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Headers for JSON response
header('Content-Type: application/json');

// 2. Connect to MySQL (Using .env variables)
$conn = new mysqli(
    $_ENV['DB_HOST'], 
    $_ENV['DB_USER'], 
    $_ENV['DB_PASS'], 
    $_ENV['DB_NAME']
);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

// 3. Connect to MongoDB
try {
    $mongoClient = new MongoClient($_ENV['MONGODB_URI']);
    // Test connection
    $mongoClient->admin->command(['ping' => 1]);
    $collection = $mongoClient->guvi_profiles->user_data;
} catch (\Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB Connection Failed: " . $e->getMessage()]);
    exit();
}

// 4. Get Data from POST request
$email = $_POST['email'] ?? '';
$pass = $_POST['password'] ?? '';

if(empty($email) || empty($pass)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format"]);
    exit();
}

// 5. Hash Password
$hashed_password = password_hash($pass, PASSWORD_DEFAULT); 

// 6. MySQL Prepared Statement for registration
$stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $conn->error]);
    exit();
}

$stmt->bind_param("ss", $email, $hashed_password);

if ($stmt->execute()) {
    // 7. Create Empty Profile Document in MongoDB 
    try {
        $collection->insertOne([
            'email' => $email,
            'age' => '',
            'dob' => '',
            'contact' => ''
        ]);
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } catch (\Exception $e) {
        echo json_encode(["status" => "error", "message" => "Profile creation failed: " . $e->getMessage()]);
    }
} else {
    if ($conn->errno === 1062) {
        echo json_encode(["status" => "error", "message" => "Email already exists"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Registration failed: " . $stmt->error]);
    }
}

$stmt->close();
$conn->close();
?>