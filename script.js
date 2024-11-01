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

    medications.forEach((medication, index) => {
        const medicationDiv = document.createElement('div');
        medicationDiv.classList.add('medication-item');

        medicationDiv.innerHTML = `
            <button type="button" class="edit-medication" data-index="${index}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button type="button" class="delete-medication" data-index="${index}">
                <i class="fas fa-trash"></i> Delete
            </button>
            <p><strong>Name:</strong> ${medication.Name}</p>
            <p><strong>Class:</strong> ${medication.Class}</p>
            <p><strong>Status:</strong> ${medication.Status}</p>
            <p><strong>Decision Basis:</strong> ${medication.DecisionBasis}</p>
        `;

        medicationsList.appendChild(medicationDiv);
    });

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

// Include Font Awesome for icons (in the HTML head section)
