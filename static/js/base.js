const authToken = localStorage.getItem('authToken')
let is_admin;

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid JWT:", e);
        return null;
    }
}


function checkAuthStatus() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
//    const addBtn = document.getElementById('addBtn');
    const generateTaskBtn = document.getElementById('generateTaskBtn');
    const usersBtn = document.getElementById('usersBtn');
    const airlinesBtn = document.getElementById('airlinesBtn');

    if (authToken) {
                loginBtn.classList.add('hidden');
                generateTaskBtn.classList.remove('hidden');
                logoutBtn.classList.remove('hidden');
            const decoded = parseJwt(authToken);
            if (decoded && decoded.is_admin) {
            //        addBtn.classList.remove('hidden');
                    usersBtn.classList.remove('hidden');
                    airlinesBtn.classList.remove('hidden');
            } else {

            //        addBtn.classList.add('hidden');
                    usersBtn.classList.add('hidden');
                    airlinesBtn.classList.add('hidden');
    }} else {
                    usersBtn.classList.add('hidden');
                    airlinesBtn.classList.add('hidden');
                    generateTaskBtn.classList.add('hidden');
                    loginBtn.classList.remove('hidden');
                    logoutBtn.classList.add('hidden');
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
        is_admin = user.is_admin;
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