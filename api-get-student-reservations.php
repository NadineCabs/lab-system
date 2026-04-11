<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only students can view their own reservations
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$userId = $_SESSION['user_id'];
$status = isset($_GET['status']) ? trim($_GET['status']) : ''; // 'pending', 'approved', 'rejected', 'cancelled', or empty for all

try {
    $query = "SELECT r.*, u.first_name, u.last_name FROM reservations r 
              LEFT JOIN users u ON u.id = r.approved_by 
              WHERE r.user_id = ?";
    $params = [$userId];

    if (!empty($status)) {
        $query .= " AND r.status = ?";
        $params[] = $status;
    }

    $query .= " ORDER BY r.requested_date DESC, r.requested_time DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'reservations' => $reservations,
        'total' => count($reservations)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
