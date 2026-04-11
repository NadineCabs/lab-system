<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only students can create reservations
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];
$computerNumber = isset($data['computer_number']) ? trim($data['computer_number']) : '';
$purpose = isset($data['purpose']) ? trim($data['purpose']) : '';
$requestedDate = isset($data['requested_date']) ? trim($data['requested_date']) : '';
$requestedTime = isset($data['requested_time']) ? trim($data['requested_time']) : '';
$durationHours = isset($data['duration_hours']) ? (int)$data['duration_hours'] : 1;

// Validate inputs
if (empty($computerNumber) || empty($purpose) || empty($requestedDate) || empty($requestedTime)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if ($durationHours < 1 || $durationHours > 8) {
    echo json_encode(['success' => false, 'message' => 'Duration must be between 1 and 8 hours']);
    exit;
}

// Validate date is in the future
$requestDateTime = new DateTime($requestedDate . ' ' . $requestedTime);
$now = new DateTime();
if ($requestDateTime <= $now) {
    echo json_encode(['success' => false, 'message' => 'Reservation must be for a future date and time']);
    exit;
}

try {
    // Check if student already has a pending/approved reservation for the same time
    $stmt = $conn->prepare(
        "SELECT id FROM reservations 
         WHERE user_id = ? AND requested_date = ? AND requested_time = ? 
         AND status IN ('pending', 'approved')"
    );
    $stmt->execute([$userId, $requestedDate, $requestedTime]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'You already have a pending or approved reservation for this time']);
        exit;
    }

    // Check if computer is already reserved by someone else at the same time
    $stmt = $conn->prepare(
        "SELECT id FROM reservations 
         WHERE computer_number = ? AND requested_date = ? AND requested_time = ? 
         AND ('approved', 'pending') AND user_id != ?"
    );
    $stmt->execute([$computerNumber, $requestedDate, $requestedTime, $userId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'This computer is already reserved for this time']);
        exit;
    }

    // Create reservation
    $stmt = $conn->prepare(
        "INSERT INTO reservations (user_id, computer_number, purpose, requested_date, requested_time, duration_hours, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')"
    );
    $stmt->execute([$userId, $computerNumber, $purpose, $requestedDate, $requestedTime, $durationHours]);
    $reservationId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Reservation submitted successfully. Waiting for admin approval.',
        'reservation_id' => $reservationId
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
