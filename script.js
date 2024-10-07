function init() {
    d3.json("data.json").then(function (data) {
        createBarchart(data, ".BarChart");
    });
}

