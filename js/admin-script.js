// ============================================
// ADMIN PANEL JAVASCRIPT
// ============================================

// Sidebar Toggle for Mobile
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
  });
}

if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.remove('show');
  });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove('show');
    }
  }
});

// User Dropdown Toggle
const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');

if (userMenuBtn) {
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  if (userDropdown) {
    userDropdown.classList.remove('show');
  }
});

// Global Search Functionality
const globalSearch = document.getElementById('globalSearch');
const studentSearchInput = document.getElementById('studentSearch');
const searchResultsSection = document.getElementById('searchResults');
const searchLoading = document.getElementById('searchLoading');
const searchEmpty = document.getElementById('searchEmpty');
const emptyMessage = document.getElementById('emptyMessage');
const resultsTable = document.getElementById('resultsTable');
const resultsTableBody = document.getElementById('resultsTableBody');
const resultsCount = document.getElementById('resultsCount');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setStudentSearchState({ showSection = true, loading = false, empty = false, results = false }) {
  if (!searchResultsSection) return;
  searchResultsSection.style.display = showSection ? 'block' : 'none';
  if (searchLoading) searchLoading.style.display = loading ? 'block' : 'none';
  if (searchEmpty) searchEmpty.style.display = empty ? 'block' : 'none';
  if (resultsTable) resultsTable.style.display = results ? 'block' : 'none';
}

function clearSearch() {
  if (studentSearchInput) {
    studentSearchInput.value = '';
  }
  if (emptyMessage) {
    emptyMessage.textContent = 'Try a different search query';
  }
  setStudentSearchState({ showSection: false, loading: false, empty: false, results: false });
}

function renderStudentSearchResults(users) {
  if (!resultsTableBody || !resultsCount) return;

  if (!users || users.length === 0) {
    setStudentSearchState({ showSection: true, loading: false, empty: true, results: false });
    return;
  }

  const rows = users.map((user) => {
    const fullName = [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(' ');

    return `
      <tr>
        <td>${escapeHtml(user.id_number)}</td>
        <td>${escapeHtml(fullName)}</td>
        <td>${escapeHtml(user.course)} / Year ${escapeHtml(user.course_level)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.completed_sessions || 0)}</td>
        <td>${escapeHtml(user.remaining_sessions)}</td>
        <td><button class="btn-secondary btn-sm">View</button></td>
      </tr>
    `;
  }).join('');

  resultsTableBody.innerHTML = rows;
  resultsCount.textContent = `${users.length} student${users.length === 1 ? '' : 's'} found`;
  setStudentSearchState({ showSection: true, loading: false, empty: false, results: true });
}

async function performStudentSearch(query) {
  const searchTerm = String(query || '').trim();
  if (!searchResultsSection) return;

  if (searchTerm === '') {
    clearSearch();
    return;
  }

  setStudentSearchState({ showSection: true, loading: true, empty: false, results: false });

  try {
    const response = await fetch(`get_users.php?search=${encodeURIComponent(searchTerm)}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to fetch student records');
    }

    renderStudentSearchResults(data.users);
  } catch (error) {
    if (emptyMessage) {
      emptyMessage.textContent = error.message;
    }
    setStudentSearchState({ showSection: true, loading: false, empty: true, results: false });
  } finally {
    if (window.feather) {
      feather.replace();
    }
  }
}

function searchStudents() {
  if (studentSearchInput) {
    performStudentSearch(studentSearchInput.value);
  }
}

if (globalSearch) {
  let searchTimer = null;

  globalSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm === '') {
      clearSearch();
      return;
    }

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => performStudentSearch(searchTerm), 300);
  });

  globalSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performStudentSearch(globalSearch.value);
    }
  });
}

if (studentSearchInput) {
  studentSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performStudentSearch(studentSearchInput.value);
    }
  });
}

// ============================================
// CHARTS
// ============================================

const courseChartCanvas = document.getElementById('courseChart');
let courseChart = null;

function initCourseChart() {
  if (!courseChartCanvas) return;

  const ctx = courseChartCanvas.getContext('2d');
  courseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['No data'],
      datasets: [{
        data: [1],
        backgroundColor: ['#4da6ff'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          borderRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
              return `${label}: ${value} student${value === 1 ? '' : 's'} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%',
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000,
        easing: 'easeOutQuart'
      }
    }
  });
}

