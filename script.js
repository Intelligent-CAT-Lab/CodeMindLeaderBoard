
let csvData = []; // Global array to store CSV data

document.addEventListener('DOMContentLoaded', function() {
    fetch('result.csv')
        .then(response => response.text())
        .then(data => {
            csvData = parseCSV(data);
            // console.log(csvData);
            filterData(); // Optionally filter data initially if needed
        })
        .catch(error => console.error('Error loading the CSV file:', error));

    var detailsLink = document.getElementById('detailsLink');
  
    detailsLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
    
        // Get selected values from dropdowns
        var datasetVal = document.getElementById('dataset').value;
        var taskVal = document.getElementById('task').value;
    
        // Construct the new URL with encoded query parameters
        var newHref = 'detailsPage.html?datasetVal=' + encodeURIComponent(datasetVal) + '&taskVal=' + encodeURIComponent(taskVal);
    
        // Navigate to the new URL
        window.location.href = newHref;
    });
    
});

  
function parseCSV(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }
        result.push(obj);
    }
    return result;
}

function filterData() {
    const dataset = document.getElementById('dataset').value;
    const task = document.getElementById('task').value;
    const gtask = document.getElementById('gtask').value;
    const src = document.getElementById('source').value;
    const tgt = document.getElementById('target').value;
    let filteredData =  csvData.filter(item => item.Dataset === dataset && item.Task === task);
    if (task == 'der' || task == 'sr') {
        filteredData = filteredData.filter(item => item.Gtask === gtask)
        if (gtask == 'translate') {
            filteredData = filteredData.filter(item => item.src===src && item.tgt === tgt)
        }
    }
    sortData(filteredData, task);
    displayData(filteredData, task, gtask);
}


function displayData(filteredData, task, gtask) {
    const table = document.getElementById("data-table");
    const thead = table.querySelector("thead tr");
    thead.innerHTML = ""; // Clear existing headers
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing data rows

    if (task === 'ier') {
        thead.innerHTML = "<th>Dataset</th><th>Model</th><th>R<sub>IER</sub></th>";
        filteredData.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${item.Dataset}</td><td>${item.Model}</td><td>${item.RIER}</td>`;
            tbody.appendChild(row);        
        });
    }
    if (task === 'der') {
        if(gtask == 'synthesis') {
        thead.innerHTML = "<th>Dataset</th><th>Model</th><th>Pass@1</th><th>R<sub>DER</sub></th>";
        filteredData.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${item.Dataset}</td><td>${item.Model}</td><td>${item.Pass1}</td><td>${item.RDER}</td>`;
            tbody.appendChild(row);        
        });
        }
        if(gtask == 'translate') {
        thead.innerHTML = "<th>Dataset</th><th>Model</th><th>Source PL</th><th>Target PL</th><th>Pass@1</th><th>R<sub>DER</sub></th>";   
        filteredData.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${item.Dataset}</td><td>${item.Model}</td><td>${item.src}</td><td>${item.tgt}</td><td>${item.Pass1}</td><td>${item.RDER}</td>`;
            tbody.appendChild(row);        
        });
        }  
    }
    if (task === 'sr') {
        thead.innerHTML = "<th>Dataset</th><th>Model</th><th>With Test</sub><th>No Test</sub><th>Misleading Test</sub></th>";
        filteredData.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${item.Dataset}</td><td>${item.Model}</td><td>${item.WithTest}</td><td>${item.NoTest}</td><td>${item.MisleadingTest}</td>`;
            tbody.appendChild(row);        
        });
    }
}

function sortData(data, task){
    // console.log(data)
    if (task === 'ier') {
        data.sort((a, b) => parseInt(b.RIER) - parseInt(a.RIER));
    }
    if (task == 'der') {
        data.sort((a, b) => parseInt(b.RDER) - parseInt(a.RDER));
    }
    if (task == 'sr') {
        data.sort((a, b) => parseInt(b.WithTest) - parseInt(a.WithTest));
    }
}

function handleDropDown() {
    var task = document.getElementById('task').value;
    var gtaskOptions = document.getElementById("gtask");
    var gtaskLabels = document.querySelector('label[for="gtask"]');
    var srcOptions = document.getElementById('source')
    var srcLabels = document.querySelector('label[for="source"]');
    var tgtOptions = document.getElementById('target')
    var tgtLabels = document.querySelector('label[for="target"]');
    var gtask = document.getElementById('gtask').value
    // Display the student-specific options if the selected role is "student"
    if (gtask === 'translate'){
        srcOptions.style.display = 'inline';
        srcLabels.style.display = 'inline';
        tgtOptions.style.display = 'inline';
        tgtLabels.style.display = 'inline';
    } else {
        srcOptions.style.display = 'none';
        srcLabels.style.display = 'none';
        tgtOptions.style.display = 'none';
        tgtLabels.style.display = 'none';

    }
    if (task === 'der' || task === 'sr') {
        gtaskOptions.style.display = 'inline';
        gtaskLabels.style.display = 'inline';
    } else {
        gtaskOptions.style.display = 'none';
        gtaskLabels.style.display = 'none';
        srcOptions.style.display = 'none';
        srcLabels.style.display = 'none';
        tgtOptions.style.display = 'none';
        tgtLabels.style.display = 'none';
    }
}
