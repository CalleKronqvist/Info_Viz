function init() {
    d3.json("data.json").then(function (data) {
        createBarchart(data, ".BarChart");
        createLineChart(data, ".LineChart");
        createLegend(data, ".Legend")
    });
}

