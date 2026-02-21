// Show/Hide forms with animation
function showLogin() {
  const loginBox = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  
  registerBox.classList.add('hidden');
  setTimeout(() => {
    loginBox.classList.remove('hidden');
  }, 50);
  clearMessages();
}

function showRegister() {
  const loginBox = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  
  loginBox.classList.add('hidden');
  setTimeout(() => {
    registerBox.classList.remove('hidden');
  }, 50);
  clearMessages();
}

function clearMessages() {
  document.getElementById('loginMessage').className = 'message';
  document.getElementById('regMessage').className = 'message';
}

// REGISTER function
async function register() {
  const fullName = document.getElementById('regFullName').value.trim();
  const studentId = document.getElementById('regStudentId').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;

  // Client-side validation
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: fullName,
        student_id: studentId,
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('regMessage', data.message, 'success');
      // Clear form
      document.getElementById('regFullName').value = '';
      document.getElementById('regStudentId').value = '';
      document.getElementById('regUsername').value = '';
      document.getElementById('regPassword').value = '';
      
      // Switch to login after 2 seconds
      setTimeout(() => showLogin(), 2000);
    } else {
      showMessage('regMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('regMessage', 'Connection error. Please try again.', 'error');
  }
}

// LOGIN function
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Client-side validation
  if (!username || !password) {
    showMessage('loginMessage', 'Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch('auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage('loginMessage', data.message, 'success');
      
      // Store user data in session storage
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showMessage('loginMessage', data.message, 'error');
    }
  } catch (error) {
    showMessage('loginMessage', 'Connection error. Please try again.', 'error');
  }
}

// Helper function to show messages
function showMessage(elementId, message, type) {
  const msgElement = document.getElementById(elementId);
  msgElement.textContent = message;
  msgElement.className = `message ${type} show`;
  
  // Auto-hide error messages after 5 seconds
  if (type === 'error') {
    setTimeout(() => {
      msgElement.classList.remove('show');
    }, 5000);
  }
}

// Allow Enter key to submit forms
document.addEventListener('DOMContentLoaded', function() {
  // Login form
  const loginInputs = document.querySelectorAll('#loginBox input');
  loginInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  });

  // Register form
  const regInputs = document.querySelectorAll('#registerBox input');
  regInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        register();
      }
    });
  });
});