// Initialize an array to store medications
let medications = [];

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
        DecisionBasis: decisionBasis
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

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    medicationsList.appendChild(table);

    // Add event listeners for edit and delete buttons
    const editButtons = document.querySelectorAll('.edit-medication');
    editButtons.forEach(button => {
        button.addEventListener('click', editMedication);
    });

    const deleteButtons = document.querySelectorAll('.delete-medication');
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteMedication);
    });
}

// Function to edit a medication
function editMedication(event) {
    const index = event.currentTarget.getAttribute('data-index');
    const medication = medications[index];

    // Populate the form with medication details
    document.getElementById('medication-name').value = medication.Name;
    document.getElementById('medication-class').value = medication.Class;
    document.getElementById('medication-status').value = medication.Status;
    document.getElementById('decision-basis').value = medication.DecisionBasis;

    // Remove the medication from the array
    medications.splice(index, 1);

    // Update the medications list display
    updateMedicationsList();
}

// Function to delete a medication
function deleteMedication(event) {
    const index = event.currentTarget.getAttribute('data-index');
    medications.splice(index, 1);
    updateMedicationsList();
}

// Function to handle form submission
document.getElementById('pa-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Validate that at least one medication is added
    if (medications.length === 0) {
        alert('Please add at least one medication.');
        return;
    }

    // Collect form data
    const finalData = {
        PA_ID: 'PA_' + new Date().getTime(), // Generate a unique PA_ID
        PatientInfo: {
            FirstName: document.getElementById('patient-first-name').value.trim(),
            LastName: document.getElementById('patient-last-name').value.trim(),
            DOB: document.getElementById('patient-dob').value
        },
        Medications: medications,
        InsuranceDetails: {
            BIN: document.getElementById('bin').value.trim(),
            PCN: document.getElementById('pcn').value.trim(),
            Group: document.getElementById('group').value.trim()
        },
        Timestamp: new Date().toISOString()
    };

    // Send data to Azure Function
    fetch('https://your-azure-function-url', {
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
            } else {
                response.text().then(text => {
                    alert('Error submitting data: ' + text);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting data.');
        });
});
