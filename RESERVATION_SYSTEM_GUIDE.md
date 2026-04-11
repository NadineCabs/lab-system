# Reservation System Implementation Guide

## Overview
This document describes the complete reservation system implementation for the Sit-In Monitoring System. The system allows students to make reservations for sit-in sessions, which admins can approve or reject. Once approved and used, sessions are automatically recorded in the history.

---

## System Architecture

### Database Flow
```
1. Student Creates Reservation
   ↓
2. Reservation stored in `reservations` table (status: pending)
   ↓
3. Admin Reviews & Approves/Rejects
   ↓
4. If Approved: Reservation status = 'approved'
   ↓
5. Student Starts Session from Approved Reservation
   ↓
6. New `lab_sessions` record created with `reservation_id` link
   ↓
7. Admin Ends Session
   ↓
8. Session marked as 'completed' in `lab_sessions`
   ↓
9. Automatically recorded in `sit_in_records` (History)
   ↓
10. Student sees completed session in History page
```

---

## Database Tables

### 1. reservations Table
Stores all student reservations for sit-in sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| user_id | INT | Foreign key to users |
| computer_number | VARCHAR(10) | Lab/computer identifier |
| purpose | VARCHAR(255) | What student will do |
| requested_date | DATE | Date of requested session |
| requested_time | TIME | Time of requested session |
| duration_hours | INT | Requested duration (1-8) |
| status | ENUM | pending / approved / rejected / cancelled |
| approved_by | INT | Foreign key to admin user |
| approved_at | DATETIME | When approved/rejected |
| rejection_reason | VARCHAR(255) | Why rejected (if applicable) |
| session_id | INT | Links to lab_sessions once started |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### 2. lab_sessions Table (Modified)
**New Columns Added:**
- reservation_id INT - Links back to reservations table

### 3. sit_in_records Table (Modified)
**New Columns Added:**
- feedback_text TEXT - Admin feedback
- rating INT (1-5) - Session rating
- concerns VARCHAR(255) - Any concerns noted

---

## API Endpoints

### Student Endpoints

#### POST `api-create-reservation.php`
Create a new reservation.

**Requirements:**
- Student must be logged in
- Date/time must be in the future
- No duplicate pending/approved reservations for same time

**Request:**
```json
{
  "computer_number": "LAB-01",
  "purpose": "Programming assignment",
  "requested_date": "2026-04-15",
  "requested_time": "14:00",
  "duration_hours": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation submitted successfully",
  "reservation_id": 1
}
```

#### GET `api-get-student-reservations.php`
Fetch student's reservations.

**Query Parameters:**
- status (optional): 'pending', 'approved', 'rejected', 'cancelled'

**Response:**
```json
{
  "success": true,
  "reservations": [...],
  "total": 5
}
```

#### POST `api-cancel-reservation.php`
Cancel pending or approved reservation.

**Request:**
```json
{
  "reservation_id": 1
}
```

#### POST `api-start-session-from-reservation.php`
Start a sit-in session from an approved reservation.

**Request:**
```json
{
  "reservation_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session started successfully",
  "session_id": 123
}
```

---

### Admin Endpoints

#### GET `api-admin-get-all-reservations.php`
Fetch all reservations with student info.

**Response:**
```json
{
  "success": true,
  "reservations": [...],
  "total": 25,
  "pending_count": 5
}
```

#### POST `api-approve-reservation.php`
Approve a pending reservation.

**Request:**
```json
{
  "reservation_id": 1
}
```

#### POST `api-reject-reservation.php`
Reject a pending reservation.

**Request:**
```json
{
  "reservation_id": 1,
  "rejection_reason": "Computer maintenance scheduled"
}
```

---

## Pages

### Student Pages

#### `reservation.html`
Students manage their reservations here.

**Features:**
- Create new reservation form
- View pending & approved reservations
- View all reservations (including rejected/cancelled)
- Start session from approved reservation
- Cancel pending/approved reservations
- Responsive card-based layout

**Tabs:**
- Pending & Approved - Active reservations
- All Reservations - Complete history

#### `history.html` (Updated)
Shows only COMPLETED sit-in sessions from sit_in_records.

**Features:**
- Displays finished sessions only
- Shows admin feedback and ratings
- Statistics: total sessions, total time
- Pagination support
- Updated with feedback display

---

### Admin Pages

#### `admin-reservations.html`
Admin approval interface for reservations.

**Features:**
- List all pending reservations
- Quick approve/reject buttons
- Reject modal with reason input
- Filter by status
- Student information display
- Real-time count of pending approvals

---

## Installation Steps

### 1. Run Database Migration
Execute the migrations file to create/update tables:

