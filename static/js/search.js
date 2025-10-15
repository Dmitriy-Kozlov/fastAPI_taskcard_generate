function isUserAuthorized() {
    return !!localStorage.getItem('authToken');
}

// Populate years
const yearSelect = document.getElementById('year');
const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= currentYear - 100; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}


// Function to create result card
function createResultCard(film) {
    const deleteButton = isUserAuthorized()
        ? `<button class="btn-delete" onclick="deleteFilm(${film.id})">Delete</button>`
        : '';
    return `
        <div class="result-card" data-id="${film.id}">
            <div class="card-content">
                <h3 class="card-title">${film.title}</h3>
                <p class="card-info"><strong>Owner:</strong> ${film.owner}</p>
                <p class="card-info"><strong>Date:</strong> ${film.month}/${film.year}</p>
                <div class="card-actions">
                    <button class="btn-download" onclick="downloadFilm(${film.id})">Download</button>
                    ${deleteButton}
                </div>
            </div>
        </div>
    `;
}

// Function to handle film download
async function downloadFilm(id) {
    try {
        const response = await fetch(`/presentations/download?id=${id}`);
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'presentation.ppt';  // Имя по умолчанию
        console.log(contentDisposition)
  if (contentDisposition) {
            // Проверяем формат filename*=utf-8''
            let filenameRegex = /filename\*=utf-8''(.+)/;
            let matches = filenameRegex.exec(contentDisposition);

            if (matches && matches[1]) {
                // Декодируем URL-кодированное имя файла
                filename = decodeURIComponent(matches[1]);
            } else {
                // Если filename без кодировки, используем старый формат
                filenameRegex = /filename="(.+)"/;
                matches = filenameRegex.exec(contentDisposition);
                if (matches && matches[1]) {
                    filename = matches[1];
                }
            }
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // или другое расширение в зависимости от типа файла
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Download started successfully');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download the film');
    }
}

// Function to handle film deletion
async function deleteFilm(id) {
    if (!confirm('Are you sure you want to delete this film?')) return;
    const authToken = localStorage.getItem('authToken')

    try {
        const response = await fetch(`/presentations/${id}/delete`, {
            method: 'DELETE',
            headers: {
            'Authorization': `Bearer ${authToken}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`${errorData.detail}`);
        }

        // Remove the card from UI
        const card = document.querySelector(`.result-card[data-id="${id}"]`);
        if (card) {
            card.remove();
        }

        showToast('Presentation deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast(`Failed to delete the Presentation ${error}`);
    }
}


// Function to show loading state
function showLoading(show) {
    document.querySelector('.loading').style.display = show ? 'block' : 'none';
}

// Function to show no results message
function showNoResults() {
    document.getElementById('results').innerHTML = `
        <div class="no-results">
            <p>No results found. Please try different search criteria.</p>
        </div>
    `;
}

// Handle form submission
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        owner: document.getElementById('owner').value || null,
        title: document.getElementById('title').value || null,
        month: document.getElementById('month').value || null,
        year: document.getElementById('year').value || null
    };
    showLoading(true);
    document.getElementById('results').innerHTML = '';

    fetch('/presentations/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);

        if (data.length === 0) {
            showNoResults();
            return;
        }

        const resultsHTML = data
            .map(film => createResultCard(film))
            .join('');

        document.getElementById('results').innerHTML = resultsHTML;
    })
    .catch(error => {
        console.error('Error:', error);
        showLoading(false);
        document.getElementById('results').innerHTML = `
            <div class="no-results">
                <p>An error occurred while fetching results. Please try again.</p>
            </div>
        `;
    });
});


// Debounce function for search optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-search as user types (with debounce)
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
        document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    }, 500));
});
