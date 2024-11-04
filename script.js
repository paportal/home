// Define the base URL for Azure Functions
const FUNCTION_APP_URL = 'https://YOUR_FUNCTION_APP_NAME.azurewebsites.net/api';

// Initialize an array to store medications
let medications = [];
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

// Function to enter edit mode
function enterEditMode(event) {
    const index = event.currentTarget.getAttribute('data-index');
    medications[index].isEditing = true;
    updateMedicationsList();
}

// Function to save edited medication
function saveMedication(event) {
    const index = event.currentTarget.getAttribute('data-index');

    // Get updated values
    const updatedName = document.getElementById(`edit-name-${index}`).value.trim();
    const updatedClass = document.getElementById(`edit-class-${index}`).value.trim();
    const updatedStatus = document.getElementById(`edit-status-${index}`).value;
    const updatedDecision = document.getElementById(`edit-decision-${index}`).value;

    if (updatedName === '') {
        alert('Medication name cannot be empty.');
        return;
    }

    // Update the medication object
    medications[index] = {
        Name: updatedName,
        Class: updatedClass,
        Status: updatedStatus,
        DecisionBasis: updatedDecision,
        isEditing: false
    };

    updateMedicationsList();
}

// Function to cancel edit
function cancelEdit(event) {
    const index = event.currentTarget.getAttribute('data-index');
    medications[index].isEditing = false;
    updateMedicationsList();
}

// Function to delete a medication
function deleteMedication(event) {
    const index = event.currentTarget.getAttribute('data-index');
    if (confirm('Are you sure you want to delete this medication?')) {
        medications.splice(index, 1);
        updateMedicationsList();
    }
}

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
                document.getElementById('pa-form').reset();
                medications = [];
                updateMedicationsList();
                currentPatient = null;
                // Hide the Add Patient modal if it was visible
                $('#addPatientModal').modal('hide');
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
            // Flatten the medication records into the medications array
            medications = [];
            records.forEach(record => {
                record.Medications.forEach(med => {
                    medications.push({
                        ...med,
                        isEditing: false
                    });
                });
            });
            updateMedicationsList();
        })
        .catch(error => {
            console.error('Error:', error);
            medications = []; // Clear medications if error occurs
            updateMedicationsList();
            alert(error.message);
        });
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