```bash
mysql -u root -p < migrations-reservations.sql
```

Or use the init process in your application.

### 2. Update Admin Dashboard
Add link to reservation approvals page in admin-dashboard.html:

```html
<a href="admin-reservations.html" class="nav-link">
  <i data-feather="calendar"></i>
  <span>Approvals</span>
</a>
```

### 3. Test the System

**As Student:**
1. Login to dashboard
2. Click "Reservation" in navbar
3. Click "Make a Reservation"
4. Fill form with:
   - Computer: LAB-01
   - Purpose: Test programming
   - Date: Tomorrow or later
   - Time: 14:00
   - Duration: 2 hours
5. Submit and wait for admin approval

**As Admin:**
1. Login to admin dashboard
2. View pending reservations
3. Approve or reject with reason
4. Once approved, student sees it in reservation page

**Complete Session:**
1. Student clicks "Start Session" on approved reservation
2. Lab session is created and linked to reservation
3. Admin can see active session in existing admin-sitin.html
4. Admin ends the session
5. Session automatically recorded in sit_in_records
6. Student sees it in History page

---

## Data Flow Example

```
Reservation Created:
Time: 2026-04-15 14:00
Status: pending
Student: John Doe

↓ (Admin approves)

Reservation Updated:
Status: approved
Approved By: Admin
Approved At: 2026-04-14 10:00

↓ (Student clicks "Start Session" on 2026-04-15)

Lab Session Created:
reservation_id: 1
user_id: 5 (John Doe)
time_in: 2026-04-15 14:00
status: active

↓ (After 2 hours, Admin ends session)

Lab Session Updated:
time_out: 2026-04-15 16:00
status: completed

Sit-In Record Created:
session_id: 123
user_id: 5
duration_minutes: 120
recorded_at: 2026-04-15 16:00
feedback_text: "Good session" (if admin adds)
rating: 5 (if admin adds)

↓ (Student views History)

History Page Shows:
Date: Apr 15, 2026
Lab: LAB-01
Purpose: Programming assignment
Duration: 120 min
Rating: ⭐⭐⭐⭐⭐
Feedback: "Good session"
```

---

## Key Features

### 1. Duplicate Prevention
- Students cannot have multiple reservations at the same time
- Computer cannot be reserved twice for overlapping times

### 2. Status Tracking
- Pending: Waiting for admin approval
- Approved: Ready to use for session
- Rejected: Admin declined with reason
- Cancelled: Student cancelled their own reservation

### 3. Session Linking
- Reservations are linked to lab_sessions via session_id
- Lab_sessions show which reservation they came from
- Sit_in_records inherit all details from lab_sessions

### 4. History Integrity
- History page only shows COMPLETED sessions (from sit_in_records)
- Pending/approved reservations never appear in history
- Only finished sessions show feedback and ratings

### 5. Admin Controls
- Full visibility of all reservations
- Approve with one click
- Reject with custom reason
- See student details and purpose

---

## Security Measures

1. **Session Authentication:** All endpoints check user role
2. **Ownership Verification:** Users can only see/modify their own reservations
3. **Admin-Only Actions:** Approval/rejection restricted to admin role
4. **SQL Injection Protection:** All queries use prepared statements
5. **Future Dates Only:** Reservations cannot be made for past dates

---

## Troubleshooting

### Migration Failed
- Check if previous migrations were applied
- Verify database user permissions
- Check syntax of reservation table creation

### Reservations Not Showing
- Clear browser cache
- Verify user is properly authenticated
- Check database for reservations with correct user_id

### Sessions Not Recording
- Ensure end-sitin.php is working (used by admin)
- Check that lab_sessions are being created
- Verify sit_in_records table has correct schema

### History Page Empty
- Verify sessions have been completed (status = 'completed')
- Check sit_in_records have been populated
- Ensure user_id in records matches current user

---

## Future Enhancements

1. **Overlapping Reservations:** Allow multiple students on same computer at same time with scheduling
2. **Feedback Form:** Modal for students to rate sessions immediately after completion
3. **Cancellation Policies:** Implement cancellation windows and notice requirements
4. **Email Notifications:** Send approval/rejection emails to students
5. **Bulk Operations:** Allow admins to bulk approve/reject reservations
6. **Calendar View:** Visual calendar showing reservations and availability
7. **Recurring Reservations:** Support for recurring weekly/daily sessions

---

## Support & Maintenance

For issues or questions:
1. Check database tables are properly created (use DESCRIBE/SHOW statements)
2. Review API response JSON for error messages
3. Check browser console for JavaScript errors
4. Verify user roles with SELECT from users table
5. Test migrations with test data before full deployment
