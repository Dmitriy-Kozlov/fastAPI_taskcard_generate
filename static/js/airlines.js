let airlines = [];
let aircraftTypes = [];
let aircrafts = [];
let templates = [];
let afiles = [];
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

                if (!response.ok) {
                const err = await response.json();
                showToast(`Failed to create airline ${err.detail || response.statusText}`);
                return;
                }

                showToast('Airline created successfully');
                form.reset();
                await fetchAirlines();
                await loadSelects();
                await loadRefs();
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
                const err = await response.json();
                showToast(`Failed to delete airline ${err.detail || response.statusText}`);
                return;
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

                if (!response.ok) {
                    const err = await response.json();
                    showToast(`Failed to create aircraft type ${err.detail || response.statusText}`);
                    return;
                }

                showToast('Aircraft type created successfully');
                aircraftTypesForm.reset();
                await fetchAircraftTypes();
                await loadSelects();
                await loadRefs();
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
            aircraftTableBody.innerHTML = '<tr><td colspan="3">Select airline</td></tr>';
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
                const err = await response.json();
                showToast(`Failed to delete aircraft type ${err.detail || response.statusText}`);
                return;
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
    const remakeAircraftTypeSelect = document.getElementById('remakeAircraftTypeSelect');
    const tableBody = document.getElementById('aircraftsTableBody');
    const templateInfo = document.getElementById('templateInfo');
    const modal = document.getElementById('addModal');
    const remakeFileModal = document.getElementById('remakeFileModal');
    const addAircraftBtn = document.getElementById('addAircraftBtn');
    const closeModal = document.getElementById('closeModal');
    const remakeFilesBtn = document.getElementById('remakeFilesBtn');
    const closeRemakeFilesModal = document.getElementById('closeRemakeFilesModal');
    const addAircraftForm = document.getElementById('addAircraftForm');
    const remakeFileForm = document.getElementById('remakeFileForm');

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
                select.innerHTML = '<option value="">-- Select --</option>';
                airlines.forEach(airline => {
                    const opt = document.createElement('option');
                    opt.value = airline.id;
                    opt.textContent = airline.airline;
                    select.appendChild(opt);
                });
            });

            aircraftTypeSelect.innerHTML = '<option value="">-- Select type --</option>';
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
            tableBody.innerHTML = `<tr><td colspan="3">Select airline</td></tr>`;
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
                        <td><button class="btn-delete" onclick="deleteAircraft(${ac.id}, ${id})">Delete</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="3">No aircrafts found</td></tr>`;
            }

            if (data.template) {
                templateInfo.innerHTML = `<strong>Template:</strong> ${data.template.filename || 'Noname'}`;
                templateInfo.style.display = 'block';
            }
        } catch (err) {
            console.error('Ошибка при получении данных:', err);
            tableBody.innerHTML = `<tr><td colspan="3">Download error</td></tr>`;
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
    if (!confirm('Delete aircraft?')) return;
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

    const airbusFilesBody = document.getElementById('airbusFilesBody');
    const airbusForm = document.getElementById('airbusUploadForm');
    const airbusFileUploadBtn = document.getElementById('airbusFileUploadBtn');
    const filesAircraftTypeSelect = document.getElementById('filesAircraftTypeSelect');

    const templatesBody = document.getElementById('templatesBody');
    const templateForm = document.getElementById('templateUploadForm');
    const filesAirlineSelect = document.getElementById('filesAirlineSelect');

    const popup = document.getElementById('popup');

    // --- Уведомления ---
    function showPopup(msg, color = '#0073e6') {
        popup.textContent = msg;
        popup.style.background = color;
        popup.style.display = 'block';
        setTimeout(() => popup.style.display = 'none', 3000);
    }

    // --- Загрузка Airbus файлов ---
    async function loadAirbusFiles() {
        const response = await fetch('/airbus_files/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },});
        afiles = await response.json();
        airbusFilesBody.innerHTML = '';
        if (!afiles.length) {
            airbusFilesBody.innerHTML = '<tr><td colspan="5">No data</td></tr>';
            return;
        }
        afiles.sort((a, b) => a.id - b.id);
        afiles.forEach(f => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${f.id}</td>
                <td>${f.document_type}</td>
                <td>${f.aircraft_type.aircraft_type}</td>
                <td>${f.revision_no}</td>
                <td>
                    <span class="status-badge ${f.active ? 'status-enabled' : 'status-disabled'}">
                        ${f.active ? 'Active' : 'Disabled'}
                    </span>
                </td>
                <td>
                <button class="btn-edit" onclick="openEditFileModal(${f.id})">Edit</button>
                <button class="btn-delete" onclick="deleteFile(${f.id})">Delete</button>
                </td>
                `;
            airbusFilesBody.appendChild(row);
        });
    }

    // --- Загрузка шаблонов ---
    async function loadTemplates() {
        const response = await fetch('/airbus_files/templates/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },});
        templates = await response.json();

        templatesBody.innerHTML = '';
        if (!templates.length) {
            templatesBody.innerHTML = '<tr><td colspan="4">Нет данных</td></tr>';
            return;
        }

        templates.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.id}</td>
                <td>${t.airline.airline}</td>
                <td>${t.title}</td>
                <td>
                    <span class="status-badge ${t.active ? 'status-enabled' : 'status-disabled'}">
                        ${t.active ? 'Active' : 'Disabled'}
                    </span>
                </td>
                <td>
                <button class="btn-edit" onclick="openEditTemplateModal(${t.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTemplate(${t.id})">Delete</button>
                </td>
            `;
            templatesBody.appendChild(row);
        });
    }

function openEditFileModal(fileId) {
const afile = afiles.find(f => f.id === fileId);
console.log(afile)
console.log(afiles)
if (!afile) return;
document.getElementById('documentEditType').value = afile.document_type;
document.getElementById('documentEditRevisionNo').value = afile.revision_no;
document.getElementById('documentEditStatus').checked = afile.active;
document.getElementById('fileId').value = afile.id;
document.getElementById('fileAircraftType').value = afile.aircraft_type_id;

document.getElementById('editFileModal').style.display = 'flex';
}

function closeFileModal() {
    document.getElementById('editFileModal').style.display = 'none';
}


function openRemakeFileModal() {
remakeAircraftTypeSelect.innerHTML = '<option value="">-- Select type --</option>';
            aircraftTypes.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.aircraft_type;
                remakeAircraftTypeSelect.appendChild(opt);
            })
document.getElementById('remakeFileModal').style.display = 'flex';
}

function closeRemakeFileModal() {
    document.getElementById('remakeFileModal').style.display = 'none';
}

//remakeFileForm.addEventListener('submit', async (e) => {
//        e.preventDefault();
//        const atype = parseInt(document.getElementById('remakeAircraftTypeSelect').value);
//        const remakeBtn = document.getElementById('remakeBtn');
//        try {
//            remakeBtn.disabled = true;
//             remakeBtn.textContent = 'Processing...';
//            const response = await fetch(`/airbus_files/remake_files?atype=${atype}`, {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
//            });
//
//            if (response.ok) {
//                showToast('Remake files successfully');
//                remakeFileModal.style.display = 'none';
//                remakeFileForm.reset();
//            } else {
//                const err = await response.json();
//                showToast(`Failed to remake files ${err.detail || response.statusText}`);
//            }
//        } catch (err) {
//            console.error('Failed to remake files:', err);
//        } finally {
//        // скрыть спинер
//        remakeBtn.disabled = false;
//         remakeBtn.textContent = 'Remake files';
//    }});





remakeFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const atype = parseInt(document.getElementById('remakeAircraftTypeSelect').value);
        const remakeBtn = document.getElementById('remakeBtn');
        try {
            remakeBtn.disabled = true;
             remakeBtn.textContent = 'Processing...';
            const response = await fetch(`/airbus_files/remake_files?atype=${atype}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            });

