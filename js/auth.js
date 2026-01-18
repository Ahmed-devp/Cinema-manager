// Check if user is logged in (only on protected pages)
if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('pages/')) {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
  }
}

// Login function
function login(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('loginForm');
  const username = form ? form.username.value : document.getElementById('username').value;
  const password = form ? form.password.value : document.getElementById('password').value;
  
  if (username === 'admin' && password === 'admin') {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('username', username);
    window.location.href = 'dashboard.html';
  } else {
    alert(currentLang === 'fr' ? 'Identifiants incorrects!' : 
          currentLang === 'en' ? 'Incorrect credentials!' : 
          'بيانات الدخول غير صحيحة!');
  }
}

// Logout function
function logout() {
  sessionStorage.removeItem('isLoggedIn');
  sessionStorage.removeItem('username');
  window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
}

// Attach login handler if form exists
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }
});