function updateCourseChart(distribution) {
  if (!courseChart || !Array.isArray(distribution)) return;

  const labels = distribution.map(item => item.course || 'Unknown');
  const data = distribution.map(item => Number(item.count) || 0);
  const colors = ['#4da6ff', '#f48fb1', '#ff9800', '#B88A14', '#4caf50', '#7e57c2', '#26a69a'];

  courseChart.data.labels = labels.length ? labels : ['No data'];
  courseChart.data.datasets[0].data = data.length ? data : [1];
  courseChart.data.datasets[0].backgroundColor = labels.map((_, index) => colors[index % colors.length]);
  courseChart.update();
}

function renderCourseChartLegend(distribution) {
  const legendContainer = document.getElementById('courseChartLegend');
  if (!legendContainer) return;

  if (!Array.isArray(distribution) || distribution.length === 0) {
    legendContainer.innerHTML = '<div class="legend-item"><span class="legend-color" style="background: #4da6ff;"></span><span>No data available</span></div>';
    return;
  }

  const colors = ['#4da6ff', '#f48fb1', '#ff9800', '#B88A14', '#4caf50', '#7e57c2', '#26a69a'];
  legendContainer.innerHTML = distribution.map((item, index) => {
    const courseName = item.course || 'Unknown';
    const count = Number(item.count) || 0;
    return `
      <div class="legend-item">
        <span class="legend-color" style="background: ${colors[index % colors.length]};"></span>
        <span>${escapeHtml(courseName)} (${count})</span>
      </div>
    `;
  }).join('');
}

function renderAnnouncementsList(containerId, announcements) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (!Array.isArray(announcements) || announcements.length === 0) {
    container.innerHTML = `
      <div class="announcement-item">
        <div class="announcement-content">
          <h4>No announcements yet</h4>
          <p>There are no published announcements at this time.</p>
        </div>
      </div>
    `;
    return;
  }

  announcements.forEach(announcement => {
    const item = document.createElement('div');
    item.className = 'announcement-item';
    item.innerHTML = `
      <div class="announcement-header">
        <span class="announcement-date">${formatDateTimeLocal(announcement.created_at)}</span>
      </div>
      <div class="announcement-body">
        <h4>${escapeHtml(announcement.title)}</h4>
        <div class="announcement-content">
          <p>${escapeHtml(announcement.content)}</p>
          <p class="announcement-author">Posted by ${escapeHtml(announcement.posted_by_name || 'CCS Admin')}</p>
        </div>
      </div>
      <div class="announcement-actions">
        <button type="button" class="btn-delete-announcement" data-id="${announcement.id}">Delete</button>
      </div>
    `;

    const deleteButton = item.querySelector('.btn-delete-announcement');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => deleteAnnouncement(announcement.id));
    }

    container.appendChild(item);
  });
}

async function deleteAnnouncement(announcementId) {
  if (!announcementId) return;

  const confirmed = confirm('Are you sure you want to delete this announcement? This action cannot be undone.');
  if (!confirmed) return;

  const statusEl = document.getElementById('announcementStatus');
  if (statusEl) {
    statusEl.textContent = 'Deleting announcement...';
    statusEl.style.color = '#1a1a1a';
  }

  try {
    const response = await fetch('delete-announcement.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ announcement_id: announcementId })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Unable to delete announcement.');
    }

    if (statusEl) {
      statusEl.textContent = data.message;
      statusEl.style.color = '#16a34a';
    }

    loadAdminAnnouncements();
    notifyAnnouncementUpdate('announcement_deleted');
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = error.message || 'Failed to delete announcement.';
      statusEl.style.color = '#dc2626';
    }
    console.error('Delete announcement error:', error);
  }
}

