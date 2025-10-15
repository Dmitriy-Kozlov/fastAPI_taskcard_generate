
let users = [];

async function fetchUsers() {
    try {
        const response = await fetch('/users/all',{
            headers: {
            'Authorization': `Bearer ${authToken}`
        },
        });
       if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href='/pages/auth';
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errorData.detail}`);
        }

        users = await response.json();
        console.log(users)
        populateTable();
    } catch (error) {
        console.error('Fetch error:', error);
        showToast(`Failed to load users ${error}`);
    }
}

function populateTable() {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.full_name}</td>
            <td>
                <span class="status-badge ${user.disabled ? 'status-disabled' : 'status-enabled'}">
                    ${user.disabled ? 'Disabled' : 'Active'}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.is_admin ? 'status-enabled' : 'status-placeholder'}">
                  ${user.is_admin ? 'Admin' : ''}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="openEditModal(${user.id})">Edit</button>
                <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openEditModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email;
    document.getElementById('fullName').value = user.full_name;
    document.getElementById('disabled').checked = user.disabled;
    document.getElementById('is_admin').checked = user.is_admin;

    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}


document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        full_name: document.getElementById('fullName').value,
        disabled: document.getElementById('disabled').checked,
        is_admin: document.getElementById('is_admin').checked
    };

    try {
        const response = await fetch(`/users/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                id: userId,
                ...userData
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(response.status)
            throw new Error(`${errorData.detail}`);
        }
        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href='/pages/auth';
        }

        await fetchUsers();
        closeModal();
        showToast('User updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        showToast(`Failed to update user. ${error}`);
    }
});

fetchUsers();

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
}


async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`/users/${userId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        await fetchUsers(); // Refresh the table
        showToast('User deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete user');
    }
}
