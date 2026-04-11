<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Check if admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $stmt = $conn->prepare(
        "SELECT 
            s.id,
            s.user_id,
            u.id_number,
            u.first_name,
            u.last_name,
            u.course,
            s.computer_number,
            s.purpose,
            s.time_in,
            TIMESTAMPDIFF(MINUTE, s.time_in, NOW()) AS duration_minutes
         FROM lab_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.status = 'active'
         ORDER BY s.time_in ASC"
    );
    $stmt->execute();
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'sessions' => $sessions,
        'total' => count($sessions)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