//            const {task_id} = await response.json();
//            pollStatus(task_id)

            if (response.ok) {
                showToast('Remake files in progress...');
                remakeFileModal.style.display = 'none';
                remakeFileForm.reset();
                const {task_id} = await response.json();
                pollStatus(task_id)
            } else {
                const err = await response.json();
                showToast(`Failed to remake files ${err.detail || response.statusText}`);
            }
        } catch (err) {
            console.error('Failed to remake files:', err);
        } finally {
        // скрыть спинер
        remakeBtn.disabled = false;
         remakeBtn.textContent = 'Remake files';
    }});

async function pollStatus(task_id) {
  const interval = setInterval(async () => {
    const res = await fetch(`/airbus_files/task_status/${task_id}/status`, {
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                        },});

    const data = await res.json();
    if (data.state === "PROGRESS") {
      console.log(`Step: ${data.meta.step} (${data.meta.percent}%)`);
//      updateProgressBar(data.meta.percent);
    }
    if (data.state === "SUCCESS") {
      clearInterval(interval);
//      updateProgressBar(100);
//      alert("✅ Task completed successfully!");
        showToast('Remake files successfully');
    }
    if (data.state === "FAILURE") {
      clearInterval(interval);
      alert("❌ Task failed: " + data.meta);
    }
  }, 3000);
}


function openEditTemplateModal(templateId) {
const template = templates.find(t => t.id === templateId);
console.log(template)
console.log(templates)
if (!template) return;
document.getElementById('templateId').value = template.id;
document.getElementById('templateAirlineId').value = template.airline_id;
document.getElementById('templateEditTitle').value = template.title;
document.getElementById('templateEditStatus').checked = template.active;

document.getElementById('editTemplateModal').style.display = 'flex';
}