function notifyAnnouncementUpdate(type = 'announcement_updated') {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const channel = new BroadcastChannel('announcement_updates');
    channel.postMessage({ type });
    channel.close();
  } catch (e) {
    console.warn('Announcement update notify failed:', e);
  }
}

async function loadAdminAnnouncements() {
  try {
    const response = await fetch('js/get-announcements.php');
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Unable to load announcements');
    }

    renderAnnouncementsList('adminAnnouncementsList', data.announcements);
  } catch (error) {
    const container = document.getElementById('adminAnnouncementsList');
    if (container) {
      container.innerHTML = `
        <div class="announcement-item">
          <div class="announcement-content">
            <h4>Unable to load announcements</h4>
            <p>Please refresh the page or try again later.</p>
          </div>
        </div>
      `;
    }
    console.error('Error loading admin announcements:', error);
  }
}

async function submitAnnouncementForm(event) {
  event.preventDefault();

  const statusEl = document.getElementById('announcementStatus');
  const titleInput = document.getElementById('announcementTitle');
  const contentInput = document.getElementById('announcementContent');

  if (!titleInput || !contentInput || !statusEl) return;

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    statusEl.textContent = 'Please enter both title and content.';
    statusEl.style.color = '#d97706';
    return;
  }

  statusEl.textContent = 'Publishing announcement...';
  statusEl.style.color = '#1a1a1a';

  try {
    const response = await fetch('create-announcement.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content })
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Unable to publish announcement');
    }

    statusEl.textContent = data.message;
    statusEl.style.color = '#16a34a';
    document.getElementById('announcementForm').reset();
    loadAdminAnnouncements();
    notifyAnnouncementUpdate('announcement_created');
  } catch (error) {
    statusEl.textContent = error.message || 'Failed to publish announcement.';
    statusEl.style.color = '#dc2626';
    console.error('Announcement publish error:', error);
  }
}

function clearAnnouncementForm() {
  const form = document.getElementById('announcementForm');
  if (form) form.reset();
}

function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderCurrentSitInTable(sessions) {
  const tableBody = document.getElementById('currentSitInTableBody');
  const emptyRow = document.getElementById('currentSitInEmptyRow');
  const currentSitInHeader = document.getElementById('currentSitInHeader');
  const currentSitInCount = document.getElementById('currentSitInCount');

  if (!tableBody || !currentSitInHeader || !currentSitInCount) return;

  if (!sessions || sessions.length === 0) {
    tableBody.innerHTML = `
      <tr id="currentSitInEmptyRow">
        <td colspan="6" class="empty-state">
          <i data-feather="inbox"></i>
          <p>No students currently sit-in</p>
        </td>
      </tr>
    `;
    currentSitInCount.textContent = '0';
    currentSitInHeader.innerHTML = '<i data-feather="users"></i> Currently Sit-In (0)';
    feather.replace();
    return;
  }

  const rows = sessions.map(session => {
    const fullName = [session.first_name, session.middle_name, session.last_name].filter(Boolean).join(' ');
    return `
      <tr>
        <td>${escapeHtml(session.id_number)}</td>
        <td>${escapeHtml(fullName)}</td>
        <td>${escapeHtml(session.purpose || 'N/A')}</td>
        <td>${escapeHtml(session.computer_number || 'N/A')}</td>
        <td>${escapeHtml(formatDateTimeLocal(session.time_in))}</td>
        <td>${escapeHtml(session.status)}</td>
      </tr>
    `;
  }).join('');

  tableBody.innerHTML = rows;
  currentSitInCount.textContent = `${sessions.length}`;
  currentSitInHeader.innerHTML = `<i data-feather="users"></i> Currently Sit-In (${sessions.length})`;
  feather.replace();
}

