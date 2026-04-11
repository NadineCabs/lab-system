<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

// Check if admin is logged in
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

// Get search query
$searchQuery = isset($_GET['query']) ? trim($_GET['query']) : '';

if (empty($searchQuery)) {
    echo json_encode(['success' => false, 'message' => 'Search query is required']);
    exit;
}

try {
    // Search by exact ID number OR partial name match
    $sql = "SELECT 
                id,
                id_number,
                first_name,
                middle_name,
                last_name,
                email,
                course,
                course_level,
                address,
                profile_picture,
                created_at,
                (SELECT COUNT(*) FROM lab_sessions WHERE user_id = users.id AND status = 'completed') as total_sessions,
                (SELECT COUNT(*) FROM lab_sessions WHERE user_id = users.id AND status = 'active') as active_sessions
            FROM users 
            WHERE role = 'student' 
            AND (
                id_number = ? 
                OR CONCAT(first_name, ' ', middle_name, ' ', last_name) LIKE ?
                OR CONCAT(first_name, ' ', last_name) LIKE ?
                OR first_name LIKE ?
                OR last_name LIKE ?
            )
            ORDER BY last_name, first_name
            LIMIT 50";
    
    $stmt = $conn->prepare($sql);
    
    // Prepare search patterns
    $exactId = $searchQuery;
    $likePattern = '%' . $searchQuery . '%';
    
    $stmt->bind_param("sssss", $exactId, $likePattern, $likePattern, $likePattern, $likePattern);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate remaining sessions (example: 50 total allowed)
        $totalAllowed = 50;
        $used = $row['total_sessions'];
        $remaining = max(0, $totalAllowed - $used);
        
        $students[] = [
            'id' => $row['id'],
            'id_number' => $row['id_number'],
            'first_name' => $row['first_name'],
            'middle_name' => $row['middle_name'],
            'last_name' => $row['last_name'],
            'full_name' => trim($row['first_name'] . ' ' . $row['middle_name'] . ' ' . $row['last_name']),
            'email' => $row['email'],
            'course' => $row['course'],
            'course_level' => $row['course_level'],
            'year' => $row['course_level'],
            'address' => $row['address'],
            'profile_picture' => $row['profile_picture'],
            'total_sessions' => (int)$row['total_sessions'],
            'active_sessions' => (int)$row['active_sessions'],
            'remaining_sessions' => $remaining,
            'created_at' => $row['created_at']
        ];
    }
    
    if (empty($students)) {
        echo json_encode([
            'success' => false, 
            'message' => 'No students found matching "' . htmlspecialchars($searchQuery) . '"',
            'students' => []
        ]);
    } else {
        echo json_encode([
            'success' => true, 
            'message' => 'Found ' . count($students) . ' student(s)',
            'students' => $students,
            'count' => count($students)
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>