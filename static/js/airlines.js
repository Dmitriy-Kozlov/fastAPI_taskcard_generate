let airlines = [];
let aircraftTypes = [];
let aircrafts = [];
const token = localStorage.getItem('authToken');
const aircraftTableBody = document.getElementById('aircraftsTableBody');

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
                await loadSelects();
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
        await loadSelects();
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

       if (button.dataset.tab === 'tab3') {
            aircraftTableBody.innerHTML = '<tr><td colspan="3">Выберите авиакомпанию</td></tr>';
            airlineSelect.value = '';
        }
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

//document.addEventListener('DOMContentLoaded', async () => {
    const airlineSelect = document.getElementById('airlineSelect');
    const newAirlineSelect = document.getElementById('newAirlineSelect');
    const aircraftTypeSelect = document.getElementById('aircraftTypeSelect');
    const tableBody = document.getElementById('aircraftsTableBody');
    const templateInfo = document.getElementById('templateInfo');
    const modal = document.getElementById('addModal');
    const addAircraftBtn = document.getElementById('addAircraftBtn');
    const closeModal = document.getElementById('closeModal');
    const addAircraftForm = document.getElementById('addAircraftForm');

//    let airlines = [];

    // Загружаем авиакомпании и типы ВС
    async function loadSelects() {
        try {
            const [airlineRes, typeRes] = await Promise.all([
                fetch('/fleet/airlines/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },}),
                fetch('/fleet/aircraft_type/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },})
            ]);

            airlines = await airlineRes.json();
            const types = await typeRes.json();

            [airlineSelect, newAirlineSelect].forEach(select => {
                select.innerHTML = '<option value="">-- Выберите --</option>';
                airlines.forEach(airline => {
                    const opt = document.createElement('option');
                    opt.value = airline.id;
                    opt.textContent = airline.airline;
                    select.appendChild(opt);
                });
            });

            aircraftTypeSelect.innerHTML = '<option value="">-- Выберите тип --</option>';
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.aircraft_type;
                aircraftTypeSelect.appendChild(opt);
            });
        } catch (err) {
            console.error('Ошибка загрузки справочников:', err);
        }
    }

    loadSelects();

    // При выборе авиакомпании — загрузить список ВС
    airlineSelect.addEventListener('change', async () => {
        const id = airlineSelect.value;
        tableBody.innerHTML = '';
        templateInfo.style.display = 'none';

        if (!id) {
            tableBody.innerHTML = `<tr><td colspan="3">Выберите авиакомпанию</td></tr>`;
            return;
        }

        try {
            const response = await fetch(`/fleet/airlines/${id}`,{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },});
            if (!response.ok) throw new Error('Ошибка запроса');
            const data = await response.json();

            // Выводим самолёты
            if (data.aircrafts && data.aircrafts.length > 0) {
                data.aircrafts.forEach(ac => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ac.registration_no}</td>
                        <td>${ac.aircraft_type.aircraft_type}</td>
                        <td><button class="btn-delete" onclick="deleteAircraft(${ac.id}, ${id})">Удалить</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="3">Нет самолётов</td></tr>`;
            }

            if (data.template) {
                templateInfo.innerHTML = `<strong>Шаблон:</strong> ${data.template.filename || 'Без имени'}`;
                templateInfo.style.display = 'block';
            }
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            tableBody.innerHTML = `<tr><td colspan="3">Ошибка загрузки</td></tr>`;
        }
    });

    // --- Модалка добавления ---
    addAircraftBtn.onclick = () => (modal.style.display = 'flex');
    closeModal.onclick = () => (modal.style.display = 'none');
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

    // --- Добавление самолёта ---
    addAircraftForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const airline_id = newAirlineSelect.value;
        const aircraft_type_id = aircraftTypeSelect.value;
        const registration_no = document.getElementById('registrationNo').value.trim();
        console.log(
        JSON.stringify({
                  "registration_no": registration_no,
                  "airline_id": airline_id,
                  "aircraft_type_id": aircraft_type_id
                 })
        )
        if (!airline_id || !aircraft_type_id || !registration_no) {
            alert('Заполните все поля');
            return;
        }

        try {
            const response = await fetch('/fleet/aircraft/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                  "registration_no": registration_no,
                  "airline_id": airline_id,
                  "aircraft_type_id": aircraft_type_id
                 })
            });

            if (response.ok) {
                showToast('Aircraft created successfully');
                modal.style.display = 'none';
                addAircraftForm.reset();
                if (airlineSelect.value === airline_id) airlineSelect.dispatchEvent(new Event('change'));
            } else {
                const err = await response.json();
                showToast(`Failed to create aircraft ${err.detail || response.statusText}`);
//                alert('Ошибка: ' + (err.detail || response.statusText));
            }
        } catch (err) {
            console.error('Ошибка добавления:', err);
        }
    });
//});

// --- Удаление самолёта (глобальная функция) ---
async function deleteAircraft(id, airline_id) {
    if (!confirm('Удалить самолёт?')) return;
    try {
        const res = await fetch(`/fleet/aircraft/${id}/delete`,
        { method: 'DELETE',
         headers: {'Authorization': `Bearer ${authToken}` }});
        if (res.ok) {
            showToast('Aircraft successfully deleted');
            document.getElementById('airlineSelect').dispatchEvent(new Event('change'));
        } else {
            const err = await res.json();
            showToast(`Failed to delete aircraft ${err.detail || res.statusText}`);
//            alert('Ошибка: ' + (err.detail || res.statusText));
        }
    } catch (err) {
        console.error('Ошибка удаления:', err);
    }
}



fetchAirlines();
fetchAircraftTypes();