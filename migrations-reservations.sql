-- ============================================
-- RESERVATIONS SYSTEM - DATABASE MIGRATION
-- ============================================

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    computer_number VARCHAR(10) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    duration_hours INT DEFAULT 1,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT 'pending=waiting for approval, approved=ready to use, rejected=denied, cancelled=student cancelled',
    approved_by INT NULL,
    approved_at DATETIME NULL,
    rejection_reason VARCHAR(255) NULL,
    session_id INT NULL COMMENT 'Links to lab_sessions once approved and student starts',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_id) REFERENCES lab_sessions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date),
    INDEX idx_session_id (session_id),
    UNIQUE KEY unique_pending_reservation (user_id, requested_date, requested_time, status) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Student reservations for sit-in sessions';

-- Add reservation_id to lab_sessions to link them
ALTER TABLE lab_sessions ADD COLUMN reservation_id INT NULL AFTER id;
ALTER TABLE lab_sessions ADD FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL;
ALTER TABLE lab_sessions ADD INDEX idx_reservation_id (reservation_id);

-- Add feedback columns to sit_in_records for admin feedback on completed sessions
ALTER TABLE sit_in_records ADD COLUMN feedback_text TEXT NULL;
ALTER TABLE sit_in_records ADD COLUMN rating INT NULL CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE sit_in_records ADD COLUMN concerns VARCHAR(255) NULL;

-- Add indexes for feedback tracking
ALTER TABLE sit_in_records ADD INDEX idx_rating (rating);
ALTER TABLE sit_in_records ADD INDEX idx_user_recorded_date (user_id, recorded_at);
