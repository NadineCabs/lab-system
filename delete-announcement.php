<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

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
$announcementId = isset($data['announcement_id']) ? intval($data['announcement_id']) : 0;

if ($announcementId <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Announcement ID is required.'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare('DELETE FROM announcements WHERE id = :id');
    $stmt->execute(['id' => $announcementId]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Announcement not found or already deleted.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Announcement deleted successfully.'
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Unable to delete announcement. Please try again.'
    ]);
}
?>