var selectedTask = "ier"; // Default task value
var selectedDataset = "MBPP"; // Default dataset value
let problemIds = {};
let modelList = [];

document.addEventListener('DOMContentLoaded', function() {
    // Parse query parameters
    const datasetVal = getQueryParam('datasetVal');
    const taskVal = getQueryParam('taskVal');

    // Set default values or use parsed values
    selectedTask = taskVal || "ier";
    selectedDataset = datasetVal || "MBPP";

    console.log("Initial selectedTask:", selectedTask);
    console.log("Initial selectedDataset:", selectedDataset);

    // Initialize event listeners for dropdowns
    filterDropdowns();

    // Fetch data and then set initial dropdown values
    fetchData().then(data => {
        let datasetData = data[0];
        processData(datasetData);

        // Set default dropdown values and trigger change events
        setDropdownValue('taskDropdown', selectedTask);
        // setDropdownValue('datasetDropdown', selectedDataset);

        // // Optional: Set problemIdDropdown to the first option
        // document.getElementById('problemIdDropdown').selectedIndex = 0;
        // document.getElementById('problemIdDropdown').dispatchEvent(new Event('change'));
    });
});

function setDropdownValue(dropdownId, value) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Dropdown with ID '${dropdownId}' not found.`);
        return;
    }
    console.log(`Setting ${dropdownId} to value:`, value);
    dropdown.value = value;
    dropdown.dispatchEvent(new Event('change')); // Trigger change event
}

function filterDropdowns() {
    document.getElementById('taskDropdown').addEventListener('change', function() {
        clearResults();
        selectedTask = this.value;
        console.log("Task changed to:", selectedTask);
        fetchData().then(data => {
            let datasetData = data[0];
            processData(datasetData);
        });
    });

    document.getElementById('datasetDropdown').addEventListener('change', function() {
        clearResults();
        selectedDataset = this.value;
        console.log('Dataset selected:', selectedDataset);
        populateProblemIdDropdown(selectedDataset);
    });

    document.getElementById('problemIdDropdown').addEventListener('change', function() {
        clearResults();
        let problemId = this.value;
        console.log('Problem ID selected:', problemId);
        if (selectedDataset && problemId) {
            populateDetailsTable(selectedDataset, problemId);
        }
        showModelDropdown(modelList);
    });

    document.getElementById('modelDropdown').addEventListener('change', function() {
        // clearResults();
        let model = this.value;
        if(modelList.find(element => element === model) !== undefined){
            console.log('Model selected:', model);
            let problemId = document.getElementById('problemIdDropdown').value;
            if (selectedDataset && problemId) {
                populateDetailsTable(selectedDataset, problemId, model);
            }
        }
    });
}

function clearResults() {
    let contentArea = document.getElementById('detailsTable');
    if (contentArea) {
        contentArea.innerHTML = '';
    }

    contentArea = document.getElementById('modelResults');
    if (contentArea) {
        contentArea.innerHTML = '';
    }
}

function populateDropdown(dropdownId, items, defaultText, selectedOption) {
    let dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';

    // Optionally add a default "Please select" option
    if (defaultText) {
        let defaultOption = document.createElement('option');
        defaultOption.text = defaultText;
        defaultOption.value = '';
        dropdown.add(defaultOption);
    }

    items.forEach(item => {
        let option = document.createElement('option');
        option.text = item;
        option.value = item;
        dropdown.add(option);
    });

    // Automatically select the first real option if available
    if (items.length > 0) {
        if (selectedOption !== undefined) {
            dropdown.value = selectedOption;
        } else {
            dropdown.selectedIndex = 0;
        }
        // dropdown.selectedIndex = defaultText ? 0 : 1; // Adjust based on whether a default option is added
    }

    dropdown.style.display = 'inline';

    // Trigger change event after populating and selecting the first option
    var event = new Event('change', { bubbles: true });
    dropdown.dispatchEvent(event);
}

function populateProblemIdDropdown(sd) {
    let problems = problemIds[sd] || [];
    populateDropdown('problemIdDropdown', problems, undefined);
    // populateDropdown('problemIdDropdown', problems, 'Select a problem ID');
}

function populateDetailsTable(dataset, problemId, model) {
    fetchData().then(data => {
        let details;
        if (selectedTask == "ier") {
            details = data[0][dataset][problemId];
            let code = details['code'];
            let input = details['code_input'];
            let groundTruth = data[1]["ChatGPT_3.5"]?.[dataset][problemId]['ground_truth'] ?? 'Not Available';

            displayDetailsTable([
                { label: 'Code:', value: code },
                { label: 'Input:', value: input },
                { label: 'Expected Output:', value: groundTruth }
            ]);

            populateModelResults(data[1], dataset, problemId, 'ier', model);
        } else if (selectedTask == "der") {
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

function displayDetailsTable(rows) {
    if (!rows || rows.length === 0) {
        document.getElementById('detailsTable').innerHTML = '<p style="text-align:center; margin-top:20px;">Data is not available for this problem ID, Please select another one.</p>';
        return;
    }
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

function populateModelResults(data, dataset, problemId, type, selectedModel) {
    document.getElementById('modelResults').innerHTML = '';
    let models = Object.keys(data);

    models.sort((a, b) => {
        let labelA = data[a] && data[a][dataset] && data[a][dataset][problemId] ? data[a][dataset][problemId].label : -Infinity;
        let labelB = data[b] && data[b][dataset] && data[b][dataset][problemId] ? data[b][dataset][problemId].label : -Infinity;
    
        return labelB - labelA;
    });

    let html = models.map(model => {
        if(modelList.find(element => element === model) === undefined){ 
            modelList.push(model) 
        };

        if(selectedModel && selectedModel !== model) {
            return null;
        }

        let details = data[model][dataset][problemId];
        if (!details) {
            document.getElementById('modelResults').innerHTML = '<p style="text-align:center; margin-top:20px;">No data available for this problem ID, please select another one.</p>';
            return;
        }

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

function fetchData() {
    let fetchUrls;
    switch (selectedTask) {
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

function processData(data) {
    let parsedData = data;
    let datasets = Object.keys(parsedData);
    console.log("Datasets available:", datasets);

    problemIds = {};
    datasets.forEach(dataset => {
        problemIds[dataset] = Object.keys(parsedData[dataset]);
    });
    console.log("Problem IDs:", problemIds);

    // populateDropdown('datasetDropdown', datasets, 'Select a dataset');
    populateDropdown('datasetDropdown', datasets, undefined, selectedDataset);
}

function getQueryParam(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
}

function showModelDropdown(mList) {
    populateDropdown('modelDropdown', mList, "Select a model", undefined);
}