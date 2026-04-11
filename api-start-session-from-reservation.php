<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only students can use approved reservations to start a session
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = isset($data['reservation_id']) ? (int)$data['reservation_id'] : null;
$userId = $_SESSION['user_id'];

if (!$reservationId) {
    echo json_encode(['success' => false, 'message' => 'Reservation ID is required']);
    exit;
}

try {
    // Get reservation and verify it's approved
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE id = ? AND user_id = ? AND status = 'approved'");
    $stmt->execute([$reservationId, $userId]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        echo json_encode(['success' => false, 'message' => 'Reservation not found or not approved']);
        exit;
    }

    // Check if student already has an active session
    $stmt = $conn->prepare("SELECT id FROM lab_sessions WHERE user_id = ? AND status = 'active'");
    $stmt->execute([$userId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'You already have an active session']);
        exit;
    }

    // Begin transaction
    $conn->beginTransaction();

    // Create new lab session linked to the reservation
    $stmt = $conn->prepare(
        "INSERT INTO lab_sessions (user_id, reservation_id, time_in, computer_number, purpose, status) 
         VALUES (?, ?, NOW(), ?, ?, 'active')"
    );
    $stmt->execute([$userId, $reservationId, $reservation['computer_number'], $reservation['purpose']]);
    $sessionId = $conn->lastInsertId();

    // Update reservation with session_id
    $stmt = $conn->prepare("UPDATE reservations SET session_id = ? WHERE id = ?");
    $stmt->execute([$sessionId, $reservationId]);

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Session started successfully',
        'session_id' => $sessionId
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
