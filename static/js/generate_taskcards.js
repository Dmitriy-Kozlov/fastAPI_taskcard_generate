let airlines = [];
let aircraftTypes = [];
let aircrafts = [];
const token = localStorage.getItem('authToken');
const airlineSelect = document.getElementById('airlineSelect');
const aircraftSelect = document.getElementById('aircraftSelect');
const generateTaskcardsForm = document.getElementById('generateTaskcardsForm');

const resultsTableBody = document.getElementById('resultsTableBody');


async function loadSelects() {
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

        airlineSelect.innerHTML = '<option value="">-- Select airline--</option>';
            airlines.forEach(airline => {
                const opt = document.createElement('option');
                opt.value = airline.id;
                opt.textContent = airline.airline;
                airlineSelect.appendChild(opt);
            });
    } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
    }
}

loadSelects();

// При выборе авиакомпании — загрузить список ВС
airlineSelect.addEventListener('change', async () => {
    const id = airlineSelect.value;
    aircraftSelect.innerHTML = '';

    if (!id) {
        aircraftSelect.innerHTML = `<option value="">-- Select aircraft--</option>`;
        return;
    }

    try {
        const response = await fetch(`/fleet/airlines/${id}`,{
                    headers: {
                    'Authorization': `Bearer ${authToken}`
                },});
        if (!response.ok) throw new Error('Ошибка запроса');
        const data = await response.json();
            console.log(data)

        // Выводим самолёты
        if (data.aircrafts && data.aircrafts.length > 0) {
            aircraftSelect.innerHTML = '<option value="">-- Select aircraft--</option>';
        data.aircrafts.forEach(aircraft => {
            const opt = document.createElement('option');
            opt.value = aircraft.id;
            opt.textContent = aircraft.registration_no;
            aircraftSelect.appendChild(opt);
        });
        }
        if (data.aircrafts && data.aircrafts.length === 0) {
            aircraftSelect.innerHTML = '<option value="">No aircrafts found</option>';
        }

    } catch (err) {
    console.error('Ошибка загрузки справочников:', err);
    }
});

generateTaskcardsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const airline_id = airlineSelect.value;
        const aircraft_registration = aircraftSelect.selectedOptions[0].text;
        console.log(aircraft_registration)
        const taskcardInput = document.getElementById('taskcardList').value.trim();
        const taskcard_list = taskcardInput
          .split(',')
          .map(item => item.trim())
          .map(item => item.replace(/['"]/g, ''))
          .filter(item => item.length > 0);

        if (!airline_id || !aircraft_registration || !taskcard_list) {
            alert('All fields required!');
            return;
        }
            resultsTableBody.innerHTML = '';
            const generateBtn = document.getElementById('generateBtn');

        try {
            generateBtn.disabled = true;
             generateBtn.textContent = 'Processing...';

            const response = await fetch('/generate-taskcards_new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                  "taskcards": taskcard_list,
                  "registration": aircraft_registration,
                  "airline": airline_id
                 })
            });


                if (response.ok) {
                showToast('Taskcards generated successfully');
                generateTaskcardsForm.reset();

                const data = await response.json();

                    if (data["created taskcards"] && data["created taskcards"].length > 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><span class="status-badge status-enabled">Created</span></td>
                            <td>${data["created taskcards"].join(', ')}</td>
                            <td>${data["created taskcards"].length}</td>
                        `;
                        resultsTableBody.appendChild(row);
                    }

                    if (data["no taskcard found"] && data["no taskcard found"].length > 0) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><span class="status-badge status-disabled">Not Found</span></td>
                            <td>${data["no taskcard found"].join(', ')}</td>
                            <td>${data["no taskcard found"].length}</td>
                        `;
                        resultsTableBody.appendChild(row);
                    }

                   if (data["download_url"]) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td colspan="2" style="text-align:center;">
                            <button id="downloadZipBtn" class="btn-primary">⬇️ Скачать ZIP-файл</button>
                        </td>
                    `;
                    resultsTableBody.appendChild(row);




                    const downloadBtn = document.getElementById('downloadZipBtn');
                    downloadBtn.addEventListener('click', async () => {
                        try {
                            downloadBtn.disabled = true;
                            downloadBtn.textContent = 'Download...';

                            const response = await fetch(data["download_url"], {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`
                                }
                            });

                            if (!response.ok) {
                                throw new Error(`Ошибка при загрузке файла: ${response.status}`);
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'taskcards.zip';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);

                            downloadBtn.textContent = '✅ Downloaded';
                        } catch (err) {
                            console.error(err);
                            alert(`Ошибка: ${err.message}`);
                            downloadBtn.textContent = 'Error';
                        } finally {
                            downloadBtn.disabled = false;
                        }
                    });



            } else {
                const err = await response.json();
                showToast(`Failed to generate taskcards: ${err.detail || response.statusText}`);
//                alert('Ошибка: ' + (err.detail || response.statusText));
            }

    };
    }  catch (err) {
                                console.error(err);
                                alert(`Ошибка: ${err.message}`);
                            }   finally {
                                     generateBtn.disabled = false;
                                        generateBtn.textContent = 'Generate';
                             }
                                });