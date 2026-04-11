# Sit-In Session Management System - Setup Guide

## Overview
The Sit-In Session Management System allows administrators to:
- **Initiate sit-in sessions** for students with computer assignments
- **View all active sessions** in real-time with duration tracking
- **End sessions** and automatically deduct from student's available session count
- **Record all completed sessions** in a permanent database
- **View sit-in records** with filters and export capabilities

## Components

### Database Tables

#### 1. **sit_in_records** (New)
- Permanently stores all completed sit-in sessions
- Links to users and lab_sessions tables
- Tracks: user_id, session_id, duration_minutes, recorded_at

#### 2. **users** (Modified)
- Added `available_sessions` column (default: 10)
- Tracks how many sessions each student has remaining

#### 3. **lab_sessions** (Existing)
- Records: time_in, time_out, computer_number, purpose, status
- Status can be: 'active' or 'completed'

## Installation Steps

### Step 1: Run Database Initialization
```bash
php init-database.php
```

This script will:
- Add the `available_sessions` column to the users table
- Create the `sit_in_records` table with proper indexes
- Handle cases where tables/columns already exist

### Step 2: Verify Installation
Access the admin panel and ensure:
- Admin > Sit-In page loads correctly
- Admin > Sit-In Records page loads correctly

## API Endpoints

### 1. **Initiate Session**
- **URL:** `POST /initiate-sitin.php`
- **Parameters:**
  - `student_id` (int): Student user ID
  - `computer_number` (string): Computer lab identifier
  - `purpose` (string, optional): Reason for sit-in
- **Response:** Session ID, Student name, Success status
- **Workflow:**
  1. Validates student exists and has no active session
  2. Creates new lab_session with status='active'
  3. Records time_in timestamp

### 2. **End Session**
- **URL:** `POST /end-sitin.php`
- **Parameters:**
  - `session_id` (int): Active session ID
- **Response:** Duration in minutes, Success status
- **Workflow:**
  1. Updates lab_session: set status='completed', time_out=NOW()
  2. Calculates session duration
  3. Inserts record in sit_in_records table
  4. Deducts one from user's available_sessions count (minimum 0)

### 3. **Get Active Sessions**
- **URL:** `GET /get-active-sitions.php`
- **Response:** Array of active sessions with student details
- **Auto-refresh:** Every 5 seconds in admin interface

### 4. **Get Students List**
- **URL:** `GET /get-students-list.php`
- **Response:** All students with their session stats
- **Filters out:** Students with active sessions

### 5. **Get Sit-In Records**
- **URL:** `GET /get-sitin-records.php`
- **Parameters:**
  - `limit` (int): Records per page (default: 100)
  - `offset` (int): Pagination offset
  - `student_id` (int, optional): Filter by student
  - `start_date` (date, optional): Filter from date
  - `end_date` (date, optional): Filter to date
- **Response:** Array of completed records with pagination info

## User Interface

### Admin > Sit-In (`admin-sitin.html`)

#### Create New Session Section
- **Student Selector:** Dropdown of available students
- **Computer Number:** Text input for lab computer ID
- **Purpose:** Optional text field
- **Submit button:** Initiates the session
- **Status messages:** Real-time feedback

#### Active Sessions Table
- **Real-time updates:** Every 5 seconds
- **Columns:**
  - Student Name & ID Number
  - Computer Number
  - Purpose
  - Duration (updates every minute)
  - Started At
  - End Session Button (red, with confirmation)
- **Empty state:** Shows when no active sessions

### Admin > Sit-In Records (`admin-records.html`)

#### Filter Section
- **Student Filter:** Search by name or ID
- **Date Range:** Start and end date pickers
- **Apply Filters Button:** Executes filtered query

#### Records Table
- **Columns:**
  - Date & Time (recorded_at)
  - Student ID Number
  - Student Name
  - Course
  - Computer Number
  - Duration (in minutes)
  - Purpose
- **Pagination:** 25 records per page
- **Total count:** Displayed in header
- **Export button:** Download as CSV

## Data Flow

### Session Creation
```
Admin selects Student
     ↓
Admin enters Computer Number
     ↓
Admin clicks "Start Session"
     ↓
initiate-sitin.php validates & creates lab_session
     ↓
Status message displayed
     ↓
Active sessions list refreshes
```

### Session Completion
```
Admin clicks "End Session"
     ↓
Confirmation dialog appears
     ↓
end-sitin.php:
  - Updates lab_session → status='completed', time_out=NOW()
  - Calculates duration
  - Inserts record in sit_in_records
  - Deducts from user.available_sessions
     ↓
Active sessions list refreshes
```

## Security Features

- **Session validation:** Only logged-in admins can access
- **Student verification:** Validates student exists before creating session
- **Duplicate prevention:** Prevents student from having multiple active sessions
- **Database transactions:** Atomic operations for session end
- **Input sanitization:** All user inputs are properly escaped
- **CSRF protection:** Uses standard session security

## Real-time Updates

- **Active Sessions:** Auto-refresh every 5 seconds
- **Duration Display:** Updates every 1 minute
- **Automatic reload:** On session creation/deletion

## Database Queries

### Most Active Students
```sql
SELECT u.id_number, u.first_name, u.last_name, 
       COUNT(*) as total_sessions, 
       SUM(duration_minutes) as total_duration
FROM sit_in_records sr
JOIN users u ON u.id = sr.user_id
GROUP BY sr.user_id
ORDER BY total_sessions DESC
```

### Sessions by Date Range
```sql
SELECT * FROM sit_in_records
WHERE DATE(recorded_at) BETWEEN ? AND ?
ORDER BY recorded_at DESC
```

### Average Session Duration
```sql
SELECT u.first_name, u.last_name,
       AVG(duration_minutes) as avg_duration,
       COUNT(*) as total_sessions
FROM sit_in_records sr
JOIN users u ON u.id = sr.user_id
GROUP BY sr.user_id
```

## Troubleshooting

### Issue: "Student already has an active session"
- **Cause:** Student tried to start a second session
- **Solution:** Admin must end the first session before starting another

### Issue: Database errors during initialization
- **Cause:** Missing permissions or database connection issues
- **Solution:** 
  1. Check database credentials in config.php
  2. Verify MySQL user has ALTER and CREATE permissions
  3. Run `init-database.php` again

### Issue: Available sessions not deducting
- **Cause:** Database transaction failed
- **Solution:**
  1. Check database logs
  2. Verify sit_in_records table exists
  3. Re-run `init-database.php`

### Issue: Pagination not working
- **Cause:** JavaScript error or incorrect endpoint
- **Solution:**
  1. Check browser console for errors
  2. Verify get-sitin-records.php is accessible
  3. Check limit and offset parameters

## Performance Considerations

- **Indexes:** Added on user_id, session_id, and recorded_at for fast queries
- **Pagination:** 25 records per page prevents slow loads
- **Caching:** Active sessions refresh every 5 seconds (not continuously)
- **Database:** Uses InnoDB for transaction support

## Future Enhancements

- Student dashboard to see own sessions
- Automatic session timeout after X hours
- Session reports and analytics
- SMS/Email notifications
- Sit-in approval workflow
- Lab capacity management

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages in browser console
3. Check PHP error logs
4. Verify database tables using phpMyAdmin
