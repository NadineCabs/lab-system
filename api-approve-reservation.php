<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only admins can approve reservations
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

    // Begin transaction
    $conn->beginTransaction();

    // Update reservation to approved
    $stmt = $conn->prepare(
        "UPDATE reservations 
         SET status = 'approved', approved_by = ?, approved_at = NOW() 
         WHERE id = ?"
    );
    $stmt->execute([$adminId, $reservationId]);

    echo json_encode([
        'success' => true,
        'message' => 'Reservation approved successfully'
    ]);

    $conn->commit();
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
