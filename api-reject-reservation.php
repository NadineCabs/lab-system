<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only admins can reject reservations
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = isset($data['reservation_id']) ? (int)$data['reservation_id'] : null;
$rejectionReason = isset($data['rejection_reason']) ? trim($data['rejection_reason']) : 'No reason provided';
$adminId = $_SESSION['user_id'];

if (!$reservationId) {
    echo json_encode(['success' => false, 'message' => 'Reservation ID is required']);
    exit;
}

try {
    // Get reservation details
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE id = ? AND status = 'pending'");
    $stmt->execute([$reservationId]);
    $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reservation) {
        echo json_encode(['success' => false, 'message' => 'Reservation not found or already processed']);
        exit;
    }

    // Update reservation to rejected
    $stmt = $conn->prepare(
        "UPDATE reservations 
         SET status = 'rejected', rejection_reason = ?, approved_by = ?, approved_at = NOW() 
         WHERE id = ?"
    );
    $stmt->execute([$rejectionReason, $adminId, $reservationId]);

    echo json_encode([
        'success' => true,
        'message' => 'Reservation rejected'
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
