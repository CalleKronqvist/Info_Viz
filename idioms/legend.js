d3.json("data.json").then(data => {
    createLegend(data);
});

async function createLegend(data, containerId = ".Legend") {
    let colorPalette = null;

    await d3.json("../colorPalette.json").then((c) => {
        colorPalette = c;
    });

    // Get unique vehicle classes
    const vehicleClasses = Array.from(new Set(data.map(d => d['VEHICLE CLASS'])));

    // Create a color scale based on VEHICLE CLASS
    // const colorScale = d3.scaleOrdinal()
    //     .domain(vehicleClasses)   // The domain is the unique vehicle classes
    //     .range(colorPalette);     // The range is the color palette you've provided

    width = window.innerWidth;
    height = 100;

    let margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 200,  // Increase to fit long MODEL names
    };

    const svg = d3
        .select(containerId)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create the legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.right}, ${-margin.top})`); // Move legend to the right
    // const selectedClasses = new Set();

    // Create a colored rectangle for each class
    vehicleClasses.forEach((vehicleClass, index) => {

        const legendItem = legend.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(${index * 146}, 0)`)
            .style("cursor", "pointer") // Make the item look clickable
            .datum(vehicleClass);

        // Add rectangle
        legendItem.append("rect")
            .attr("x", 0)
            .attr("y", 40)
            .attr("width", 38)
            .attr("height", 38)
            .style("fill", colorPalette[vehicleClass])
            .style("stroke", "none");

        // Add label
        legendItem.append("text")
            .attr("x", 40)
            .attr("y", 60)
            .text(vehicleClass)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
        // Add hover effects
        legendItem.on("mouseover", function () {
            d3.select(this).select("rect")
                .style("stroke", "black")
                .style("stroke-width", "2px");

            d3.select(this).select("text")
                .style("font-weight", "bold");
        });
        legendItem.on("mouseleave", function () {
            if (!selectedClasses.has(d3.select(this).datum())) {
                d3.select(this).select("rect")
                    .style("stroke", "none");

                d3.select(this).select("text")
                    .style("font-weight", "normal");  // Reset text weight
            }

        });

        // Modify the click event
        legendItem.on("click", function (event, d) {
            if (selectedClasses.has(d)) {
                // Deselect: remove from set, reset styles
                selectedClasses.delete(d);
                d3.select(this).select("rect")
                    .style("stroke", "none");

                d3.select(this).select("text")
                    .style("font-weight", "normal");
            } else {
                // Select: add to set, apply styles
                selectedClasses.add(d);
                d3.select(this).select("rect")
                    .style("stroke", "black")
                    .style("stroke-width", "2px");

                d3.select(this).select("text")
                    .style("font-weight", "bold");
            }

            filterData(data);
            console.log("Selected vehicle classes:", Array.from(selectedClasses));
        });

    })
}

function filterData(data) {
    // get the other filters/sliders
    const selectedFuel = d3.select('#fuelDropdown').property('value');
    const selectedBrand = d3.select('#brandDropdown').property('value');
    // const selectedEngineSize = d3.select('#engineSizeDropdown').property('value');
    const startYear = +d3.select('#startYearLabel').text();
    const endYear = +d3.select('#endYearLabel').text();
    
    const startSize = +d3.select('#startSizeLabel').text();
    const endSize = +d3.select('#endSizeLabel').text();

    let filteredData = data.filter(d => 
        d.YEAR >= startYear && d.YEAR <= endYear &&
        d['ENGINE SIZE'] >= startSize && d['ENGINE SIZE'] <= endSize
    );

    if (selectedFuel !== 'All') {
        filteredData = filteredData.filter(d => d['FUEL'] === selectedFuel);
    }

    if (selectedBrand !== 'All') {
        filteredData = filteredData.filter(d => d['MAKE'] === selectedBrand);
    }

    // if (selectedEngineSize !== 'All') {
    //     filteredData = filteredData.filter(d => d['ENGINE SIZE'] === selectedEngineSize);
    // }

    if (selectedClasses.size > 0) {
        filteredData = filteredData.filter(d => selectedClasses.has(d['VEHICLE CLASS']));
    }

    // Update the visualization with the filtered data
    updateVisualizations(filteredData);
}