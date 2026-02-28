
//  NAVBAR
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Active nav link highlight
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// Navbar Login/Register buttons → scroll to & show the right form
function showLoginPanel() {
  showLogin();
  document.querySelector('.right-side').scrollIntoView({ behavior: 'smooth' });
}

function showRegisterPanel() {
  showRegister();
  document.querySelector('.right-side').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
//  FORMS – Show / Hide
// ============================================
function showLogin() {
  const loginBox    = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  registerBox.classList.add('hidden');
  setTimeout(() => loginBox.classList.remove('hidden'), 50);
  clearMessages();
}

function showRegister() {
  const loginBox    = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  loginBox.classList.add('hidden');
  setTimeout(() => registerBox.classList.remove('hidden'), 50);
  clearMessages();
}

function clearMessages() {
  document.getElementById('loginMessage').className = 'message';
  document.getElementById('regMessage').className   = 'message';
}

// ============================================
//  REGISTER
// ============================================
async function register() {
  const fullName  = document.getElementById('regFullName').value.trim();
  const studentId = document.getElementById('regStudentId').value.trim();
  const username  = document.getElementById('regUsername').value.trim();
  const password  = document.getElementById('regPassword').value;

  if (!fullName || !studentId || !username || !password) {
    showMessage('regMessage', 'Please fill all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('regMessage', 'Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const response = await fetch('register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, student_id: studentId, username, password })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('regMessage', data.message, 'success');
      document.getElementById('regFullName').value  = '';
      document.getElementById('regStudentId').value = '';
      document.getElementById('regUsername').value  = '';
      document.getElementById('regPassword').value  = '';
      setTimeout(() => showLogin(), 2000);
    } else {
      showMessage('regMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('regMessage', 'Connection error. Please try again.', 'error');
  }
}

// ============================================
//  LOGIN
// ============================================
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showMessage('loginMessage', 'Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('loginMessage', data.message, 'success');
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    } else {
      showMessage('loginMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('loginMessage', 'Connection error. Please try again.', 'error');
  }
}

// ============================================
//  HELPERS
// ============================================
function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent  = message;
  el.className    = `message ${type} show`;
  if (type === 'error') {
    setTimeout(() => el.classList.remove('show'), 5000);
  }
}

// Enter key support
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#loginBox input').forEach(input => {
    input.addEventListener('keypress', e => { if (e.key === 'Enter') login(); });
  });
  document.querySelectorAll('#registerBox input').forEach(input => {
    input.addEventListener('keypress', e => { if (e.key === 'Enter') register(); });
  });
});
