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
    // Get all students excluding those with active sessions
    $stmt = $conn->prepare(
        "SELECT 
            u.id,
            u.id_number,
            u.first_name,
            u.last_name,
            u.course,
            u.available_sessions,
            COALESCE(COUNT(s.id), 0) AS total_sessions,
            (SELECT COUNT(*) FROM lab_sessions WHERE user_id = u.id AND status = 'active') AS has_active_session
         FROM users u
         LEFT JOIN lab_sessions s ON u.id = s.user_id AND s.status = 'completed'
         WHERE u.role = 'student'
         GROUP BY u.id
         ORDER BY u.first_name ASC"
    );
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $students,
        'total' => count($students)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
