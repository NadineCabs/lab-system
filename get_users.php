<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Only allow logged-in admin to query users.
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$searchQuery = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    $sql = "SELECT 
                u.id,
                u.id_number,
                u.first_name,
                u.middle_name,
                u.last_name,
                u.email,
                u.course,
                u.course_level,
                u.address,
                u.profile_picture,
                u.created_at,
                COALESCE((SELECT COUNT(*) FROM lab_sessions WHERE user_id = u.id AND status = 'completed'), 0) AS total_sessions,
                COALESCE((SELECT COUNT(*) FROM lab_sessions WHERE user_id = u.id AND status = 'active'), 0) AS active_sessions
            FROM users u
            WHERE u.role = 'student'";

    $params = [];
    if ($searchQuery !== '') {
        $sql .= " AND (
                    u.id_number = :search_exact OR
                    CONCAT(u.first_name, ' ', u.middle_name, ' ', u.last_name) LIKE :search_like OR
                    CONCAT(u.first_name, ' ', u.last_name) LIKE :search_like OR
                    u.first_name LIKE :search_like OR
                    u.last_name LIKE :search_like OR
                    u.email LIKE :search_like
                )";
        $params = [
            ':search_exact' => $searchQuery,
            ':search_like' => '%' . $searchQuery . '%'
        ];
    }

    $sql .= " ORDER BY u.last_name, u.first_name LIMIT 50";

    $stmt = $conn->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($users as &$user) {
        $user['full_name'] = trim($user['first_name'] . ' ' . $user['middle_name'] . ' ' . $user['last_name']);
        $user['total_sessions'] = (int)$user['total_sessions'];
        $user['active_sessions'] = (int)$user['active_sessions'];
        $user['remaining_sessions'] = max(0, 50 - $user['total_sessions']);
    }

    echo json_encode([
        'success' => true,
        'message' => count($users) . ' student(s) found.',
        'users' => $users,
        'count' => count($users)
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch users']);
}
?>