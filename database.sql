-- Computer Sit-In Monitoring System Database

-- Create database
CREATE DATABASE IF NOT EXISTS sit_in_monitoring;

-- Use the database
USE sit_in_monitoring;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_number VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  course VARCHAR(100) NOT NULL,
  course_level INT NOT NULL,
  address TEXT,
  profile_picture TEXT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions table (for time-in/time-out tracking - Phase 2)
CREATE TABLE IF NOT EXISTS lab_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  time_in DATETIME NOT NULL,
  time_out DATETIME NULL,
  computer_number VARCHAR(10),
  purpose VARCHAR(200),
  status ENUM('active', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  posted_by_id INT NULL,
  posted_by_name VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_id_number ON users(id_number);
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_user_id ON lab_sessions(user_id);
CREATE INDEX idx_status ON lab_sessions(status);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);

INSERT INTO users (id_number, first_name, middle_name, last_name, email, course, course_level, address, password, role) 
VALUES (
  'admin', 
  'System', 
  'Admin',
  'Administrator', 
  'admin@ccs.edu', 
  'Computer Studies', 
  4, 
  'CCS Office, UC Main Campus', 
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'admin'
);

