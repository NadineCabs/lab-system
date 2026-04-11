<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only logged-in students can access their own data
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$userId = $_SESSION['user_id'];
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

try {
    // Get student's COMPLETED sit-in history with session details
    // Only shows records from sit_in_records (which means the session is finished)
    $stmt = $conn->prepare(
        "SELECT 
            sr.id,
            sr.duration_minutes,
            sr.recorded_at,
            sr.feedback_text,
            sr.rating,
            sr.concerns,
            ls.computer_number,
            ls.purpose,
            ls.time_in,
            ls.time_out,
            ls.status,
            r.requested_date,
            r.requested_time
         FROM sit_in_records sr
         LEFT JOIN lab_sessions ls ON ls.id = sr.session_id
         LEFT JOIN reservations r ON r.session_id = ls.id
         WHERE sr.user_id = ?
         ORDER BY sr.recorded_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute([$userId, $limit, $offset]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM sit_in_records WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $totalResult = $countStmt->fetch();
    $total = $totalResult['total'] ?? 0;

    echo json_encode([
        'success' => true,
        'records' => $records,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset,
        'hasMore' => ($offset + $limit) < $total
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
