# Reservation System - Quick Start Guide

## What Was Implemented

A complete student reservation system for the Sit-In Monitoring platform with the following workflow:

1. ✅ **Students Create Reservations** - reservation.html form
2. ✅ **Admins Approve/Reject** - admin-reservations.html interface
3. ✅ **Students Start Sessions** - Convert approved reservation to active session
4. ✅ **System Records History** - Completed sessions appear in history.html only
5. ✅ **Admin Feedback** - Add feedback and ratings to completed sessions

---

## Quick Setup (5 minutes)

### Step 1: Run Database Migration
```bash
# Copy and paste the SQL from migrations-reservations.sql into your MySQL client
# OR use command line:
mysql sit_in_monitoring < migrations-reservations.sql
```

### Step 2: Verify Files Created
Make sure these files exist in your project:

**PHP APIs:**
- ✅ api-create-reservation.php
- ✅ api-get-student-reservations.php
- ✅ api-cancel-reservation.php
- ✅ api-approve-reservation.php
- ✅ api-reject-reservation.php
- ✅ api-start-session-from-reservation.php
- ✅ api-admin-get-all-reservations.php
- ✅ api-get-student-history.php (UPDATED)

**HTML Pages:**
- ✅ reservation.html (NEW - Student reservation management)
- ✅ admin-reservations.html (NEW - Admin approval interface)
- ✅ history.html (UPDATED - Shows completed sessions only)

**Documentation:**
- ✅ migrations-reservations.sql
- ✅ RESERVATION_SYSTEM_GUIDE.md
- ✅ RESERVATION_QUICK_START.md

### Step 3: Update Admin Dashboard
Add a link to the reservations approval page. Edit `admin-dashboard.html` and add to navigation:

```html
<a href="admin-reservations.html" class="nav-link">
  <i data-feather="calendar"></i>
  <span>Approvals</span>
</a>
```

---

## Testing the System (10 minutes)

### Test as Student (Browser 1):
1. Login to your account
2. Click **"Reservation"** in navbar
3. Click **"Make a Reservation"**
4. Fill the form:
   - Computer: `LAB-01` or `PC-01`
   - Purpose: `Testing the system`
   - Date: Click calendar → select tomorrow or later
   - Time: `14:00` (2:00 PM)
   - Duration: `2` hours
5. Click **Submit Reservation**
6. You should see: "Reservation submitted successfully"
7. Reservation appears as **"Pending"** in your list

### Test as Admin (Browser 2):
1. Login as admin
2. Go to **Admin Dashboard**
3. Click **"Approvals"** (or navigate to admin-reservations.html)
4. You should see the pending reservation
5. Click **Approve** button
6. Back in student browser, refresh - status should be **"Approved"**
7. Click **Start Session** button (on the approved reservation card)
8. You'll see: "Session started! You can now end it from the admin panel."
9. Go back to Admin Dashboard → Initiate Session
10. Find the active session for your student
11. Click **End** to complete the session
12. Session automatically recorded!

### Test as Student (View History):
1. Click **"History"** in navbar
2. You should see your completed session with:
   - ✅ Date
   - ✅ Computer Number
   - ✅ Purpose
   - ✅ Duration
   - ✅ Any admin feedback (if added)
   - ✅ Rating (if added)

---

## Key Features

### For Students:
- **Make Reservations** - Book a computer lab in advance
- **See Status** - Know if admin approved or rejected request
- **Cancel Anytime** - Cancel pending/approved reservations
- **View History** - See only completed sessions with feedback
- **Responsive Design** - Works on mobile, tablet, desktop

### For Admins:
- **Manage Approvals** - One-click approve or reject
- **Add Rejection Reason** - Tell students why rejected
- **See Full Details** - Student name, computer, date, purpose
- **Filter Pending** - Focus on pending approvals only
- **Add Feedback** - Rate sessions and add comments

---

## How the Data Flows

```
STUDENT CREATES RESERVATION
    ↓
[Stored in "reservations" table with status: pending]
    ↓
ADMIN APPROVES IN ADMIN-RESERVATIONS.HTML
    ↓
[Status changes to "approved"]
    ↓
STUDENT CLICKS "START SESSION" 
    ↓
[New lab_sessions record created, linked to reservation]
    ↓
ADMIN ENDS SESSION IN ADMIN-SITIN.HTML
    ↓
[lab_sessions marked "completed"]
    ↓
[A SIT_IN_RECORDS ENTRY IS AUTOMATICALLY CREATED]
    ↓
STUDENT VIEWS HISTORY.HTML
    ↓
[ONLY COMPLETED SESSIONS APPEAR - PENDING NEVER SHOWN]
    ↓
[Shows feedback, ratings, date, lab, purpose, duration]
```

---

## Important Notes

### ⚠️ Pending Reservations Don't Appear in History
- History page (`history.html`) ONLY shows completed sessions from `sit_in_records`
- Pending/approved/rejected reservations are NOT shown in history
- This is by design - history = finished sessions only

### ⚠️ Session Must Be Completed to Appear in History
1. Reservation created (pending)
2. Admin approves (approved)
3. Student starts session (active lab_session)
4. Admin ends session (completed lab_session)
5. NOW appears in history

### ℹ️ Admin Can Still Use Old System
- Previous "Initiate Session" (admin-sitin.html) still works
- Works alongside the new reservation system
- Admin can initiate sessions directly without reservations

### ℹ️ Rejection Reasons Are Stored
- When admin rejects, they can add a reason
- Student sees the rejection reason in the "Rejected" tab
- Helps students understand why their reservation was declined

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Student can't see approved reservations | Clear browser cache, refresh page |
| Session doesn't appear in history | Make sure admin clicked "End" button in admin-sitin.html |
| History is empty | Student might not have any completed sessions yet |
| Can't approve reservations | Make sure you're logged in as admin |
| Dates in past can't be reserved | This is intentional - only future dates allowed |
| Form won't submit | Fill all required fields (marked with *) |

---

## Files Reference

### Database
- `migrations-reservations.sql` - Creates reservations table and adds columns

### Student APIs
- `api-create-reservation.php` - Create new reservation
- `api-get-student-reservations.php` - List student's reservations
- `api-cancel-reservation.php` - Cancel pending/approved reservation
- `api-start-session-from-reservation.php` - Start session from approved reservation

### Admin APIs
- `api-approve-reservation.php` - Approve pending reservation
- `api-reject-reservation.php` - Reject with reason
- `api-admin-get-all-reservations.php` - Get all reservations for approval page

### History API
- `api-get-student-history.php` - Get completed sessions ONLY (updated)

### Pages
- `reservation.html` - Student reservation management page
- `admin-reservations.html` - Admin approval management page
- `history.html` - Student history view (UPDATED to show feedback)

---

## Next Steps

1. ✅ Run the database migration
2. ✅ Add link to admin-reservations.html in admin dashboard
3. ✅ Test with multiple students and admins
4. ✅ Adjust styling to match your theme if needed
5. ✅ Deploy to production

---

## Support

For detailed information about the system architecture, data flow, and advanced features, see:
- **RESERVATION_SYSTEM_GUIDE.md** - Complete technical documentation
- **End-to-End Workflow** - How data flows through the system
- **API Reference** - Detailed API documentation
