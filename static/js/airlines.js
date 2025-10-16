let airlines = [];
let aircraftTypes = [];
let aircrafts = [];
const token = localStorage.getItem('authToken');

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

async function fetchAircraftTypes() {
    try {
        const response = await fetch('/fleet/aircraft_type/all',{
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

        aircraftTypes = await response.json();
        aircraftTypesTable();
    } catch (error) {
        console.error('Fetch error:', error);
        showToast(`Failed to load aircraft types ${error}`);
    }
}

function aircraftTypesTable() {
    const aircraftTypesTableBody = document.getElementById('aircraftTypesTableBody');
    aircraftTypesTableBody.innerHTML = '';

    aircraftTypes.forEach(aircraftType => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${aircraftType.id}</td>
            <td>${aircraftType.aircraft_type}</td>
            <td>
                <button class="btn-delete" onclick="deleteAircraftType(${aircraftType.id})">Delete</button>
            </td>
        `;
        aircraftTypesTableBody.appendChild(row);
    });


    const aircraftTypesFormRow = document.createElement('tr');
        aircraftTypesFormRow.innerHTML = `
            <td colspan="3">
                <form id="aircraftTypesForm">
                    <input type="text" id="aircraftTypesName" placeholder="Aircraft Type" required>
                    <button type="submit">Add Aircraft Type</button>
                </form>
            </td>
        `;
        aircraftTypesTableBody.appendChild(aircraftTypesFormRow);
        const aircraftTypesForm = document.getElementById('aircraftTypesForm');
        aircraftTypesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('aircraftTypesName').value.trim();
            if (!name) return;

            try {
                const response = await fetch('/fleet/aircraft_type/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ aircraft_type: name })
                });

                if (!response.ok) throw new Error('Failed to create aircraft type');

                showToast('Aircraft type created successfully');
                aircraftTypesForm.reset();
                await fetchAircraftTypes();
            } catch (error) {
                showToast('Error creating aircraft type', true);
                console.error(error);
            }
        });
}



document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Убираем активность у всех
      buttons.forEach(btn => btn.classList.remove('active'));
      contents.forEach(content => content.classList.remove('active'));

      // Активируем нужную вкладку
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
});


async function deleteAircraftType(aircraftTypeId) {
    if (!confirm('Are you sure you want to delete this aircraft type?')) {
        return;
    }

    try {
        const response = await fetch(`/fleet/aircraft_type/${aircraftTypeId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete aircraft type');
        }

        await fetchAircraftTypes(); // Refresh the table
        showToast('Aircraft type deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete aircraft type');
    }
}


fetchAirlines();
fetchAircraftTypes();