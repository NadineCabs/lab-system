const user = JSON.parse(sessionStorage.getItem('user') || 'null');
const announcementUpdatesChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('announcement_updates') : null;

if (announcementUpdatesChannel) {
  announcementUpdatesChannel.onmessage = (event) => {
    if (!event.data || typeof event.data.type !== 'string') return;
    if (event.data.type === 'announcement_created' || event.data.type === 'announcement_deleted' || event.data.type === 'announcement_updated') {
      loadAnnouncements();
    }
  };
}

if (!user) {
  // Not logged in, redirect to login
  window.location.href = 'index.html';
} else if (user.role === 'admin') {
  // Admin should go to admin dashboard
  window.location.href = 'admin-dashboard.html';
} else {
  // Load student data
  loadStudentData();
}

// LOAD STUDENT DATA
function loadStudentData() {
  // Update student information
  document.getElementById('studentName').textContent = `${user.first_name} ${user.last_name}`;
  document.getElementById('fullName').textContent = `${user.first_name} ${user.middle_name} ${user.last_name}`.replace(/\s+/g, ' ').trim();
  document.getElementById('course').textContent = user.course || 'N/A';
  document.getElementById('year').textContent = user.course_level || 'N/A';
  document.getElementById('email').textContent = user.email || 'N/A';
  document.getElementById('address').textContent = user.address || 'N/A';
  
  // Update avatar - use profile picture if available, otherwise generate from initials
  const avatarImg = document.getElementById('studentAvatar');
  
  if (user.profile_picture && user.profile_picture.startsWith('data:image')) {
    // Use uploaded profile picture
    console.log('Loading profile picture from database');
    avatarImg.src = user.profile_picture;
    
    // Add error handler in case image fails to load
    avatarImg.onerror = function() {
      console.error('Failed to load profile picture, using initials');
      const initials = `${user.first_name} ${user.last_name}`;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1a5490&color=fff&size=120`;
      avatarImg.src = avatarUrl;
    };
  } else {
    // Generate from initials
    console.log('No profile picture, generating from initials');
    const initials = `${user.first_name} ${user.last_name}`;
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=1a5490&color=fff&size=120`;
    avatarImg.src = avatarUrl;
  }
  
  // Load announcements from database
  loadAnnouncements();
  setInterval(loadAnnouncements, 30000);
}

// LOAD ANNOUNCEMENTS
async function loadAnnouncements() {
  try {
    const container = document.getElementById('announcementsContainer');
    if (!container) return;

    container.innerHTML = '<div class="announcement-item"><div class="announcement-header"><span class="announcement-date">Loading announcements...</span></div></div>';

    const response = await fetch('js/get-announcements.php');
    const data = await response.json();

    container.innerHTML = '';

    if (data.success && data.announcements.length > 0) {
      data.announcements.forEach(announcement => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.innerHTML = `
          <div class="announcement-header">
            <span class="announcement-author">${announcement.posted_by_name || 'CCS Admin'}</span>
            <span class="announcement-date">${formatDate(announcement.created_at)}</span>
          </div>
          <div class="announcement-content">
            <h4>${announcement.title}</h4>
            <p>${announcement.content}</p>
          </div>
        `;
        container.appendChild(item);
      });
    } else {
      container.innerHTML = `
        <div class="announcement-item">
          <div class="announcement-content">
            <h4>No announcements yet</h4>
            <p>There are no active announcements at this time. Please check back later.</p>
          </div>
        </div>
      `;
    }
  } catch (error) {
    const container = document.getElementById('announcementsContainer');
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
    console.error('Error loading announcements:', error);
  }
}

// LOGOUT MODAL FUNCTIONS

// Open Logout Modal
function logout() {
  const modal = document.getElementById('logoutModal');
  modal.classList.add('show');
  
  // Initialize feather icons
  setTimeout(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, 100);
}

// Close Logout Modal
function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('show');
}

// Confirm Logout
function confirmLogout() {
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

// NOTIFICATION DROPDOWN
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');

if (notificationBtn && notificationDropdown) {
  notificationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    notificationDropdown.classList.remove('show');
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Initialize Feather Icons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
});

// ============================================
// PURPLE & GOLD EDIT PROFILE MODAL - AUTO UPDATE
// Add to dashboard-student-script.js
// ============================================

let uploadedProfilePicture = null;

// Open Edit Profile Modal
function openEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.add('show');
  
  // Load user data
  loadModalUserData();
  
  // Initialize feather icons
  setTimeout(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, 100);
}

// Close Edit Profile Modal
function closeEditProfileModal() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.remove('show');
  
  // Reset form
  document.getElementById('editProfileForm').reset();
  uploadedProfilePicture = null;
}

