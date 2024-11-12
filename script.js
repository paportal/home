// Define the base URL for Azure Functions
const FUNCTION_APP_URL = 'https://lonestar-core-services.azurewebsites.net/api';

// Initialize arrays to store medications
let medications = []; // For current medications to submit
let medicationHistory = []; // For previously submitted medications
let filteredMedicationHistory = []; // For filtered medication history
let currentPatient = null;

// Function to add a new medication
document.getElementById('add-medication').addEventListener('click', function () {
    // Get medication details from the form
    const medicationName = document.getElementById('medication-name').value.trim();
    const medicationClass = document.getElementById('medication-class').value.trim();
    const medicationStatus = document.getElementById('medication-status').value;
    const decisionBasis = document.getElementById('decision-basis').value;

    if (medicationName === '') {
        alert('Please enter the medication name.');
        return;
    }

    // Create a medication object
    const medication = {
        Name: medicationName,
        Class: medicationClass,
        Status: medicationStatus,
        DecisionBasis: decisionBasis,
        isEditing: false // Flag to indicate if the record is in edit mode
    };

    // Add medication to the array
    medications.push(medication);

    // Clear the medication form
    document.getElementById('medication-name').value = '';
    document.getElementById('medication-class').value = '';
    document.getElementById('medication-status').value = 'Approved';
    document.getElementById('decision-basis').value = 'PatientSpecific';

    // Update the medications list display
    updateMedicationsList();
});

// Function to update the medications list display
function updateMedicationsList() {
    const medicationsList = document.getElementById('medications-list');
    medicationsList.innerHTML = '';

    if (medications.length === 0) {
        medicationsList.innerHTML = '<p>No medications added yet.</p>';
        return;
    }

    // Create a table to display medications
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-striped');

    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Medication Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Decision Basis</th>
            <th>Actions</th>
        </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    medications.forEach((medication, index) => {
        const row = document.createElement('tr');

        if (medication.isEditing) {
            // Editable row
            row.innerHTML = `
                <td>
                    <input type="text" class="form-control" value="${medication.Name}" id="edit-name-${index}" required>
                    <div class="invalid-feedback">
                        Please enter the medication name.
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control" value="${medication.Class}" id="edit-class-${index}">
                </td>
                <td>
                    <select class="form-control" id="edit-status-${index}">
                        <option value="Approved" ${medication.Status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Denied" ${medication.Status === 'Denied' ? 'selected' : ''}>Denied</option>
                        <option value="Pending" ${medication.Status === 'Pending' ? 'selected' : ''}>Pending</option>
                    </select>
                </td>
                <td>
                    <select class="form-control" id="edit-decision-${index}">
                        <option value="PatientSpecific" ${medication.DecisionBasis === 'PatientSpecific' ? 'selected' : ''}>Patient Specific</option>
                        <option value="InsurancePolicy" ${medication.DecisionBasis === 'InsurancePolicy' ? 'selected' : ''}>Insurance Policy</option>
                        <option value="Other" ${medication.DecisionBasis === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-link save-medication" data-index="${index}">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="btn btn-sm btn-link cancel-edit" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            `;
        } else {
            // Read-only row
            row.innerHTML = `
                <td>${medication.Name}</td>
                <td>${medication.Class}</td>
                <td>${medication.Status}</td>
                <td>${medication.DecisionBasis}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-link edit-medication" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-link delete-medication" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    medicationsList.appendChild(table);

    // Add event listeners for action buttons
    document.querySelectorAll('.edit-medication').forEach(button => {
        button.addEventListener('click', enterEditMode);
    });
    document.querySelectorAll('.delete-medication').forEach(button => {
        button.addEventListener('click', deleteMedication);
    });
    document.querySelectorAll('.save-medication').forEach(button => {
        button.addEventListener('click', saveMedication);
    });
    document.querySelectorAll('.cancel-edit').forEach(button => {
        button.addEventListener('click', cancelEdit);
    });
}

// [Existing functions for edit, save, cancel, delete medications remain unchanged]

// Function to handle form submission
document.getElementById('pa-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Validate that at least one medication is added
    if (medications.length === 0) {
        alert('Please add at least one medication.');
        return;
    }

    // Ensure no records are in edit mode
    const isAnyEditing = medications.some(med => med.isEditing);
    if (isAnyEditing) {
        alert('Please save or cancel all edits before submitting.');
        return;
    }

    // Collect form data
    const finalData = {
        RecordID: 'MR_' + new Date().getTime(),
        PatientID: currentPatient ? currentPatient.PatientID : null,
        PatientInfo: {
            FirstName: document.getElementById('patient-first-name').value.trim(),
            LastName: document.getElementById('patient-last-name').value.trim(),
            DOB: document.getElementById('patient-dob').value
        },
        Medications: medications.map(({ isEditing, ...med }) => med),
        InsuranceDetails: {
            BIN: document.getElementById('bin').value.trim(),
            PCN: document.getElementById('pcn').value.trim(),
            Group: document.getElementById('group').value.trim()
        },
        Timestamp: new Date().toISOString()
    };

    // Send data to MedicationSubmission Azure Function
    fetch(`${FUNCTION_APP_URL}/MedicationSubmission`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
    })
        .then(response => {
            if (response.ok) {
                alert('Data submitted successfully!');
                // Reset the form
                medications = []; // Clear medications array
                updateMedicationsList();
                // Fetch updated medication history
                if (currentPatient && currentPatient.PatientID) {
                    fetchMedicationHistory(currentPatient.PatientID);
                }
            } else {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting data: ' + error.message);
        });
});

// Patient lookup functionality
document.getElementById('patient-lookup').addEventListener('click', function () {
    const firstName = document.getElementById('patient-first-name').value.trim();
    const lastName = document.getElementById('patient-last-name').value.trim();
    const dob = document.getElementById('patient-dob').value;

    if (!firstName || !lastName || !dob) {
        alert('Please enter first name, last name, and date of birth.');
        return;
    }

    // Fetch patient data from the server
    fetch(`${FUNCTION_APP_URL}/PatientSearch?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&dob=${encodeURIComponent(dob)}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    // Show the Add Patient modal if patient not found
                    $('#addPatientModal').modal('show');
                    throw new Error('Patient not found. You can add a new patient.');
                } else {
                    throw new Error('Error searching for patient.');
                }
            }
            return response.json();
        })
        .then(patient => {
            currentPatient = patient;
            populatePatientInfo(patient);
            fetchMedicationHistory(patient.PatientID);
            medications = []; // Clear current medications
            updateMedicationsList();
            // Hide the Add Patient modal if it was previously visible
            $('#addPatientModal').modal('hide');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
});

