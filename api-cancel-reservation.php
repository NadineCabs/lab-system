<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only students can cancel their own reservations
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
    // Get reservation and verify ownership
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE id = ? AND user_id = ? AND status IN ('pending', 'approved')");
    $stmt->execute([$reservationId, $userId]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        echo json_encode(['success' => false, 'message' => 'Reservation not found or cannot be cancelled']);
        exit;
    }

    // Update reservation to cancelled
    $stmt = $conn->prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?");
    $stmt->execute([$reservationId]);

    echo json_encode([
        'success' => true,
        'message' => 'Reservation cancelled successfully'
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
