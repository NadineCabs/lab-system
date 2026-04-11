<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';

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

try {
    ensureAnnouncementsTableExists($conn);

    $stmt = $conn->prepare(
        'SELECT id, title, content, posted_by_name, created_at FROM announcements ORDER BY created_at DESC LIMIT 10'
    );
    $stmt->execute();
    $announcements = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'announcements' => $announcements
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load announcements'
    ]);
}
?>