async function loadDashboardData() {
  try {
    const response = await fetch('dashboard-data.php');
    const data = await response.json();

    if (!data.success) {
      console.error('Dashboard data error:', data.message || 'Unknown error');
      return;
    }

    const studentsRegisteredCount = document.getElementById('studentsRegisteredCount');
    const currentSitInCount = document.getElementById('currentSitInCount');
    const sitInTodayCount = document.getElementById('sitInTodayCount');
    const avgSessionsCount = document.getElementById('avgSessionsCount');

    if (studentsRegisteredCount) {
      studentsRegisteredCount.textContent = data.total_students;
    }
    if (currentSitInCount) {
      currentSitInCount.textContent = data.current_sitin;
    }
    if (sitInTodayCount) {
      sitInTodayCount.textContent = data.total_sitin_today;
    }
    if (avgSessionsCount) {
      avgSessionsCount.textContent = data.avg_sessions_per_student;
    }

    renderCurrentSitInTable(data.current_sitin_students || []);
    updateCourseChart(data.course_distribution || []);
    renderCourseChartLegend(data.course_distribution || []);
  } catch (error) {
    console.error('Unable to load dashboard data:', error);
  }
}

initCourseChart();

// ============================================
// NOTIFICATION BADGE
// ============================================
const notificationBtn = document.getElementById('notificationBtn');
if (notificationBtn) {
  notificationBtn.addEventListener('click', () => {
    console.log('Notifications clicked');
    // Implement notification panel here
  });
}

// ============================================
// REFRESH DATA
// ============================================
function refreshData() {
  console.log('Refreshing data...');
  // Implement data refresh logic
  // Could fetch from API and update tables/charts
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.querySelector('.logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
      // Clear session
      sessionStorage.clear();
      // Redirect to login
      window.location.href = 'index.html';
    }
  });
}

// ============================================
// REAL-TIME UPDATES (Optional)
// ============================================

// Update stats in real-time
function updateStats() {
  // This would typically fetch from an API
  console.log('Stats updated');
}

// Update every 30 seconds
// setInterval(updateStats, 30000);

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format Date/Time
function formatDateTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Toast Notification (reuse from login system)
function showToast(message, type = 'info') {
  if (typeof toastSystem !== 'undefined') {
    toastSystem.show(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Initialize tooltips, popovers, etc.
document.addEventListener('DOMContentLoaded', () => {
  console.log('Admin panel initialized');
  
  // Add active state to current page nav item
  const currentPage = window.location.pathname.split('/').pop();
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('href') === currentPage) {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    }
  });

  if (typeof loadDashboardData === 'function') {
    loadDashboardData();
  }

  if (typeof loadAdminAnnouncements === 'function') {
    loadAdminAnnouncements();
  }

  const announcementForm = document.getElementById('announcementForm');
  if (announcementForm) {
    announcementForm.addEventListener('submit', submitAnnouncementForm);
  }

  const clearAnnouncementButton = document.getElementById('clearAnnouncementForm');
  if (clearAnnouncementButton) {
    clearAnnouncementButton.addEventListener('click', clearAnnouncementForm);
  }

  const refreshBtn = document.getElementById('refreshDashboardBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof loadDashboardData === 'function') {
        loadDashboardData();
      }
    });
  }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================

// Export report as PDF or Excel
function exportReport(format = 'pdf') {
  console.log(`Exporting report as ${format}...`);
  showToast(`Report exported as ${format.toUpperCase()}`, 'success');
  // Implement export logic here
}

// ============================================
// EDIT PROFILE MODAL FUNCTIONS
// ============================================

