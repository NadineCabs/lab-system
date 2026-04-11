// ============================================
// SIT-IN MANAGEMENT JAVASCRIPT
// ============================================

let refreshInterval;

document.addEventListener('DOMContentLoaded', () => {
  loadStudentsList();
  loadActiveSessions();

  // Refresh active sessions every 5 seconds
  refreshInterval = setInterval(loadActiveSessions, 5000);

  // Form submission
  const form = document.getElementById('initiateSessionForm');
  if (form) {
    form.addEventListener('submit', handleInitiateSession);
  }

  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadActiveSessions();
      loadStudentsList();
    });
  }
});

async function loadStudentsList() {
  try {
    const response = await fetch('get-students-list.php');
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to load students');
    }

    const select = document.getElementById('studentSelect');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Choose a student --</option>';

    // Filter out students with active sessions
    const availableStudents = data.students.filter(s => !s.has_active_session);

    availableStudents.forEach(student => {
      const option = document.createElement('option');
      option.value = student.id;
      const displayName = `${student.first_name} ${student.last_name} (${student.id_number})`;
      option.textContent = displayName;
      option.dataset.name = displayName;
      select.appendChild(option);
    });

    // Restore previous selection if still available
    if (currentValue && Array.from(select.options).some(o => o.value === currentValue)) {
      select.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

async function handleInitiateSession(event) {
  event.preventDefault();

  const studentId = document.getElementById('studentSelect').value;
  const computerNumber = document.getElementById('computerNumber').value.trim();
  const purpose = document.getElementById('sessionPurpose').value.trim();
  const statusEl = document.getElementById('initiateStatus');

  if (!studentId) {
    if (statusEl) {
      statusEl.textContent = 'Please select a student';
      statusEl.style.color = '#d97706';
    }
    return;
  }

  if (!computerNumber) {
    if (statusEl) {
      statusEl.textContent = 'Please enter computer number';
      statusEl.style.color = '#d97706';
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = 'Starting session...';
    statusEl.style.color = '#1a1a1a';
  }

  try {
    const response = await fetch('initiate-sitin.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        student_id: studentId,
        computer_number: computerNumber,
        purpose: purpose || null
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to initiate session');
    }

    if (statusEl) {
      statusEl.textContent = '✓ ' + data.message + ' - ' + data.student_name;
      statusEl.style.color = '#16a34a';
    }

    // Clear form
    document.getElementById('initiateSessionForm').reset();

    // Reload data
    setTimeout(() => {
      loadActiveSessions();
      loadStudentsList();
      if (statusEl) {
        statusEl.textContent = '';
      }
    }, 1500);
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = '✕ ' + (error.message || 'Failed to initiate session');
      statusEl.style.color = '#dc2626';
    }
    console.error('Session initiation error:', error);
  }
}

async function loadActiveSessions() {
  try {
    const response = await fetch('get-active-sitions.php');
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to load sessions');
    }

    renderActiveSessions(data.sessions || []);
  } catch (error) {
    console.error('Error loading active sessions:', error);
    const container = document.getElementById('activeSessionsList');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-feather="alert-circle"></i>
          <p>Error loading sessions. Please refresh.</p>
        </div>
      `;
    }
  }
}

function renderActiveSessions(sessions) {
  const container = document.getElementById('activeSessionsList');
  const countEl = document.getElementById('activeSessions');

  if (!container) return;

  // Update count
  if (countEl) {
    countEl.textContent = sessions.length;
  }

  // Clear container
  container.innerHTML = '';

  if (!sessions.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-feather="inbox"></i>
        <p>No active sessions at the moment</p>
      </div>
    `;
    feather.replace();
    return;
  }

  const table = document.createElement('div');
  table.className = 'table-responsive';

  const html = `
    <table class="students-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>ID Number</th>
          <th>Computer</th>
          <th>Purpose</th>
          <th>Duration</th>
          <th>Started At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${sessions.map(session => `
          <tr>
            <td><strong>${escapeHtml(session.first_name)} ${escapeHtml(session.last_name)}</strong></td>
            <td>${escapeHtml(session.id_number)}</td>
            <td><span class="badge" style="background: #e3f2fd; color: #1976d2;">${escapeHtml(session.computer_number)}</span></td>
            <td>${session.purpose ? escapeHtml(session.purpose) : '<em style="color: #999;">-</em>'}</td>
            <td><span id="duration-${session.id}" class="duration-badge">${formatDuration(session.duration_minutes)}</span></td>
            <td style="font-size: 13px; color: #666;">${formatDateTimeLocal(session.time_in)}</td>
            <td>
              <button type="button" class="btn-delete-small" onclick="handleEndSession(${session.id})">
                <i data-feather="stop-circle"></i> End
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  table.innerHTML = html;
  container.appendChild(table);
  feather.replace();

  // Start duration update interval
  updateSessionDurations(sessions);
}

function updateSessionDurations(sessions) {
  const updateDurations = () => {
    sessions.forEach(session => {
      const durationEl = document.getElementById(`duration-${session.id}`);
      if (durationEl) {
        const startTime = new Date(session.time_in);
        const now = new Date();
        const diff = now - startTime;
        const minutes = Math.floor(diff / 60000);
        durationEl.textContent = formatDuration(minutes);
      }
    });
  };

  updateDurations();
  const interval = setInterval(updateDurations, 60000); // Update every minute
  
  // Clear interval when sessions change
  setTimeout(() => clearInterval(interval), 5000);
}

async function handleEndSession(sessionId) {
  const confirmed = confirm('Are you sure you want to end this session? The student will lose one available session.');
  if (!confirmed) return;

  try {
    const response = await fetch('end-sitin.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: sessionId })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to end session');
    }

    alert('Session ended successfully. Duration: ' + data.duration_minutes + ' minutes');
    loadActiveSessions();
    loadStudentsList();
  } catch (error) {
    alert('Error: ' + (error.message || 'Failed to end session'));
    console.error('Error ending session:', error);
  }
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return minutes + ' min';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours + 'h ' + mins + 'm';
}

function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