// Function to populate patient information in the form
function populatePatientInfo(patient) {
    document.getElementById('patient-first-name').value = patient.FirstName;
    document.getElementById('patient-last-name').value = patient.LastName;
    document.getElementById('patient-dob').value = patient.DOB;
    document.getElementById('bin').value = patient.InsuranceDetails.BIN;
    document.getElementById('pcn').value = patient.InsuranceDetails.PCN;
    document.getElementById('group').value = patient.InsuranceDetails.Group;
}

// Function to fetch and display medication history
function fetchMedicationHistory(patientID) {
    fetch(`${FUNCTION_APP_URL}/MedicationHistory?patientID=${encodeURIComponent(patientID)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching medication history.');
            }
            return response.json();
        })
        .then(records => {
            // Extract medications from records into medicationHistory array
            medicationHistory = [];
            records.forEach(record => {
                record.Medications.forEach(med => {
                    medicationHistory.push({
                        ...med,
                        Timestamp: record.Timestamp,
                        RecordID: record.RecordID
                    });
                });
            });
            // Sort medication history by date (most recent first)
            medicationHistory.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
            // Initialize filteredMedicationHistory
            filteredMedicationHistory = [...medicationHistory];
            displayMedicationHistory();
        })
        .catch(error => {
            console.error('Error:', error);
            medicationHistory = []; // Clear medication history if error occurs
            filteredMedicationHistory = [];
            displayMedicationHistory();
            alert(error.message);
        });
}

// Function to display medication history
function displayMedicationHistory() {
    const medicationHistoryDiv = document.getElementById('medication-history');
    medicationHistoryDiv.innerHTML = '';

    if (filteredMedicationHistory.length === 0) {
        medicationHistoryDiv.innerHTML = '<p>No medication history available.</p>';
        return;
    }

    // Create a table to display medication history
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'table-striped');

    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Medication Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Decision Basis</th>
            <th>Date</th>
        </tr>
    `;
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    filteredMedicationHistory.forEach((med, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="#" class="medication-detail" data-index="${index}">${med.Name}</a></td>
            <td>${med.Class}</td>
            <td>${med.Status}</td>
            <td>${med.DecisionBasis}</td>
            <td>${new Date(med.Timestamp).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    medicationHistoryDiv.appendChild(table);

    // Add event listeners for medication detail links
    document.querySelectorAll('.medication-detail').forEach(link => {
        link.addEventListener('click', showMedicationDetails);
    });
}

// Function to show medication details in a modal
function showMedicationDetails(event) {
    event.preventDefault();
    const index = event.currentTarget.getAttribute('data-index');
    const med = filteredMedicationHistory[index];

    // Populate modal with medication details
    const modalTitle = document.getElementById('medicationDetailsModalLabel');
    const modalBody = document.getElementById('medication-details-content');

    modalTitle.textContent = `Medication Details - ${med.Name}`;
    modalBody.innerHTML = `
        <p><strong>Name:</strong> ${med.Name}</p>
        <p><strong>Class:</strong> ${med.Class}</p>
        <p><strong>Status:</strong> ${med.Status}</p>
        <p><strong>Decision Basis:</strong> ${med.DecisionBasis}</p>
        <p><strong>Date:</strong> ${new Date(med.Timestamp).toLocaleString()}</p>
        <p><strong>Record ID:</strong> ${med.RecordID}</p>
    `;

    // Show the modal
    $('#medicationDetailsModal').modal('show');
}

// Event listeners for search and filter inputs
document.getElementById('search-name').addEventListener('input', filterMedicationHistory);
document.getElementById('filter-status').addEventListener('change', filterMedicationHistory);
document.getElementById('start-date').addEventListener('change', filterMedicationHistory);
document.getElementById('end-date').addEventListener('change', filterMedicationHistory);

// Function to filter medication history
function filterMedicationHistory() {
    const searchName = document.getElementById('search-name').value.trim().toLowerCase();
    const filterStatus = document.getElementById('filter-status').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    filteredMedicationHistory = medicationHistory.filter(med => {
        let matches = true;

        // Filter by name
        if (searchName && !med.Name.toLowerCase().includes(searchName)) {
            matches = false;
        }

        // Filter by status
        if (filterStatus && med.Status !== filterStatus) {
            matches = false;
        }

        // Filter by date range
        const medDate = new Date(med.Timestamp).setHours(0,0,0,0);
        if (startDate) {
            const start = new Date(startDate).setHours(0,0,0,0);
            if (medDate < start) {
                matches = false;
            }
        }
        if (endDate) {
            const end = new Date(endDate).setHours(0,0,0,0);
            if (medDate > end) {
                matches = false;
            }
        }

        return matches;
    });

    displayMedicationHistory();
}

// Handle Add Patient Form Submission via Modal
document.getElementById('add-patient-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const firstName = document.getElementById('modal-first-name').value.trim();
    const lastName = document.getElementById('modal-last-name').value.trim();
    const dob = document.getElementById('modal-dob').value;
    const bin = document.getElementById('modal-bin').value.trim();
    const pcn = document.getElementById('modal-pcn').value.trim();
    const group = document.getElementById('modal-group').value.trim();

    if (!firstName || !lastName || !dob) {
        alert('Please enter first name, last name, and date of birth.');
        return;
    }

    const patientData = {
        FirstName: firstName,
        LastName: lastName,
        DOB: dob,
        InsuranceDetails: {
            BIN: bin,
            PCN: pcn,
            Group: group
        }
    };

    fetch(`${FUNCTION_APP_URL}/AddPatient`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
    })
        .then(response => {
            if (response.status === 201) {
                return response.json();
            } else if (response.status === 409) {
                throw new Error('Patient already exists.');
            } else {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
        })
        .then(newPatient => {
            alert('Patient added successfully!');
            currentPatient = newPatient;
            populatePatientInfo(newPatient);
            medications = []; // Clear any existing medications
            updateMedicationsList();
            // Hide the Add Patient modal
            $('#addPatientModal').modal('hide');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding patient: ' + error.message);
        });
});