// Load User Data into Modal
function loadModalUserData() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  // Full name
  const fullName = `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim();
  document.getElementById('modalFullName').value = fullName;
  
  // Email
  document.getElementById('modalEmail').value = user.email || '';
  
  // Course & Year
  document.getElementById('modalCourse').value = user.course || '';
  document.getElementById('modalYear').value = user.course_level || '';
  
  // Address
  document.getElementById('modalAddress').value = user.address || '';
  
  // Avatar
  const modalAvatar = document.getElementById('modalAvatar');
  if (user.profile_picture && user.profile_picture.startsWith('data:image')) {
    modalAvatar.src = user.profile_picture;
  } else {
    const initials = `${user.first_name} ${user.last_name}`;
    modalAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=9400D3&color=fff&size=90`;
  }
}

// Toggle Password Visibility
function toggleModalPassword(fieldId) {
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

// ============================================
// SAVE PROFILE CHANGES - AUTO UPDATE DASHBOARD
// ============================================
async function saveProfileChanges() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  const fullName = document.getElementById('modalFullName').value.trim();
  const email = document.getElementById('modalEmail').value.trim();
  const address = document.getElementById('modalAddress').value.trim();
  const currentPassword = document.getElementById('modalCurrentPassword').value;
  const newPassword = document.getElementById('modalNewPassword').value;
  
  // Validate
  if (!fullName || !email || !address) {
    alert('Please fill all required fields');
    return;
  }
  
  // Parse name (simple split)
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts[nameParts.length - 1] || '';
  const middleName = nameParts.slice(1, -1).join(' ') || '';
  
  // Prepare data
  const updateData = {
    user_id: user.id,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    email: email,
    address: address,
    profile_picture: uploadedProfilePicture
  };
  
  // Add password if changing
  if (currentPassword && newPassword) {
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    updateData.current_password = currentPassword;
    updateData.new_password = newPassword;
  }
  
  // Save to server
  try {
    const response = await fetch('update-profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update session
      user.first_name = firstName;
      user.middle_name = middleName;
      user.last_name = lastName;
      user.email = email;
      user.address = address;
      if (uploadedProfilePicture) {
        user.profile_picture = uploadedProfilePicture;
      }
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // ✅ FIX: Update dashboard WITHOUT refresh
      updateDashboardDisplay();
      
      // Close modal
      closeEditProfileModal();
      
      alert('Profile updated successfully!');
    } else {
      alert(data.message || 'Failed to update profile');
    }
  } catch (error) {
    alert('Connection error. Please try again.');
  }
}

// ============================================
// UPDATE DASHBOARD DISPLAY (NO REFRESH NEEDED!)
// ============================================
function updateDashboardDisplay() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  // Update student name
  document.getElementById('studentName').textContent = `${user.first_name} ${user.last_name}`;
  
  // Update full name
  document.getElementById('fullName').textContent = `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.replace(/\s+/g, ' ').trim();
  
  // Update email
  document.getElementById('email').textContent = user.email || 'N/A';
  
  // Update address
  document.getElementById('address').textContent = user.address || 'N/A';
  
  // ✅ FIX: Update avatar on dashboard
  const avatarImg = document.getElementById('studentAvatar');
  if (user.profile_picture && user.profile_picture.startsWith('data:image')) {
    avatarImg.src = user.profile_picture;
  } else {
    const initials = `${user.first_name} ${user.last_name}`;
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=9400D3&color=fff&size=120`;
  }
}


// REMOVE PROFILE PICTURE - AUTO UPDATE DASHBOARD
function removeProfilePicture() {
  if (confirm('Remove profile picture?')) {
    const user = JSON.parse(sessionStorage.getItem('user'));
    
    // Remove from session
    user.profile_picture = null;
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Update modal avatar
    const initials = `${user.first_name} ${user.last_name}`;
    const modalAvatar = document.getElementById('modalAvatar');
    modalAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=9400D3&color=fff&size=90`;
    
    // FIX: Also update dashboard avatar immediately
    const dashboardAvatar = document.getElementById('studentAvatar');
    dashboardAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=9400D3&color=fff&size=120`;
    
    // Set to null so it saves to database when user clicks "Save changes"
    uploadedProfilePicture = null;
    
    // Update database immediately
    updateProfilePictureInDatabase(null);
  }
}