// Open Edit Profile Modal
function openEditProfileModal() {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  if (user) {
    // Load admin data into form
    document.getElementById('adminFirstName').value = user.first_name || 'Admin';
    document.getElementById('adminLastName').value = user.last_name || 'User';
    document.getElementById('adminEmail').value = user.email || 'admin@worklog.com';
    
    // Update avatar - use profile picture if available
    const avatarImg = document.getElementById('adminAvatarPreview');
    if (user.profile_picture) {
      avatarImg.src = user.profile_picture;
    } else {
      const initials = `${user.first_name || 'Admin'} ${user.last_name || 'User'}`;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=703081&color=fff&size=100`;
      avatarImg.src = avatarUrl;
    }
  }
  
  // Show modal
  const modal = document.getElementById('editProfileModal');
  modal.classList.add('show');
  
  // Re-initialize Feather icons
  setTimeout(() => feather.replace(), 10);
  
  // Close user dropdown
  document.getElementById('userDropdown').classList.remove('show');
}

// Close Edit Profile Modal
function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.remove('show');
  
  // Clear password fields
  document.getElementById('adminCurrentPassword').value = '';
  document.getElementById('adminNewPassword').value = '';
  document.getElementById('adminConfirmPassword').value = '';
}

// Toggle Password Visibility (Admin)
function toggleAdminPassword(fieldId) {
  const field = document.getElementById(fieldId);
  const button = field.parentElement.querySelector('.toggle-password');
  const icon = button.querySelector('i');
  
  if (field.type === 'password') {
    field.type = 'text';
    icon.setAttribute('data-feather', 'eye-off');
  } else {
    field.type = 'password';
    icon.setAttribute('data-feather', 'eye');
  }
  
  feather.replace();
}

// Profile Picture Upload (Admin)
let adminUploadedProfilePicture = null; // Store the base64 image

document.addEventListener('DOMContentLoaded', function() {
  const profilePictureInput = document.getElementById('adminProfilePicture');
  
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          showAdminToast('error', 'Image size must be less than 2MB');
          return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
          showAdminToast('error', 'Please select an image file');
          return;
        }
        
        // Preview image and store base64
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64Image = e.target.result;
          document.getElementById('adminAvatarPreview').src = base64Image;
          adminUploadedProfilePicture = base64Image; // Store for upload
          showAdminToast('success', 'Photo selected! Click "Save Changes" to update.');
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// Save Admin Profile
async function saveAdminProfile() {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  if (!user) {
    showAdminToast('error', 'Session expired. Please login again.');
    return;
  }
  
  // Get form values
  const firstName = document.getElementById('adminFirstName').value.trim();
  const lastName = document.getElementById('adminLastName').value.trim();
  const email = document.getElementById('adminEmail').value.trim();
  
  const currentPassword = document.getElementById('adminCurrentPassword').value;
  const newPassword = document.getElementById('adminNewPassword').value;
  const confirmPassword = document.getElementById('adminConfirmPassword').value;
  
  // Validate required fields
  if (!firstName || !lastName || !email) {
    showAdminToast('error', 'Please fill all required fields');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAdminToast('error', 'Please enter a valid email address');
    return;
  }
  
  // Validate password change (if provided)
  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword) {
      showAdminToast('error', 'Please enter your current password');
      return;
    }
    
    if (!newPassword) {
      showAdminToast('error', 'Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      showAdminToast('error', 'New password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showAdminToast('error', 'New passwords do not match');
      return;
    }
  }
  
  // Prepare data to send
  const updateData = {
    user_id: user.id,
    first_name: firstName,
    middle_name: '',
    last_name: lastName,
    email: email,
    address: '',
    profile_picture: adminUploadedProfilePicture // Include base64 image
  };
  
  // Add password fields if changing password
  if (currentPassword && newPassword) {
    updateData.current_password = currentPassword;
    updateData.new_password = newPassword;
  }
  
  // Send update request
  try {
    const response = await fetch('update-profile.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update session storage
      user.first_name = firstName;
      user.last_name = lastName;
      user.email = email;
      if (adminUploadedProfilePicture) {
        user.profile_picture = adminUploadedProfilePicture;
      }
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // Update UI
      const userName = document.querySelector('.user-name-nav');
      if (userName) {
        userName.textContent = firstName;
      }
      
      const footerName = document.querySelector('.user-name');
      if (footerName) {
        footerName.textContent = `${firstName} ${lastName}`;
      }
      
      // Update profile picture in navbar if it was changed
      if (adminUploadedProfilePicture) {
        const navbarImg = document.querySelector('.user-img');
        if (navbarImg) {
          navbarImg.src = adminUploadedProfilePicture;
        }
      }
      
      // Show success and close modal
      showAdminToast('success', data.message || 'Profile updated successfully!');
      
      setTimeout(() => {
        closeEditProfileModal();
      }, 1500);
    } else {
      showAdminToast('error', data.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Update error:', error);
    showAdminToast('error', 'Connection error. Please try again.');
  }
}

// Show Admin Toast Notification
function showAdminToast(type, message) {
  const container = document.getElementById('adminToastContainer');
  
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = getAdminToastIcon(type);
  
  toast.innerHTML = `
    ${icon}
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }, 5000);
  
  // Re-initialize Feather icons for the toast
  feather.replace();
}

