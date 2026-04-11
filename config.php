<?php
// Database configuration
$host = 'localhost';
$dbname = 'sit_in_monitoring';
$username = 'root';
$password = '';  // Change this if you have a MySQL password

// Create PDO connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please contact administrator.'
    ]));
}
?>