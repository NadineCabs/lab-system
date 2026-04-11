<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only admins can view all reservations
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    // Get all reservations with student info
    $stmt = $conn->prepare(
        "SELECT 
            r.id,
            r.user_id,
            r.computer_number,
            r.purpose,
            r.requested_date,
            r.requested_time,
            r.duration_hours,
            r.status,
            r.created_at,
            r.rejection_reason,
            u.id_number,
            u.first_name,
            u.last_name,
            u.email
         FROM reservations r
         JOIN users u ON u.id = r.user_id
         ORDER BY 
            CASE 
                WHEN r.status = 'pending' THEN 1
                WHEN r.status = 'approved' THEN 2
                WHEN r.status = 'rejected' THEN 3
                WHEN r.status = 'cancelled' THEN 4
            END,
            r.requested_date DESC,
            r.requested_time DESC"
    );
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count pending
    $countStmt = $conn->prepare("SELECT COUNT(*) as pending FROM reservations WHERE status = 'pending'");
    $countStmt->execute();
    $pendingCount = $countStmt->fetch()['pending'] ?? 0;

    echo json_encode([
        'success' => true,
        'reservations' => $reservations,
        'total' => count($reservations),
        'pending_count' => $pendingCount
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