function getAdminToastIcon(type) {
  const icons = {
    success: '<i data-feather="check-circle"></i>',
    error: '<i data-feather="alert-circle"></i>',
    warning: '<i data-feather="alert-triangle"></i>',
    info: '<i data-feather="info"></i>'
  };
  return icons[type] || icons.info;
}

// Add slide out animation
if (!document.getElementById('toastAnimationStyle')) {
  const style = document.createElement('style');
  style.id = 'toastAnimationStyle';
  style.textContent = `
    @keyframes toastSlideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('editProfileModal');
  if (modal && e.target === modal.querySelector('.modal-overlay')) {
    closeEditProfileModal();
  }
});

// Close modal with ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('editProfileModal');
    if (modal && modal.classList.contains('show')) {
      closeEditProfileModal();
    }
  }
});

// Logout function
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    fetch('logout.php', { method: 'POST' })
      .then(() => {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
      })
      .catch(() => {
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
      });
  }
}

// ============================================
// STUDENT SEARCH FUNCTIONS
// Add to admin-script.js
// ============================================

/**
 * Search Students by ID or Name
 */
async function searchStudents() {
  const searchInput = document.getElementById('studentSearch');
  const query = searchInput.value.trim();
  
  if (!query) {
    showToast('Please enter a search query', 'warning');
    return;
  }
  
  // Show loading state
  showSearchLoading();
  
  try {
    const response = await fetch(`search-students.php?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.success) {
      displaySearchResults(data.students, data.count);
      showToast(data.message, 'success');
    } else {
      displayNoResults(data.message);
      showToast(data.message, 'info');
    }
  } catch (error) {
    console.error('Search error:', error);
    hideSearchLoading();
    showToast('Error searching students. Please try again.', 'error');
  }
}

/**
 * Display Search Results
 */
