// Function to add a new medication section
document.getElementById('add-medication').addEventListener('click', function () {
    var medicationsDiv = document.getElementById('medications');
    var medicationCount = medicationsDiv.getElementsByClassName('medication').length + 1;

    var newMedicationDiv = document.createElement('div');
    newMedicationDiv.classList.add('medication');

    newMedicationDiv.innerHTML = `
        <label for="medication-name-${medicationCount}">Medication Name:</label>
        <input type="text" id="medication-name-${medicationCount}" name="medicationName[]" required>

        <label for="medication-class-${medicationCount}">Class:</label>
        <input type="text" id="medication-class-${medicationCount}" name="medicationClass[]">

        <label for="medication-status-${medicationCount}">Status:</label>
        <select id="medication-status-${medicationCount}" name="medicationStatus[]" required>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Pending">Pending</option>
        </select>

        <label for="medication-notes-${medicationCount}">Notes:</label>
        <input type="text" id="medication-notes-${medicationCount}" name="medicationNotes[]">

        <button type="button" class="remove-medication">Remove</button>
    `;

    medicationsDiv.appendChild(newMedicationDiv);

    // Add event listener for the remove button
    newMedicationDiv.querySelector('.remove-medication').addEventListener('click', function () {
        medicationsDiv.removeChild(newMedicationDiv);
    });
});

// Function to handle form submission
document.getElementById('pa-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    var formData = new FormData(event.target);

    // Convert formData to JSON
    var data = {};
    formData.forEach(function (value, key) {
        if (key.endsWith('[]')) {
            key = key.slice(0, -2);
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(value);
        } else {
            data[key] = value;
        }
    });

    // Organize medications into objects
    var medications = [];
    var medicationNames = data.medicationName || [];
    var medicationClasses = data.medicationClass || [];
    var medicationStatuses = data.medicationStatus || [];
    var medicationNotes = data.medicationNotes || [];

    for (var i = 0; i < medicationNames.length; i++) {
        medications.push({
            Name: medicationNames[i],
            Class: medicationClasses[i] || '',
            Status: medicationStatuses[i],
            Notes: medicationNotes[i] || ''
        });
    }

    // Prepare the final data object
    var finalData = {
        PA_ID: 'PA_' + new Date().getTime(), // Generate a unique PA_ID
        PatientInfo: {
            FirstName: data.PatientFirstName,
            LastName: data.PatientLastName,
            DOB: data.PatientDOB
        },
        Medications: medications,
        PrimaryDrug: data.PrimaryDrug || '',
        InsuranceDetails: {
            BIN: data.BIN,
            PCN: data.PCN,
            Group: data.Group
        },
        ApprovalDecision: data.ApprovalDecision,
        DecisionBasis: data.DecisionBasis,
        Timestamp: new Date().toISOString(),
        AdditionalNotes: data.AdditionalNotes || ''
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
                event.target.reset();
                // Optionally, remove all but the first medication section
                var medicationsDiv = document.getElementById('medications');
                medicationsDiv.innerHTML = '';
                medicationsDiv.appendChild(createMedicationDiv(1));
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

// Helper function to create a medication div
function createMedicationDiv(medicationCount) {
    var medicationDiv = document.createElement('div');
    medicationDiv.classList.add('medication');

    medicationDiv.innerHTML = `
        <label for="medication-name-${medicationCount}">Medication Name:</label>
        <input type="text" id="medication-name-${medicationCount}" name="medicationName[]" required>

        <label for="medication-class-${medicationCount}">Class:</label>
        <input type="text" id="medication-class-${medicationCount}" name="medicationClass[]">

        <label for="medication-status-${medicationCount}">Status:</label>
        <select id="medication-status-${medicationCount}" name="medicationStatus[]" required>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
            <option value="Pending">Pending</option>
        </select>

        <label for="medication-notes-${medicationCount}">Notes:</label>
        <input type="text" id="medication-notes-${medicationCount}" name="medicationNotes[]">

        <button type="button" class="remove-medication">Remove</button>
    `;

    // Add event listener for the remove button
    medicationDiv.querySelector('.remove-medication').addEventListener('click', function () {
        var medicationsDiv = document.getElementById('medications');
        medicationsDiv.removeChild(medicationDiv);
    });

    return medicationDiv;
}

// Initialize the first medication section
(function () {
    var firstMedicationDiv = document.querySelector('.medication');
    var removeButton = firstMedicationDiv.querySelector('.remove-medication');
    removeButton.style.display = 'none'; // Hide the remove button for the first medication
})();
