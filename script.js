let selectedClasses = new Set();
let originalData = []; // To store your full dataset

function init() {
    d3.json("data.json").then(function (data) {
        originalData = data;
        createBarchart(originalData, ".BarChart");
        createLineChart(originalData, ".LineChart");
        createLegend(originalData, ".Legend")
        // updateVisualizations()
    });
}
function updateVisualizations() {
    const filteredData = getFilteredData();
    updateBarchart(filteredData);
    updateLineChart(filteredData);
    // createLegend(filteredData, ".Legend")
}
function getFilteredData() {
    if (selectedClasses.size === 0) return originalData; // No filter applied

    return originalData.filter(d => selectedClasses.has(d['VEHICLE CLASS']));
}

