<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

function ensureAnnouncementsTableExists($conn) {
    $conn->exec(
        'CREATE TABLE IF NOT EXISTS announcements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            posted_by_id INT NULL,
            posted_by_name VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

ensureAnnouncementsTableExists($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access.'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$title = isset($data['title']) ? trim($data['title']) : '';
$content = isset($data['content']) ? trim($data['content']) : '';

if (empty($title) || empty($content)) {
    echo json_encode([
        'success' => false,
        'message' => 'Title and content are required.'
    ]);
    exit;
}

$postedById = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
$postedByName = isset($_SESSION['full_name']) ? trim($_SESSION['full_name']) : 'CCS Admin';

try {
    $stmt = $conn->prepare(
        'INSERT INTO announcements (title, content, posted_by_id, posted_by_name) VALUES (:title, :content, :posted_by_id, :posted_by_name)'
    );
    $stmt->execute([
        'title' => $title,
        'content' => $content,
        'posted_by_id' => $postedById,
        'posted_by_name' => $postedByName
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Announcement published successfully.'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save announcement. Please try again.'
    ]);
}
?>
