<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

$idNumber = isset($data['id_number']) ? trim($data['id_number']) : '';
$firstName = isset($data['first_name']) ? trim($data['first_name']) : '';
$middleName = isset($data['middle_name']) ? trim($data['middle_name']) : '';
$lastName = isset($data['last_name']) ? trim($data['last_name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$course = isset($data['course']) ? trim($data['course']) : '';
$courseLevel = isset($data['course_level']) ? intval($data['course_level']) : 0;
$address = isset($data['address']) ? trim($data['address']) : '';
$role = isset($data['role']) ? trim($data['role']) : 'student';
$password = isset($data['password']) ? $data['password'] : '';
$repeatPassword = isset($data['repeat_password']) ? $data['repeat_password'] : '';

// Validate input
if (empty($idNumber) || empty($firstName) || empty($lastName) || empty($email) || 
    empty($course) || empty($courseLevel) || empty($role) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please fill all required fields'
    ]);
    exit;
}

// Validate password match
if ($password !== $repeatPassword) {
    echo json_encode([
        'success' => false,
        'message' => 'Passwords do not match'
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

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit;
}

try {
    // Check if ID number already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id_number = :id_number");
    $stmt->execute(['id_number' => $idNumber]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'ID number already registered'
        ]);
        exit;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Normalize and enforce allowed roles
    $allowedRoles = ['student', 'admin'];
    if (!in_array($role, $allowedRoles, true)) {
        $role = 'student';
    }
    
    // Insert user
    $stmt = $conn->prepare("
        INSERT INTO users (id_number, first_name, middle_name, last_name, email, course, course_level, address, password, role) 
        VALUES (:id_number, :first_name, :middle_name, :last_name, :email, :course, :course_level, :address, :password, :role)
    ");
    
    $stmt->execute([
        'id_number' => $idNumber,
        'first_name' => $firstName,
        'middle_name' => $middleName,
        'last_name' => $lastName,
        'email' => $email,
        'course' => $course,
        'course_level' => $courseLevel,
        'address' => $address,
        'password' => $hashedPassword,
        'role' => $role
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