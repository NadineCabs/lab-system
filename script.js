// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

class ToastNotification {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  init() {
    if (!document.body) {
      window.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }

    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';

      this.container.style.position = "fixed";
      this.container.style.top = "75px";
      this.container.style.right = "20px";
      this.container.style.left = "auto";
      this.container.style.bottom = "auto";
      this.container.style.zIndex = "9999";

      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', duration = 5000) {
    const toast = this.createToast(message, type);
    this.container.appendChild(toast);
    this.toasts.push(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    if (duration > 0) {
      setTimeout(() => this.hide(toast), duration);
    }

    return toast;
  }

  createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = this.getIcon(type);

    toast.innerHTML = `
      ${icon}
      <div class="toast-content">${message}</div>
      <button class="toast-close" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="toast-progress"></div>
    `;

    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide(toast));
    }

    return toast;
  }

  getIcon(type) {
    const icons = {
      success: `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>`,
      error: `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>`,
      warning: `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>`,
      info: `<div class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>`
    };
    return icons[type] || icons.info;
  }

  hide(toast) {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 400);
  }

  success(message, duration = 5000) { return this.show(message, 'success', duration); }
  error(message, duration = 5000) { return this.show(message, 'error', duration); }
  warning(message, duration = 5000) { return this.show(message, 'warning', duration); }
  info(message, duration = 5000) { return this.show(message, 'info', duration); }
  clear() { this.toasts.forEach(toast => this.hide(toast)); }
}

const toastSystem = new ToastNotification();
window.toastSystem = toastSystem; // make global for any inline handlers or third-party scripts

// ============================================
// HAMBURGER & NAVIGATION
// ============================================

// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

// Show/Hide forms
function showLogin() {
  document.getElementById('loginContainer').style.display = 'block';
  document.getElementById('registerContainer').style.display = 'none';
  document.getElementById('loginBox').classList.remove('hidden');
  document.getElementById('registerBox').classList.add('hidden');
  clearMessages();
}

function showRegister() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('registerContainer').style.display = 'block';
  document.getElementById('loginBox').classList.add('hidden');
  document.getElementById('registerBox').classList.remove('hidden');
  clearMessages();
}

function showLoginPanel() {
  showLogin();
}

function showRegisterPanel() {
  showRegister();
}

function clearMessages() {
  const messages = document.querySelectorAll('.message');
  messages.forEach(msg => {
    msg.classList.remove('show');
    msg.textContent = '';
  });
}

// LOGIN function
async function login() {
  const idNumber = document.getElementById('loginStudentID').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!idNumber || !password) {
    showMessage('loginMessage', 'Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch('login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: idNumber,
        password: password
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('loginMessage', data.message, 'success');
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      // NEW (FIXED):
setTimeout(() => {
    if (data.user.role === 'admin') {
        console.log('Admin detected - redirecting to admin-dashboard.html');
        window.location.href = 'admin-dashboard.html';  // ← Admin goes here!
    } else {
        console.log('Student detected - redirecting to dashboard.html');
        window.location.href = 'dashboard.html';  // ← Students go here
    }
      }, 1000);
    } else {
      showMessage('loginMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('loginMessage', 'Connection error. Please try again.', 'error');
    console.error('Login error:', error);
  }
}

// REGISTER function - FIXED to include role
async function register() {
  const idNumber = document.getElementById('regIDnumber').value.trim();
  const firstName = document.getElementById('regFirstName').value.trim();
  const middleName = document.getElementById('regMiddleName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const course = document.getElementById('regCourse').value.trim();
  const courseLevel = document.getElementById('regCourseLevel').value;
  const role = document.getElementById('regRole').value;
  const address = document.getElementById('regAddress').value.trim();
  const password = document.getElementById('regPassword').value;
  const repeatPassword = document.getElementById('regRepeatPassword').value;

  if (!idNumber || !firstName || !lastName || !email || !course || !courseLevel || !role || !password || !repeatPassword) {
    showMessage('regMessage', 'Please fill all required fields', 'error');
    return;
  }

  if (password !== repeatPassword) {
    showMessage('regMessage', 'Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('regMessage', 'Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const response = await fetch('register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_number: idNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: email,
        course: course,
        course_level: parseInt(courseLevel),
        role: role,
        address: address,
        password: password,
        repeat_password: repeatPassword
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('regMessage', data.message, 'success');
      
      // Clear form
      document.getElementById('regIDnumber').value = '';
      document.getElementById('regFirstName').value = '';
      document.getElementById('regMiddleName').value = '';
      document.getElementById('regLastName').value = '';
      document.getElementById('regEmail').value = '';
      document.getElementById('regCourse').value = '';
      document.getElementById('regCourseLevel').value = '';
      document.getElementById('regRole').value = '';
      document.getElementById('regAddress').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('regRepeatPassword').value = '';
      
      setTimeout(() => showLogin(), 2000);
    } else {
      showMessage('regMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('regMessage', 'Connection error. Please try again.', 'error');
    console.error('Registration error:', error);
  }
}

// UPDATED: ONLY SHOW TOAST - NO INLINE MESSAGE
function showMessage(elementId, message, type) {
  // ONLY show toast notification in top-right
  if (type === 'success') {
    toastSystem.success(message);
  } else if (type === 'error') {
    toastSystem.error(message);
  } else if (type === 'warning') {
    toastSystem.warning(message);
  } else {
    toastSystem.info(message);
  }
  
  // DO NOT show inline message - REMOVED!
  // The inline message <p> will stay hidden
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
  const loginInputs = document.querySelectorAll('#loginBox input');
  loginInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') login();
    });
  });

  const regInputs = document.querySelectorAll('#registerBox input, #registerBox select');
  regInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') register();
    });
  });
});