// UPDATE PROFILE PICTURE IN DATABASE
async function updateProfilePictureInDatabase(profilePicture) {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  try {
    const response = await fetch('update-profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        address: user.address,
        profile_picture: profilePicture
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Profile picture updated in database');
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
  }
}

// Delete Account
async function confirmDeleteAccount() {
  const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  
  if (!confirmed) return;
  
  const doubleConfirm = confirm('This will permanently delete all your data. Are you absolutely sure?');
  
  if (!doubleConfirm) return;
  
  try {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const response = await fetch('delete-account.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });
    
    const data = await response.json();
    
    if (data.success) {
      sessionStorage.removeItem('user');
      alert('Account deleted successfully');
      window.location.href = 'index.html';
    } else {
      alert(data.message || 'Failed to delete account');
    }
  } catch (error) {
    alert('Connection error. Please try again.');
  }
}

// CROPPER MODAL FUNCTIONS
let cropperState = {
  image: null,
  cropBox: { x: 0, y: 0, size: 250 },
  zoom: 1,
  isDragging: false,
  isResizing: false,
  dragStart: { x: 0, y: 0 },
  resizeCorner: null
};

function openCropperModal() {
  document.getElementById('cropperModal').style.display = 'flex';
  setTimeout(() => feather.replace(), 100);
}

function closeCropperModal() {
  document.getElementById('cropperModal').style.display = 'none';
  resetCropper();
}

function resetCropper() {
  document.getElementById('cropArea').style.display = 'none';
  document.getElementById('uploadZone').style.display = 'flex';
  document.getElementById('uploadBtn').style.display = 'none';
  document.getElementById('cropImage').src = '';
  document.getElementById('zoomSlider').value = 100;
}

// Setup upload zone
document.addEventListener('DOMContentLoaded', function() {
  const uploadZone = document.getElementById('uploadZone');
  const cropInput = document.getElementById('cropImageInput');
  
  if (uploadZone && cropInput) {
    uploadZone.addEventListener('click', () => cropInput.click());
    cropInput.addEventListener('change', handleImageUpload);
    setupCropBoxInteractions();
    setupZoomSlider();
  }
});

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) loadImageFile(file);
}

function loadImageFile(file) {
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('Image must be less than 5MB');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.getElementById('cropImage');
    img.onload = function() {
      document.getElementById('uploadZone').style.display = 'none';
      document.getElementById('cropArea').style.display = 'block';
      document.getElementById('uploadBtn').style.display = 'block';
      setTimeout(() => {
        centerCropBox();
        feather.replace();
      }, 100);
    };
    img.src = e.target.result;
    cropperState.image = e.target.result;
  };
  reader.readAsDataURL(file);
}

function centerCropBox() {
  const container = document.getElementById('imageContainer');
  const cropBox = document.getElementById('cropBox');
  if (!container || !cropBox) return;
  
  const containerRect = container.getBoundingClientRect();
  const boxSize = 250;
  
  cropperState.cropBox.x = (containerRect.width - boxSize) / 2;
  cropperState.cropBox.y = (containerRect.height - boxSize) / 2;
  cropperState.cropBox.size = boxSize;
  
  updateCropBox();
}

function updateCropBox() {
  const cropBox = document.getElementById('cropBox');
  if (!cropBox) return;
  
  cropBox.style.left = cropperState.cropBox.x + 'px';
  cropBox.style.top = cropperState.cropBox.y + 'px';
  cropBox.style.width = cropperState.cropBox.size + 'px';
  cropBox.style.height = cropperState.cropBox.size + 'px';
}

function setupCropBoxInteractions() {
  const cropBox = document.getElementById('cropBox');
  const handles = document.querySelectorAll('.corner-handle');
  
  if (!cropBox) return;
  
  cropBox.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('corner-handle')) return;
    if (e.target.classList.contains('circle-overlay')) return;
    e.preventDefault();
    e.stopPropagation();
    startDrag(e);
  });
  
  handles.forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      startResize(e);
    });
  });
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', stopDragResize);
}

function startDrag(e) {
  cropperState.isDragging = true;
  cropperState.dragStart = {
    x: e.clientX - cropperState.cropBox.x,
    y: e.clientY - cropperState.cropBox.y
  };
}

function startResize(e) {
  cropperState.isResizing = true;
  cropperState.resizeCorner = e.target.dataset.corner;
  cropperState.dragStart = {
    x: e.clientX,
    y: e.clientY,
    boxX: cropperState.cropBox.x,
    boxY: cropperState.cropBox.y,
    boxSize: cropperState.cropBox.size
  };
}

