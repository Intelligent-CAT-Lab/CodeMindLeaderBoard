var selectedDataset = "ier";
let problemIds = {};

// Entry point
function filterDropdowns() {
    document.getElementById('taskDropdown').addEventListener('change', function() {
        selectedDataset = this.value;
        fetchData().then(data => {
            let datasetData = data[0];
            processData(datasetData);
        });
    });

    document.getElementById('datasetDropdown').addEventListener('change', function() {
        console.log('Dataset selected:', this.value);
        showGenerationTaskDropdown();
        document.getElementById('generationTask').value = '';
    });

    document.getElementById('generationtask').addEventListener('change', function() {
        console.log('Generation task selected:', this.value);
        
        let dataset = document.getElementById('datasetDropdown').value;
        if(this.value == 'code synthesis') {
            populateProblemIdDropdown(dataset);
        }
        else {
        }
    });

    document.getElementById('problemIdDropdown').addEventListener('change', function() {
        let dataset = document.getElementById('datasetDropdown').value;
        let problemId = this.value;
        console.log('Problem ID selected:', this.value);
        if (dataset && problemId) {
            populateDetailsTable(dataset, problemId);
        }
    });
}

function showGenerationTaskDropdown() {
    let tasks = ['code synthesis', 'code translation'];
    populateDropdown('generationtask', tasks, 'Select a task');

    document.getElementById('generationtask').style.display = 'inline';
}

// Fetch the data
function fetchData() {
    let fetchUrls;
    switch (selectedDataset) {
        case "ier":
            fetchUrls = ['task1/dataset.json', 'task1/ier_data.json'];
            break;
        case "der":
            fetchUrls = ['task2/dataset_synthesis.json', 'task2/der_data.json'];
            break;
        case "sr":
            fetchUrls = ['task3/dataset.json', 'task3/sr_data.json'];
            break;
        default:
            return Promise.reject("Invalid dataset selected");
    }

    return Promise.all(fetchUrls.map(url => fetch(url).then(response => response.json())))
        .catch(err => console.error("Error:", err));
}

// Process the data
function processData(data) {
    let parsedData = data;
    let datasets = Object.keys(parsedData);
    console.log(datasets);

    problemIds = {};
    datasets.forEach(dataset => {
        problemIds[dataset] = Object.keys(parsedData[dataset]);
    });
    console.log(problemIds);

    populateDropdown('datasetDropdown', datasets, 'Select a dataset');

}

// Function to populate a dropdown
function populateDropdown(dropdownId, items, defaultText) {
    let dropdown = document.getElementById(dropdownId);
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }

    let defaultOption = document.createElement('option');
    defaultOption.text = defaultText;
    defaultOption.value = '';
    dropdown.add(defaultOption);

    items.forEach(item => {
        let option = document.createElement('option');
        option.text = item;
        option.value = item;
        dropdown.add(option);
    });

    dropdown.value = '';
    dropdown.style.display = 'inline';
    document.getElementById(`${dropdownId}Label`).style.display = 'inline';
}

// Function to populate the problem id dropdown
function populateProblemIdDropdown(selectedDataset) {
    let problems = problemIds[selectedDataset] || [];
    populateDropdown('problemIdDropdown', problems, 'Select a problem id');

    document.getElementById('problemIdDropdown').style.display = 'inline';
    document.getElementById('problemIdDropdownLabel').style.display = 'inline';
}

// Function to populate the details table
function populateDetailsTable(dataset, problemId) {
    fetchData().then(data => {
        let details;
        if (selectedDataset == "ier") {
            details = data[0][dataset][problemId];
            let code = details['code'];
            let input = details['code_input'];
            let groundTruth = data[1]["ChatGPT_3.5"]?.[dataset][problemId]['ground_truth'] ?? 'Not Available';

            displayDetailsTable([
                { label: 'Code:', value: code },
                { label: 'Input:', value: input },
                { label: 'Expected Output:', value: groundTruth }
            ]);

            populateModelResults(data[1], dataset, problemId, 'ier');
        } else if (selectedDataset == "der") {
            details = data[0][dataset][problemId];
            let f1 = details['nl'];
            let f2 = details['asserts'];
            let f3 = details['input_reasoning'];
            let f4 = details['output_reasoning'];
            let groundTruth = data[1]["ChatGPT_3.5"]?.[dataset][problemId]['ground-truth'] ?? 'Not Available';

            displayDetailsTable([
                { label: 'NL:', value: f1 },
                { label: 'Asserts:', value: f2 },
                { label: 'Input Reasoning:', value: f3 },
                { label: 'Output Reasoning:', value: f4 },
                { label: 'Expected Output:', value: groundTruth }
            ]);

            populateModelResults(data[1], dataset, problemId, 'der');
        }
    });
}

// Function to display details table
function displayDetailsTable(rows) {
    let tableContent = rows.map(row => `
        <tr>
            <th style="border: 1px solid black; text-align: left; padding: 10px;">${row.label}</th>
            <td style="border: 1px solid black; text-align: left; padding: 10px;"><pre>${row.value}</pre></td>
        </tr>`).join('');

    let table = `
        <div style="justify-content: center;">
            <table style="border: 1px solid black; text-align: center;">
                ${tableContent}
            </table>
        </div>`;
    document.getElementById('detailsTable').innerHTML = table;
}

// Function to populate the model results
function populateModelResults(data, dataset, problemId, type) {
    document.getElementById('modelResults').innerHTML = '';
    let models = Object.keys(data);

    let html = models.map(model => {
        if (!model) return '';

        let details = data[model][dataset][problemId];
        let color = type === 'ier' ? (details['label'] === 1 ? 'green' : 'red') :
                    details['label'] === 1 ? 'orange' : details['label'] === 0 ? 'red' : 'green';

        let reasoning = details['reasoning'] || 'Not Available';
        let output = details['output'] || 'Not Available';
        let synthesized_code = type === 'der' ? details['synthesized_code'] || 'Not Available' : '';

        return `
            <label style="background-color: ${color}; width: 100%; display: block; margin-bottom: 10px; color:white;">${model}</label>
            <table>
                <tbody>
                    <tr>
                        <th style="border: 1px solid black; text-align: left; padding: 10px;">Reasoning</th>
                        <td style="border: 1px solid black; text-align: left; padding: 10px;">${reasoning}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid black; text-align: left; padding: 10px;">Predicted Output</th>
                        <td style="border: 1px solid black; text-align: left; padding: 10px;">${output}</td>
                    </tr>
                    ${type === 'der' ? `
                    <tr>
                        <th style="border: 1px solid black; text-align: left; padding: 10px;">Synthesized Code</th>
                        <td style="border: 1px solid black; text-align: left; padding: 10px;">${synthesized_code}</td>
                    </tr>` : ''}
                </tbody>
            </table>
            <br>`;
    }).join('');

    document.getElementById('modelResults').innerHTML = html;
}

// Initialize the filterDropdowns function
filterDropdowns();
