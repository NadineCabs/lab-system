<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Check if admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$studentId = isset($data['student_id']) ? (int)$data['student_id'] : null;
$computerNumber = isset($data['computer_number']) ? trim($data['computer_number']) : '';
$purpose = isset($data['purpose']) ? trim($data['purpose']) : '';

if (!$studentId || empty($computerNumber)) {
    echo json_encode(['success' => false, 'message' => 'Student ID and computer number are required']);
    exit;
}

try {
    // Check if student exists
    $stmt = $conn->prepare("SELECT id, id_number, first_name, last_name FROM users WHERE id = ? AND role = 'student'");
    $stmt->execute([$studentId]);
    $student = $stmt->fetch();

    if (!$student) {
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    // Check if student already has an active session
    $stmt = $conn->prepare("SELECT id FROM lab_sessions WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$studentId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Student already has an active session']);
        exit;
    }

    // Create new session
    $stmt = $conn->prepare(
        "INSERT INTO lab_sessions (user_id, time_in, computer_number, purpose, status) 
         VALUES (?, NOW(), ?, ?, 'active')"
    );
    $stmt->execute([$studentId, $computerNumber, $purpose]);
    
    $sessionId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Sit-in session initiated successfully',
        'session_id' => $sessionId,
        'student_name' => $student['first_name'] . ' ' . $student['last_name']
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