function displaySearchResults(students, count) {
  hideSearchLoading();
  
  const resultsContainer = document.getElementById('searchResults');
  const resultsTable = document.getElementById('resultsTable');
  const resultsTableBody = document.getElementById('resultsTableBody');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('searchEmpty');
  const clearBtn = document.querySelector('.btn-clear');
  
  // Show results container
  resultsContainer.style.display = 'block';
  emptyState.style.display = 'none';
  resultsTable.style.display = 'block';
  clearBtn.style.display = 'flex';
  
  // Update count
  resultsCount.textContent = `${count} student${count !== 1 ? 's' : ''} found`;
  
  // Clear existing results
  resultsTableBody.innerHTML = '';
  
  // Populate table
  students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="student-id">
          <span class="id-badge">${escapeHtml(student.id_number)}</span>
        </div>
      </td>
      <td>
        <div class="student-info">
          <div class="student-avatar-small">
            ${getStudentAvatar(student)}
          </div>
          <div class="student-details">
            <p class="student-name-text">${escapeHtml(student.full_name)}</p>
          </div>
        </div>
      </td>
      <td>
        <div class="course-info">
          <span class="course-badge">${escapeHtml(student.course)}</span>
          <span class="year-badge">Year ${student.year}</span>
        </div>
      </td>
      <td>${escapeHtml(student.email)}</td>
      <td>
        <span class="session-badge">${student.total_sessions}</span>
      </td>
      <td>
        <span class="remaining-badge ${student.remaining_sessions < 10 ? 'low' : ''}">${student.remaining_sessions}</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-view" onclick="viewStudentDetails(${student.id})" title="View Details">
            <i data-feather="eye"></i>
          </button>
          <button class="btn-action btn-edit" onclick="editStudent(${student.id})" title="Edit Student">
            <i data-feather="edit"></i>
          </button>
          <button class="btn-action btn-history" onclick="viewStudentHistory(${student.id})" title="View History">
            <i data-feather="clock"></i>
          </button>
        </div>
      </td>
    `;
    resultsTableBody.appendChild(row);
  });
  
  // Reinitialize feather icons
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
}

/**
 * Display No Results State
 */
function displayNoResults(message) {
  hideSearchLoading();
  
  const resultsContainer = document.getElementById('searchResults');
  const resultsTable = document.getElementById('resultsTable');
  const emptyState = document.getElementById('searchEmpty');
  const emptyMessage = document.getElementById('emptyMessage');
  const clearBtn = document.querySelector('.btn-clear');
  
  resultsContainer.style.display = 'block';
  resultsTable.style.display = 'none';
  emptyState.style.display = 'flex';
  clearBtn.style.display = 'flex';
  
  emptyMessage.textContent = message;
  
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
}

/**
 * Show Search Loading State
 */
function showSearchLoading() {
  const resultsContainer = document.getElementById('searchResults');
  const loadingState = document.getElementById('searchLoading');
  const resultsTable = document.getElementById('resultsTable');
  const emptyState = document.getElementById('searchEmpty');
  
  resultsContainer.style.display = 'block';
  loadingState.style.display = 'flex';
  resultsTable.style.display = 'none';
  emptyState.style.display = 'none';
}

/**
 * Hide Search Loading State
 */
function hideSearchLoading() {
  const loadingState = document.getElementById('searchLoading');
  loadingState.style.display = 'none';
}

/**
 * Clear Search
 */
function clearSearch() {
  const searchInput = document.getElementById('studentSearch');
  const resultsContainer = document.getElementById('searchResults');
  const clearBtn = document.querySelector('.btn-clear');

  if (searchInput) {
    searchInput.value = '';
  }
  if (globalSearch) {
    globalSearch.value = '';
  }
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  if (searchInput) {
    searchInput.focus();
  } else if (globalSearch) {
    globalSearch.focus();
  }
}

/**
 * Get Student Avatar HTML
 */
function getStudentAvatar(student) {
  if (student.profile_picture && student.profile_picture.startsWith('data:image')) {
    return `<img src="${student.profile_picture}" alt="${student.full_name}">`;
  } else {
    const initials = (student.first_name.charAt(0) + student.last_name.charAt(0)).toUpperCase();
    return `<div class="avatar-initials">${initials}</div>`;
  }
}

/**
 * View Student Details (Placeholder)
 */
function viewStudentDetails(studentId) {
  showToast('Opening student details...', 'info');
  // TODO: Implement student details modal
  console.log('View student:', studentId);
}

/**
 * Edit Student (Placeholder)
 */
function editStudent(studentId) {
  showToast('Opening edit student form...', 'info');
  // TODO: Implement edit student functionality
  console.log('Edit student:', studentId);
}

/**
 * View Student History (Placeholder)
 */
function viewStudentHistory(studentId) {
  showToast('Opening session history...', 'info');
  // TODO: Implement session history view
  console.log('View history for student:', studentId);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Search on Enter key
 */
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('studentSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchStudents();
      }
    });
  }
});