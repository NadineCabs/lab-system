<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Check if admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;

try {
    $query = "SELECT 
                sr.id,
                sr.user_id,
                sr.session_id,
                sr.duration_minutes,
                sr.recorded_at,
                u.id_number,
                u.first_name,
                u.last_name,
                u.course,
                ls.computer_number,
                ls.purpose,
                ls.time_in,
                ls.time_out
             FROM sit_in_records sr
             JOIN users u ON u.id = sr.user_id
             LEFT JOIN lab_sessions ls ON ls.id = sr.session_id
             WHERE 1=1";
    
    $params = [];
    
    if ($studentId) {
        $query .= " AND sr.user_id = ?";
        $params[] = $studentId;
    }
    
    if ($startDate) {
        $query .= " AND DATE(sr.recorded_at) >= ?";
        $params[] = $startDate;
    }
    
    if ($endDate) {
        $query .= " AND DATE(sr.recorded_at) <= ?";
        $params[] = $endDate;
    }
    
    $query .= " ORDER BY sr.recorded_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM sit_in_records sr WHERE 1=1";
    $countParams = [];
    
    if ($studentId) {
        $countQuery .= " AND sr.user_id = ?";
        $countParams[] = $studentId;
    }
    
    if ($startDate) {
        $countQuery .= " AND DATE(sr.recorded_at) >= ?";
        $countParams[] = $startDate;
    }
    
    if ($endDate) {
        $countQuery .= " AND DATE(sr.recorded_at) <= ?";
        $countParams[] = $endDate;
    }
    
    $stmt = $conn->prepare($countQuery);
    $stmt->execute($countParams);
    $totalResult = $stmt->fetch();
    $total = $totalResult['total'] ?? 0;

    echo json_encode([
        'success' => true,
        'records' => $records,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
