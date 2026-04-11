<?php
session_start();
header('Content-Type: application/json');
require_once 'config.php';

// Check if admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = isset($data['session_id']) ? (int)$data['session_id'] : null;

if (!$sessionId) {
    echo json_encode(['success' => false, 'message' => 'Session ID is required']);
    exit;
}

try {
    // Get session details
    $stmt = $conn->prepare("SELECT user_id, time_in FROM lab_sessions WHERE id = ? AND status = 'active'");
    $stmt->execute([$sessionId]);
    $session = $stmt->fetch();

    if (!$session) {
        echo json_encode(['success' => false, 'message' => 'Active session not found']);
        exit;
    }

    // Begin transaction
    $conn->beginTransaction();

    // Update session to completed
    $stmt = $conn->prepare(
        "UPDATE lab_sessions 
         SET status = 'completed', time_out = NOW() 
         WHERE id = ?"
    );
    $stmt->execute([$sessionId]);

    // Calculate session duration in minutes
    $timeIn = new DateTime($session['time_in']);
    $timeOut = new DateTime();
    $duration = $timeIn->diff($timeOut);
    $durationMinutes = ($duration->h * 60) + $duration->i;

    // Record in sit_in_records table
    $stmt = $conn->prepare(
        "INSERT INTO sit_in_records (user_id, session_id, duration_minutes, recorded_at) 
         VALUES (?, ?, ?, NOW())"
    );
    $stmt->execute([$session['user_id'], $sessionId, $durationMinutes]);

    // Deduct one session from student's available count (if they have available sessions)
    $stmt = $conn->prepare(
        "UPDATE users 
         SET available_sessions = GREATEST(available_sessions - 1, 0) 
         WHERE id = ?"
    );
    $stmt->execute([$session['user_id']]);

    // Commit transaction
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Session ended and recorded successfully',
        'duration_minutes' => $durationMinutes
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
