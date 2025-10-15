const authToken = localStorage.getItem('authToken')

function checkAuthStatus() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const addBtn = document.getElementById('addBtn');
    const usersBtn = document.getElementById('usersBtn');

    if (authToken) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        addBtn.classList.remove('hidden');
        usersBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        addBtn.classList.add('hidden');
        usersBtn.classList.add('hidden');
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch('/users/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }
        const user = await response.json();
        document.getElementById('currentUsername').textContent = user.username;
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        document.getElementById('currentUsername').textContent = 'Unknown User';
    }
}

fetchCurrentUser();
checkAuthStatus();

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

async function handleLogout() {
    localStorage.removeItem("authToken");
    window.location.href='/pages/auth';
}

function toggleMenu() {
    const navButtons = document.getElementById('navButtons');
    navButtons.classList.toggle('show');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const navButtons = document.getElementById('navButtons');
    const menuToggle = document.querySelector('.menu-toggle');

    if (!event.target.closest('.nav-buttons') && !event.target.closest('.menu-toggle')) {
        navButtons.classList.remove('show');
    }
});