function closeTemplateModal() {
    document.getElementById('editTemplateModal').style.display = 'none';
}



    // --- Загрузка справочников ---
    async function loadRefs() {
        const [typesRes, airlinesRes] = await Promise.all([
            fetch('/fleet/aircraft_type/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },}),
            fetch('/fleet/airlines/all',{
                        headers: {
                        'Authorization': `Bearer ${authToken}`
                    },})
        ]);

        const [types, airlines] = await Promise.all([typesRes.json(), airlinesRes.json()]);
        // Типы ВС
        filesAircraftTypeSelect.innerHTML = '<option value="">Aircraft type</option>';
        types.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.aircraft_type;
            filesAircraftTypeSelect.appendChild(option);
        });

        // Авиакомпании
        filesAirlineSelect.innerHTML = '<option value="">Airline</option>';
        airlines.forEach(a => {
            const option = document.createElement('option');
            option.value = a.id;
            option.textContent = a.airline;
            filesAirlineSelect.appendChild(option);
        });
    }

    // --- Добавление Airbus файла ---
    airbusForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('document_type', document.getElementById('documentType').value);
        formData.append('aircraft_type_id', filesAircraftTypeSelect.value);
        formData.append('revision_no', document.getElementById('revisionNo').value);
        formData.append('file', document.getElementById('airbusFile').files[0]);
        airbusFileUploadBtn.disabled = true;
        airbusFileUploadBtn.textContent = 'Processing...';
        const res = await fetch('/airbus_files/add', {
            method: 'POST',
            headers: {'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (res.ok) {
            showToast('Airbus file is added');
            airbusForm.reset();
            loadAirbusFiles();
            airbusFileUploadBtn.disabled = false;
            airbusFileUploadBtn.textContent = 'Upload file';
        } else {
            const err = await res.json();
            showToast(`Airbus file add error: ${err.detail || res.statusText}`);
        }
    });

    // --- Добавление шаблона ---
    templateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('airline_id', filesAirlineSelect.value);
        formData.append('title', document.getElementById('templateTitle').value);
        formData.append('file', document.getElementById('templateFile').files[0]);

        const res = await fetch('/airbus_files/templates/add', {
            headers: {'Authorization': `Bearer ${authToken}` },
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            showToast('Template is added');
            templateForm.reset();
            loadTemplates();
        } else {
            const err = await res.json();
            showToast(`Template add error: ${err.detail || res.statusText}`);
        }
    });


document.getElementById('editFileForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fileId = document.getElementById('fileId').value;
    const fileData = {
        document_type: document.getElementById('documentEditType').value,
        aircraft_type_id: document.getElementById('fileAircraftType').value,
        revision_no: document.getElementById('documentEditRevisionNo').value,
        active: document.getElementById('documentEditStatus').checked,
    };

    try {
        const response = await fetch(`/airbus_files/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                id: fileId,
                ...fileData
            })
        });

        if (!response.ok) {
            const err = await response.json();
            showToast(`Edit file error: ${err.detail || response.statusText}`);
            return;
        }

        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href='/pages/auth';
        }

        await loadAirbusFiles();
        closeFileModal();
        showToast('File updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        showToast(`Failed to update file. ${error}`);
    }
});


async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const response = await fetch(`/airbus_files/${fileId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            showToast(`File deleting ferror: ${err.detail || response.statusText}`);
            return;
        }

        await loadAirbusFiles(); // Refresh the table
        showToast('File deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete file');
    }
}



document.getElementById('editTemplateForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const templateId = document.getElementById('templateId').value;
    const templateData = {
        airline_id: document.getElementById('templateAirlineId').value,
        title: document.getElementById('templateEditTitle').value,
        active: document.getElementById('templateEditStatus').checked,
    };

    try {
        const response = await fetch(`/airbus_files/templates/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                id: templateId,
                ...templateData
            })
        });

        if (!response.ok) {
            const err = await response.json();
            showToast(`Edit template error: ${err.detail || response.statusText}`);
            return;
        }
        if (response.status === 401) {
            localStorage.removeItem("authToken");
            window.location.href='/pages/auth';
        }

        await loadTemplates();
        closeTemplateModal();
        showToast('Template updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        showToast(`Failed to update tempalte. ${error}`);
    }
});


async function deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) {
        return;
    }

    try {
        const response = await fetch(`/airbus_files/templates/${templateId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            showToast(`Template deleting error: ${err.detail || response.statusText}`);
            return;
        }

        await loadTemplates(); // Refresh the table
        showToast('Template deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete template');
    }
}



    // --- Первичная загрузка ---
    loadRefs();
    loadAirbusFiles();
    loadTemplates();



fetchAirlines();
fetchAircraftTypes();