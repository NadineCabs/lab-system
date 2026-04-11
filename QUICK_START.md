# Sit-In Session Management - Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### Step 1: Initialize Database
Visit in your browser:
```
http://localhost:8000/setup-sitin.html
```
Click **"Initialize Database"** → **"Verify Setup"** → Done!

Alternatively, from terminal:
```bash
php init-database.php
```

### Step 2: Access Admin Sit-In Page
1. Log in to Admin Panel
2. Click **"Sit-In"** in sidebar
3. You're ready to go!

---

## 📋 How to Use

### Creating a New Session

1. **Select Student**
   - Click dropdown under "Select Student"
   - Choose from available students

2. **Enter Computer Number** 
   - Examples: LAB-01, PC-15, COMP-3
   - Required field

3. **Add Purpose** (Optional)
   - Examples: Programming, Database Project, Web Development

4. **Click "Start Session"**
   - Green checkmark = success
   - Student session started!

### Viewing Active Sessions

The table below shows:
- Student name & ID
- Computer assigned
- How long they've been in session
- Session purpose
- End button (red) to finish session

**Auto-updates every 5 seconds** ✨

### Ending a Session

1. Find student in active sessions
2. Click **"End"** button (red)
3. Confirm dialog appears
4. Click **"OK"** to confirm
   - Session closed ✓
   - Session recorded ✓
   - One session deducted from student ✓

### Viewing All Records

1. Click **"Sit-In Records"** in sidebar
2. See all completed sessions with:
   - Date & time ended
   - Student details
   - Duration in minutes
   - Computer used
   - Purpose

#### Filter Records By:
- **Student Name** - type name or ID
- **Date Range** - pick start and end date
- **Apply Filters** - see filtered results

#### Pagination:
- Shows 25 records per page
- **Previous/Next** buttons to navigate
- Shows "Showing X to Y of Z total"

#### Export Data:
- Click **"Export Data"** button
- Downloads as CSV file
- Open in Excel/spreadsheet app

---

## 🔑 Key Information

### Available Sessions
- Each student starts with **10 available sessions**
- Each time a session ends: **-1 from available count**
- Visible in student dropdown: `Available Sessions`

### What Gets Recorded
When a session ends, automatically recorded:
- ✓ Student name & ID
- ✓ Computer number
- ✓ Duration (minutes)
- ✓ Date & time
- ✓ Session purpose
- ✓ Timestamp

### Real-Time Features
- Active sessions update every **5 seconds**
- Duration updates every **1 minute**
- Auto-refreshes on session changes

---

## ⚠️ Important Notes

### Session Rules
- A student **cannot have 2 active sessions** at same time
- You must **end one session before starting another**
- Sessions are automatically timestamped

### Data Safety
- All data is **permanently recorded** in database
- You **cannot delete completed records** (by design)
- Changes are **immediate** - no delays

### Deductions
- **One session deducted** when you click "End"
- Cannot go below **zero**
- Instant effect - visible in student dropdown

---

## 🆘 Troubleshooting

### "Student already has an active session"
→ The student has another session running
→ End that session first

### Student doesn't appear in dropdown
→ They already have an active session
→ Or they are not a student account

### Numbers not updating?
→ Click **"Refresh"** button
→ Or wait 5 seconds for auto-update

### Can't see new records?
→ Click **"Apply Filters"** again
→ Or refresh the page

### Database error?
→ Go back to setup-sitin.html
→ Click "Initialize Database" again

---

## 📊 Typical Usage Scenario

**8:00 AM** - Lab opens
- Admin sits at desk with computer
- Students start arriving wanting to do lab work

**8:15 AM** - First student (Maria)
- Click sidebar → Sit-In
- Select "Maria Garcia" from dropdown
- Type "LAB-02" 
- Type "Programming Assignment" as purpose
- Click "Start Session"
- ✓ Maria's session running!

**8:20 AM** - Second student (John)
- Repeat process for "John Doe"
- Type "LAB-05"
- Click "Start Session"

**8:35 AM** - Maria finishes
- Find Maria in active sessions table
- Click **End** button
- Confirm dialog
- ✓ Session ended, recorded, deducted
- Active sessions now shows only John

**8:45 AM** - Check records
- Click "Sit-In Records" sidebar
- See both Maria and John's completed sessions
- Shows duration, computer, purpose, timestamp

---

## 📱 Tips & Tricks

### Searching Records
- Type first/last name or ID number
- Click "Apply Filters"
- Narrows down results

### Date Reports
- Set Start Date: Beginning of week
- Set End Date: End of week
- See all sessions for that week
- Export to share with management

### Monitor Real-Time
- Keep Sit-In page open
- See duration grow in real-time
- Session counter shows "3 sessions running"
- Know exactly who's using lab

### Quick Session
- Common computer numbers: LAB-01, LAB-02, etc.
- Save as clipboard for quick entry
- Purpose is optional - can leave blank

---

## ✅ What's Automatically Done

🤖 **You don't need to do:**
- Calculate duration → **Auto-calculated**
- Record timestamp → **Auto-recorded**  
- Deduct sessions → **Auto-deducted**
- Update available count → **Auto-updated**

✋ **You just:** 
1. Select student
2. Enter computer number
3. Click Start/End
4. Done!

---

## 📞 Get Help

**For detailed information:**
- Read `SIT_IN_SETUP_GUIDE.md`
- Check `IMPLEMENTATION_SUMMARY.md`
- Review database queries section

**For technical issues:**
- Check browser console (F12 key)
- Verify database connection
- Re-run setup initialization

---

**System is ready! Start managing sit-in sessions now.** 🎉
