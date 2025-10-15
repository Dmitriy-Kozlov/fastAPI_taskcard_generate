let airlines = [];
const token = localStorage.getItem('authToken');
const formEl = document.getElementById('airlineForm');

//const form = document.createElement('form');
//form.id = 'airlineForm';
//form.innerHTML = `
//  <input type="text" id="airlineName" placeholder="Airline name" required>
//  <button type="submit">Add Airline</button>
//`;

async function fetchAirlines() {
    try {
        const response = await fetch('/fleet/airlines/all',{
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

        airlines = await response.json();
        airlinesTable();
    } catch (error) {
        console.error('Fetch error:', error);
        showToast(`Failed to load airlines ${error}`);
    }
}

function airlinesTable() {
    const tableBody = document.getElementById('airlinesTableBody');
    tableBody.innerHTML = '';

    airlines.forEach(airline => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${airline.id}</td>
            <td>${airline.airline}</td>
            <td>
                <button class="btn-delete" onclick="deleteAirline(${airline.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });


    const formRow = document.createElement('tr');
        formRow.innerHTML = `
            <td colspan="3">
                <form id="airlineForm">
                    <input type="text" id="airlineName" placeholder="Airline name" required>
                    <button type="submit">Add Airline</button>
                </form>
            </td>
        `;
        tableBody.appendChild(formRow);
        const form = document.getElementById('airlineForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('airlineName').value.trim();
            if (!name) return;

            try {
                const response = await fetch('/fleet/airlines/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ airline: name })
                });

                if (!response.ok) throw new Error('Failed to create airline');

                showToast('Airline created successfully');
                form.reset();
                await fetchAirlines();
            } catch (error) {
                showToast('Error creating airline', true);
                console.error(error);
            }
        });
}

//formEl.addEventListener('submit', async (e) => {
//    e.preventDefault();
//    const name = document.getElementById('airlineName').value.trim();
//    if (!name) return;
//
//    try {
//        const response = await fetch('/fleet/airlines/create', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${authToken}`
//            },
//            body: JSON.stringify({ airline: name })
//        });
//
//        if (!response.ok) throw new Error('Failed to create airline');
//
//        showToast('Airline created successfully');
//        formEl.reset();
//        await fetchAirlines();
//    } catch (error) {
//        showToast('Error creating airline', true);
//        console.error(error);
//    }
//});


fetchAirlines();


async function deleteAirline(airlineId) {
    if (!confirm('Are you sure you want to delete this airline?')) {
        return;
    }

    try {
        const response = await fetch(`/fleet/airlines/${airlineId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete airline');
        }

        await fetchAirlines(); // Refresh the table
        showToast('Airline deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete airline');
    }
}
