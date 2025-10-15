

// Populate years
const yearSelect = document.getElementById('year');
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= currentYear - 100; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}


// Handle form submission
document.getElementById('addFilmForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const authToken = localStorage.getItem('authToken')
    try {
        const response = await fetch('/presentations/add', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
       if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href='/pages/auth';
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errorData.detail}`);
        }

        showToast('Presentation uploaded successfully');
        this.reset();
    } catch (error) {
        console.error('Upload error:', error);
        showToast(`Failed to upload the presentation. ${error}`);
    }
});
