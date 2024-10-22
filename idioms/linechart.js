function createLineChart(data) {
    /* Pre-process*/
    let filteredData = data.filter(d => d['FUEL'] === 'X');

    let groupedData = d3.group(filteredData, d => d.YEAR);

    let formattedData = Array.from(groupedData, ([year, values]) => ({
        year: +year,
        avgEmissions: d3.mean(values, d => d.EMISSIONS),  // Calculate average emissions
        totalCost: d3.mean(values, d => d['FUEL CONSUMPTION'] * d['FUEL COST'] / 100)  // Average total cost
    }));


    /* Dimensions */
    // SVG dimensions and margins
    const margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 60
    };
    const fixedWidth = window.innerWidth * 0.4;
    const height = 400;


    /* Scales */
    const xScale = d3.scaleLinear()
        .domain([2000, 2022])
        .range([margin.left, fixedWidth - margin.right]);

    const yScaleLeft = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData, d => d.avgEmissions)])
        .range([height - margin.bottom, margin.top]);

    const yScaleRight = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData, d => d.totalCost)])
        .range([height - margin.bottom, margin.top]);

    /* SVG container */
    const svg = d3.select(".LineChart")
        .append("svg")
        .attr("width", fixedWidth)
        .attr("height", height);

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // generate lines
    const emissionLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleLeft(d.avgEmissions));

    const costLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleRight(d.totalCost));

    // Add the emission path (left)
    svg.append("path")
        .datum(formattedData)
        .attr("class", "lineEmissions")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", emissionLine);
    svg
        .selectAll("circle.dataItemEmissions")
        .data(formattedData)
        .enter()
        .append("circle")
        .attr("class", "dataItemEmissions")
        .attr("r", 5)
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScaleLeft(d.avgEmissions))
        .style("fill", "steelblue")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 7);  // Enlarge point on hover
            tooltip
                .style("opacity", 1)
                .html(`Year: ${d.year}<br>Avg Emissions: ${d.avgEmissions.toFixed(2)} g/km`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 25}px`);
        })
        .on("mouseleave", function () {
            d3.select(this).attr("r", 5);  // Reset point size
            tooltip.style("opacity", 0);  // Hide tooltip
        });


    // Add cost path (right)
    svg.append("path")
        .datum(formattedData)
        .attr("class", "lineCost")
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", costLine);
    svg
        .selectAll("circle.cost")
        .data(formattedData)
        .enter()
        .append("circle")
        .attr("class", "dataItemCost")
        .attr("r", 5)
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScaleRight(d.totalCost))
        .style("fill", "green")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 7);  // Enlarge point on hover
            tooltip
                .style("opacity", 1)
                .html(`Year: ${d.year}<br>Cost: ${d.totalCost.toFixed(2)}$`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 25}px`);
        })
        .on("mouseleave", function () {
            d3.select(this).attr("r", 5);  // Reset point size
            tooltip.style("opacity", 0);  // Hide tooltip
        });


    /* Axes */
    // Add X axis
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));  // Format years as integers
    svg
        .append("text")
        .attr("x", fixedWidth / 2)
        .attr("y", height - margin.bottom / 3)
        .attr("text-anchor", "middle")
        .text("Year");

    // Left Y axis
    svg.append("g")
        .attr("class", "yAxisLeft")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "axisBlue")
        .call(d3.axisLeft(yScaleLeft));
    svg
        .append("text")
        .attr("x", -height / 2)
        .attr("y", 22.22222)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .style("fill", "steelblue")
        .text("CO2 Emissions (g/km)");

    // Right Y axis

    svg.append("g")
        .attr("transform", `translate(${fixedWidth - margin.right},0)`)
        .attr("class", "axisGreen")
        // .style("stroke", "green")		
        .call(d3.axisRight(yScaleRight));
    svg
        .append("text")
        // .attr("class", "axisGreen")
        .attr("x", height / 2)
        .attr("y", -fixedWidth + margin.right / 2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(90)`)
        .style("fill", "green")
        .text("Cost (Dollars per 100km)");

    // Title
    svg
        .append("text")
        .attr("x", fixedWidth / 2)
        .attr("y", margin.top / 1.6)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("CO2 Emissions and Cost for Gasoline Vehicles");


}
function updateLineChart(data) {
    /* Pre-process*/

    console.log(data);

    let filteredData = data.filter(d => d['FUEL'] === 'X');

    let groupedData = d3.group(filteredData, d => d.YEAR);

    let formattedData = Array.from(groupedData, ([year, values]) => ({
        year: +year,
        avgEmissions: d3.mean(values, d => d.EMISSIONS),  // Calculate average emissions
        totalCost: d3.mean(values, d => d['FUEL CONSUMPTION'] * d['FUEL COST'] / 100)  // Average total cost
    }));

    /* Dimensions */
    // SVG dimensions and margins
    const margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 60
    };
    const fixedWidth = window.innerWidth * 0.4;
    const height = 400;

    /* Scales */
    const xScale = d3.scaleLinear()
        .domain([2000,2022])
        .range([margin.left, fixedWidth - margin.right]);

    const yScaleLeft = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.avgEmissions)])
        .range([height - margin.bottom, margin.top]);

    const yScaleRight = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.totalCost)])
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select(".LineChart svg");

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);


    const emissionLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleLeft(d.avgEmissions));
    const costLine = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleRight(d.totalCost));

    svg
        .selectAll("circle.dataItemEmissions")
        .data(formattedData, d => d.year)
        .exit()
        .remove();
    svg
        .select("path.lineEmissions")
        .datum(formattedData)
        .attr("class", "lineEmissions")
        .transition()
        .duration(1000)
        .attr("d", emissionLine)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5);
    svg
        .selectAll("circle.dataItemEmissions")
        .data(formattedData, d => d.year)
        .transition()
        .duration(1000)
        .attr("r", 5)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleLeft(d.avgEmissions))
        .end()
        .then(() => {
            const allCircle = svg
                .selectAll("circle.dataItemEmissions")
                .data(formattedData, d => d.year)
                .enter()
                .append("circle")
                .attr("class", "dataItemEmissions")
                .attr("r", 5)
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScaleLeft(d.avgEmissions))
                .style("fill", "steelblue")
                .style("opacity", 1)
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 7);  // Enlarge point on hover
                    tooltip
                        .style("opacity", 1)
                        .html(`Year: ${d.year}<br>Avg Emissions: ${d.avgEmissions.toFixed(2)} g/km`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 25}px`);
                })
                .on("mouseleave", function () {
                    d3.select(this).attr("r", 5);  // Reset point size
                    tooltip.style("opacity", 0);  // Hide tooltip
                });
            allCircle.transition().duration(1000).style("opacity", 1);
            });

    svg
        .selectAll("circle.dataItemCost")
        .data(formattedData, d => d.year)
        .exit()
        .remove();
    svg
        .select("path.lineCost")
        .datum(formattedData)
        .attr("class", "lineCost")
        .transition()
        .duration(1000)
        .attr("d", costLine)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5);
    svg
        .selectAll("circle.dataItemCost")
        .data(formattedData, d => d.year)
        .transition()
        .duration(1000)
        .attr("r", 5)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleRight(d.totalCost))
        .end()
        .then(() => {
            const allCircle = svg
                .selectAll("circle.dataItemCost")
                .data(formattedData, d => d.year)
                .enter()
                .append("circle")
                .attr("class", "dataItemCost")
                .attr("r", 5)
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScaleRight(d.totalCost))  
                .style("fill", "green")
                .style("opacity", 1)
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 7);  // Enlarge point on hover
                    tooltip
                        .style("opacity", 1)
                        .html(`Year: ${d.year}<br>Cost: ${d.totalCost.toFixed(2)}$`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 25}px`);
                        })
                .on("mouseleave", function () {
                    d3.select(this).attr("r", 5);  // Reset point size
                    tooltip.style("opacity", 0);  // Hide tooltip
                });
            allCircle.transition().duration(1000).style("opacity", 1);
            });

    // svg.select(".lineEmissions")
    //     .datum(formattedData)
    //     .transition()
    //     .duration(1000)
    //     .attr("d", emissionLine);

    

    // // Data join for emission points
    // const emissionPoints = svg.selectAll(".dataItem")
    //     .data(formattedData, d => d.year);  // Use year as a key to track data

    // emissionPoints.exit().remove();  // Remove old points

    // emissionPoints.enter()
    //     .append("circle")
    //     .attr("class", "dataItem")
    //     .attr("r", 5)
    //     .attr("fill", "steelblue")
    //     .merge(emissionPoints)  // Merge new and existing points
    //     .transition()
    //     .duration(1000)
    //     .attr("cx", d => xScale(d.year))
    //     .attr("cy", d => yScaleLeft(d.avgEmissions));

    // // Update the cost line
    // svg.select(".lineCost")
    //     .datum(formattedData)
    //     .transition()
    //     .duration(1000)
    //     .attr("d", costLine);

    // // Data join for cost points
    // svg.selectAll(".dataItemCost")
    //     .data(formattedData, d => d.year)
    //     .exit()
    //     .remove();  // Remove old points

    // svg.enter()
    //     .append("circle")
    //     .attr("class", "dataItemCost")
    //     .attr("r", 5)
    //     .attr("fill", "green")
    //     .merge(costPoints)  // Merge new and existing points
    //     .transition()
    //     .duration(1000)
    //     .attr("cx", d => xScale(d.year))
    //     .attr("cy", d => yScaleRight(d.totalCost))
    //     .on("mouseover", function (event, d) {
    //         d3.select(this).attr("r", 7);  // Enlarge point on hover
    //         tooltip
    //             .style("opacity", 1)
    //             .html(`Year: ${d.year}<br>Cost: ${d.totalCost.toFixed(2)}$`)
    //             .style("left", `${event.pageX + 10}px`)
    //             .style("top", `${event.pageY - 25}px`);
    //     })
    //     .on("mouseleave", function () {
    //         d3.select(this).attr("r", 5);  // Reset point size
    //         tooltip.style("opacity", 0);  // Hide tooltip
    //     });

}