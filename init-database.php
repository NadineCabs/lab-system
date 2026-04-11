<?php
/**
 * Database Initialization Script
 * This file initializes the required database tables for the sit-in session management system
 * Can be run via CLI (php init-database.php) or browser access
 */

require_once 'config.php';

// Check if accessed via web
$isWeb = isset($_SERVER['HTTP_HOST']);
$output = [];

try {
    // Add available_sessions column to users table if it doesn't exist
    try {
        $conn->exec("ALTER TABLE users ADD COLUMN available_sessions INT DEFAULT 10 COMMENT 'Number of available sit-in sessions for the student'");
        $output[] = "✓ Added available_sessions column to users table";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'Duplicate') !== false) {
            $output[] = "! available_sessions column already exists";
        } else {
            throw $e;
        }
    }

    // Create sit_in_records table if it doesn't exist
    try {
        $conn->exec("
            CREATE TABLE IF NOT EXISTS sit_in_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                session_id INT NOT NULL,
                duration_minutes INT DEFAULT 0,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (session_id) REFERENCES lab_sessions(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_session_id (session_id),
                INDEX idx_recorded_at (recorded_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ");
        $output[] = "✓ Created sit_in_records table";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            $output[] = "! sit_in_records table already exists";
        } else {
            throw $e;
        }
    }

    $output[] = "✓ Database initialization completed successfully!";
    $success = true;
    $message = "Database setup completed. All required tables and columns are in place.";

} catch (PDOException $e) {
    $success = false;
    $message = "Database initialization failed: " . $e->getMessage();
    $output[] = "✕ Error: " . $e->getMessage();
}

// Output format based on access type
if ($isWeb) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'details' => $output
    ]);
} else {
    echo "=== Sit-In System Database Initialization ===\n\n";
    foreach ($output as $line) {
        echo $line . "\n";
    }
    echo "\n";
    if ($success) {
        echo "The sit-in session management system is ready to use.\n";
    }
    exit($success ? 0 : 1);
}

