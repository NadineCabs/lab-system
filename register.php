<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';
$full_name = isset($data['full_name']) ? trim($data['full_name']) : '';
$student_id = isset($data['student_id']) ? trim($data['student_id']) : '';

// Validate input
if (empty($username) || empty($password) || empty($full_name) || empty($student_id)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please fill all fields'
    ]);
    exit;
}

// Validate password length
if (strlen($password) < 6) {
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 6 characters'
    ]);
    exit;
}

try {
    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Username already exists'
        ]);
        exit;
    }
    
    // Check if student ID already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE student_id = :student_id");
    $stmt->execute(['student_id' => $student_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Student ID already registered'
        ]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (username, password, full_name, student_id, role) VALUES (:username, :password, :full_name, :student_id, 'student')");
    $stmt->execute([
        'username' => $username,
        'password' => $hashedPassword,
        'full_name' => $full_name,
        'student_id' => $student_id
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! You can now login.'
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed. Please try again.'
    ]);
}
?>