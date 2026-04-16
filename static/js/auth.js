/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Authentication Module
   Login, Register, and Session Management
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    // Tab switching
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('loginForm').classList.add('active');
    });

    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

    // Skip login (guest mode)
    document.getElementById('skipLogin')?.addEventListener('click', handleGuestLogin);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

async function handleLogin(e) {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.classList.remove('show');

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        showAuthError(errorEl, 'Please fill in all fields');
        return;
    }

    try {
        const resp = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await resp.json();

        if (resp.ok) {
            AppState.currentUser = data.user;
            AppState.isGuest = false;
            showApp(data.user);
            showToast(`Welcome back, ${data.user.fullname}!`, 'success');
        } else {
            showAuthError(errorEl, data.error || 'Login failed');
        }
    } catch (err) {
        showAuthError(errorEl, 'Connection error. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const errorEl = document.getElementById('registerError');
    errorEl.classList.remove('show');

    const fullname = document.getElementById('regFullname').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!fullname || !username || !password) {
        showAuthError(errorEl, 'Please fill in all fields');
        return;
    }

    if (password.length < 4) {
        showAuthError(errorEl, 'Password must be at least 4 characters');
        return;
    }

    try {
        const resp = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, username, password })
        });

        const data = await resp.json();

        if (resp.ok) {
            AppState.currentUser = data.user;
            AppState.isGuest = false;
            showApp(data.user);
            showToast(`Welcome, ${data.user.fullname}! Account created.`, 'success');
        } else {
            showAuthError(errorEl, data.error || 'Registration failed');
        }
    } catch (err) {
        showAuthError(errorEl, 'Connection error. Please try again.');
    }
}

function handleGuestLogin() {
    AppState.isGuest = true;
    AppState.currentUser = { username: 'guest', fullname: 'Guest Traveler' };
    showApp({ fullname: 'Guest Traveler' });
    showToast('Welcome! You\'re browsing as a guest.', 'info');
}

async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
        // Ignore errors
    }

    AppState.currentUser = null;
    AppState.isGuest = false;

    // Show auth overlay again
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authOverlay').classList.remove('hidden');

    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');

    showToast('Logged out successfully', 'info');
}

function showAuthError(el, message) {
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
}
