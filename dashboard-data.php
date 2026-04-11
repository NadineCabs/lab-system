<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Allow only logged-in admin users to access dashboard data
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT COUNT(*) AS total_students FROM users WHERE role = 'student'");
    $stmt->execute();
    $totalStudents = (int)$stmt->fetchColumn();

    $stmt = $conn->prepare("SELECT COUNT(*) AS current_sitin FROM lab_sessions WHERE status = 'active'");
    $stmt->execute();
    $currentSitIn = (int)$stmt->fetchColumn();

    $stmt = $conn->prepare("SELECT COUNT(*) AS total_today FROM lab_sessions WHERE DATE(time_in) = CURDATE()");
    $stmt->execute();
    $totalToday = (int)$stmt->fetchColumn();

    $stmt = $conn->prepare("SELECT COUNT(*) AS total_sessions FROM lab_sessions");
    $stmt->execute();
    $totalSessions = (int)$stmt->fetchColumn();

    $avgSessionsPerStudent = $totalStudents > 0 ? round($totalSessions / $totalStudents, 2) : 0;

    $stmt = $conn->prepare("SELECT course, COUNT(*) AS count FROM users WHERE role = 'student' GROUP BY course ORDER BY count DESC");
    $stmt->execute();
    $courseDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare(
        "SELECT
            u.id_number,
            u.first_name,
            u.middle_name,
            u.last_name,
            s.purpose,
            s.computer_number,
            s.time_in,
            s.status
          FROM lab_sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.status = 'active'
          ORDER BY s.time_in DESC
          LIMIT 25"
    );
    $stmt->execute();
    $currentSitInStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_students' => $totalStudents,
        'current_sitin' => $currentSitIn,
        'total_sitin_today' => $totalToday,
        'avg_sessions_per_student' => $avgSessionsPerStudent,
        'course_distribution' => $courseDistribution,
        'current_sitin_students' => $currentSitInStudents,
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Unable to load dashboard data']);
}
