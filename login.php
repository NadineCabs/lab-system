<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

$idNumber = isset($data['id_number']) ? trim($data['id_number']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Validate input
if (empty($idNumber) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please fill all fields'
    ]);
    exit;
}

try {
    // Find user by ID number (INCLUDING profile_picture)
    $stmt = $conn->prepare("
        SELECT id, id_number, first_name, middle_name, last_name, email, course, course_level, address, password, role, profile_picture 
        FROM users 
        WHERE id_number = :id_number
    ");
    $stmt->execute(['id_number' => $idNumber]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid Student ID or password'
        ]);
        exit;
    }
    
    $user = $stmt->fetch();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['id_number'] = $user['id_number'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['middle_name'] = $user['middle_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['course'] = $user['course'];
        $_SESSION['course_level'] = $user['course_level'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['profile_picture'] = $user['profile_picture'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Login successful!',
            'user' => [
                'id' => $user['id'],
                'id_number' => $user['id_number'],
                'first_name' => $user['first_name'],
                'middle_name' => $user['middle_name'],
                'last_name' => $user['last_name'],
                'full_name' => $user['first_name'] . ' ' . $user['last_name'],
                'email' => $user['email'],
                'course' => $user['course'],
                'course_level' => $user['course_level'],
                'address' => $user['address'],
                'role' => $user['role'],
                'profile_picture' => $user['profile_picture']  // ← ADDED THIS!
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid Student ID or password'
        ]);
    }
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Login failed. Please try again.'
    ]);
}
?>