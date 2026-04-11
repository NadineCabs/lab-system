-- Add available_sessions field to users table if it doesn't exist
ALTER TABLE users ADD COLUMN available_sessions INT DEFAULT 10 COMMENT 'Number of available sit-in sessions for the student';

-- Create sit_in_records table if it doesn't exist
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
);