function onMouseMove(e) {
  if (cropperState.isDragging) {
    const container = document.getElementById('imageContainer');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    let newX = e.clientX - cropperState.dragStart.x;
    let newY = e.clientY - cropperState.dragStart.y;
    
    newX = Math.max(0, Math.min(newX, containerRect.width - cropperState.cropBox.size));
    newY = Math.max(0, Math.min(newY, containerRect.height - cropperState.cropBox.size));
    
    cropperState.cropBox.x = newX;
    cropperState.cropBox.y = newY;
    updateCropBox();
  }
  
  if (cropperState.isResizing) {
    const deltaX = e.clientX - cropperState.dragStart.x;
    const deltaY = e.clientY - cropperState.dragStart.y;
    const corner = cropperState.resizeCorner;
    
    let newSize = cropperState.dragStart.boxSize;
    let newX = cropperState.dragStart.boxX;
    let newY = cropperState.dragStart.boxY;
    
    if (corner === 'br') {
      newSize = Math.max(100, cropperState.dragStart.boxSize + Math.max(deltaX, deltaY));
    } else if (corner === 'bl') {
      const delta = Math.max(-deltaX, deltaY);
      newSize = Math.max(100, cropperState.dragStart.boxSize + delta);
      newX = cropperState.dragStart.boxX - delta;
    } else if (corner === 'tr') {
      const delta = Math.max(deltaX, -deltaY);
      newSize = Math.max(100, cropperState.dragStart.boxSize + delta);
      newY = cropperState.dragStart.boxY - delta;
    } else if (corner === 'tl') {
      const delta = Math.max(-deltaX, -deltaY);
      newSize = Math.max(100, cropperState.dragStart.boxSize + delta);
      newX = cropperState.dragStart.boxX - delta;
      newY = cropperState.dragStart.boxY - delta;
    }
    
    const container = document.getElementById('imageContainer');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    if (newX < 0) { newSize += newX; newX = 0; }
    if (newY < 0) { newSize += newY; newY = 0; }
    if (newX + newSize > containerRect.width) newSize = containerRect.width - newX;
    if (newY + newSize > containerRect.height) newSize = containerRect.height - newY;
    
    cropperState.cropBox.x = newX;
    cropperState.cropBox.y = newY;
    cropperState.cropBox.size = newSize;
    updateCropBox();
  }
}

function stopDragResize() {
  cropperState.isDragging = false;
  cropperState.isResizing = false;
}

function setupZoomSlider() {
  const zoomSlider = document.getElementById('zoomSlider');
  if (zoomSlider) {
    zoomSlider.addEventListener('input', function() {
      const zoom = this.value / 100;
      cropperState.zoom = zoom;
      const img = document.getElementById('cropImage');
      if (img) img.style.transform = `scale(${zoom})`;
    });
  }
}

// UPLOAD CROPPED IMAGE - AUTO UPDATE DASHBOARD
function uploadCroppedImage() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = document.getElementById('cropImage');
  const container = document.getElementById('imageContainer');
  
  if (!img || !container) return;
  
  const imgRect = img.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  const scaleX = img.naturalWidth / imgRect.width;
  const scaleY = img.naturalHeight / imgRect.height;
  
  const cropX = (cropperState.cropBox.x - (containerRect.width - imgRect.width) / 2) * scaleX / cropperState.zoom;
  const cropY = (cropperState.cropBox.y - (containerRect.height - imgRect.height) / 2) * scaleY / cropperState.zoom;
  const cropSize = cropperState.cropBox.size * scaleX / cropperState.zoom;
  
  canvas.width = 300;
  canvas.height = 300;
  
  ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, 300, 300);
  
  const croppedImage = canvas.toDataURL('image/png');
  uploadedProfilePicture = croppedImage;
  
  // Update modal avatar
  document.getElementById('modalAvatar').src = croppedImage;
  
  // ✅ FIX: Also update dashboard avatar immediately (preview)
  const dashboardAvatar = document.getElementById('studentAvatar');
  dashboardAvatar.src = croppedImage;
  
  // Update session (temporary until user clicks Save)
  const user = JSON.parse(sessionStorage.getItem('user'));
  user.profile_picture = croppedImage;
  sessionStorage.setItem('user', JSON.stringify(user));
  
  closeCropperModal();
}

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.error('Toast container not found');
    return;
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Get icon based on type
  const icon = getToastIcon(type);
  
  // Build toast HTML
  toast.innerHTML = `
    <div class="toast-icon">
      ${icon}
    </div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" onclick="closeToast(this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="toast-progress"></div>
  `;
  
  // Add to container
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}
 
/**
 * Get icon SVG based on toast type
 */
function getToastIcon(type) {
  const icons = {
    success: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `,
    error: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `,
    warning: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
    info: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `
  };
  
  return icons[type] || icons.info;
}
 
/**
 * Close toast manually
 */
function closeToast(button) {
  const toast = button.closest('.toast');
  removeToast(toast);
}
 
/**
 * Remove toast with animation
 */
function removeToast(toast) {
  toast.classList.add('hiding');
  setTimeout(() => {
    toast.remove();
  }, 300);
}