<?php
// 1. Load Dependencies
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;
use MongoDB\Client as MongoClient;
use Predis\Client as RedisClient;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Headers for JSON response
header('Content-Type: application/json');

// 2. Connect to Redis
try {
    $redis = new RedisClient([
        'host' => $_ENV['REDIS_HOST'],
        'port' => $_ENV['REDIS_PORT'],
        'database' => $_ENV['REDIS_DB']
    ]);
    $redis->ping();
} catch (\Exception $e) {
    echo json_encode(["status" => "error", "message" => "Redis Connection Failed"]);
    exit();
}

// 3. Connect to MongoDB
try {
    $mongoClient = new MongoClient($_ENV['MONGODB_URI']);
    $mongoClient->admin->command(['ping' => 1]);
    $collection = $mongoClient->guvi_profiles->user_data;
} catch (\Exception $e) {
    echo json_encode(["status" => "error", "message" => "MongoDB Connection Failed"]);
    exit();
}

// 4. Get token and action from POST request
$token = $_POST['token'] ?? '';
$action = $_POST['action'] ?? '';

if (empty($token)) {
    echo json_encode(["status" => "error", "message" => "Token is required"]);
    exit();
}

// 5. Validate Session (Check if token exists in Redis and get email)
try {
    $email = $redis->get($token);
} catch (\Exception $e) {
    echo json_encode(["status" => "error", "message" => "Session validation failed"]);
    exit();
}

if (!$email) {
    echo json_encode(["status" => "error", "message" => "Session Expired or Invalid Token"]);
    exit();
}

// 6. Handle "UPDATE" Action
if ($action == "update") {
    $age = $_POST['age'] ?? '';
    $dob = $_POST['dob'] ?? '';
    $contact = $_POST['contact'] ?? '';

    try {
        // Update MongoDB Document using updateOne
        $updateResult = $collection->updateOne(
            ['email' => $email],
            ['$set' => [
                'age' => $age,
                'dob' => $dob,
                'contact' => $contact,
                'updated_at' => new \MongoDB\BSON\UTCDateTime()
            ]],
            ['upsert' => true]  // Create document if it doesn't exist
        );

        echo json_encode([
            "status" => "success",
            "message" => "Profile updated successfully",
            "data" => [
                "age" => $age,
                "dob" => $dob,
                "contact" => $contact
            ]
        ]);
    } catch (\Exception $e) {
        echo json_encode(["status" => "error", "message" => "Profile update failed: " . $e->getMessage()]);
    }

// 7. Handle "FETCH" Action
} elseif ($action == "fetch") {
    try {
        // Find MongoDB Document
        $userData = $collection->findOne(['email' => $email]);

        if ($userData) {
            echo json_encode([
                "status" => "success",
                "data" => [
                    "age" => $userData['age'] ?? "",
                    "dob" => $userData['dob'] ?? "",
                    "contact" => $userData['contact'] ?? ""
                ]
            ]);
        } else {
            // Return empty profile if document doesn't exist
            echo json_encode([
                "status" => "success",
                "data" => [
                    "age" => "",
                    "dob" => "",
                    "contact" => ""
                ]
            ]);
        }
    } catch (\Exception $e) {
        echo json_encode(["status" => "error", "message" => "Failed to fetch profile: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
}
?>