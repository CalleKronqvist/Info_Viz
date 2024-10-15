function createLineChart(data) {
    /* Pre-process*/
    let filteredData = data.filter(d => d['FUEL'] === 'X');
    console.log(filteredData);

    let groupedData = d3.group(filteredData, d => d.YEAR);

    let formattedData = Array.from(groupedData, ([year, values]) => ({
    year: +year,
    avgEmissions: d3.mean(values, d => d.EMISSIONS),  // Calculate average emissions
    totalCost: d3.mean(values, d => d['FUEL CONSUMPTION'] * d['FUEL COST'] / 100)  // Average total cost
    }));

    console.log(formattedData);  // Inspect the output
    
    /* Dimensions */
    // SVG dimensions and margins
    const margin = { 
        top: 30, 
        right: 60, 
        bottom: 60, 
        left: 60 
    };
    const width = window.innerWidth/2;
    const height = 400;

    
    /* Scales */
    const xScale = d3.scaleLinear()
    .domain(d3.extent(formattedData, d => d.year))
    .range([margin.left, width-margin.right]);

    const yScaleLeft = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => d.avgEmissions)])
    .range([height-margin.bottom,margin.top]);

    const yScaleRight = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d=> d.totalCost)])
        .range([height-margin.bottom,margin.top]);

    /* SVG container */
    const svg = d3.select(".LineChart")
    .append("svg")
    .attr("width", width)
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
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", emissionLine);
    svg
        .selectAll("circleEmissions")
        .data(formattedData)
        .enter()
        .append("circle")
        .attr("class", "dataItem")
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
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", costLine);
    svg
        .selectAll("circleCost")
        .data(formattedData)
        .enter()
        .append("circle")
        .attr("class", "dataItem")
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
        .attr("transform", `translate(0,${height- margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));  // Format years as integers
    svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height- margin.bottom/3)
        .attr("text-anchor", "middle")
        .text("Year");
        
    // Left Y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "axisBlue")
        .call(d3.axisLeft(yScaleLeft));
    svg
        .append("text")
        .attr("x", -height/2)
        .attr("y", 22.22222)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .style("fill", "steelblue")
        .text("CO2 Emissions (g/km)"); 
    
    // Right Y axis
               
    svg.append("g")					
        .attr("transform", `translate(${width-margin.right},0)`)	
        .attr("class", "axisGreen")
        // .style("stroke", "green")		
        .call(d3.axisRight(yScaleRight));
    svg
        .append("text")
        // .attr("class", "axisGreen")
        .attr("x", height/2)
        .attr("y", -width+margin.right/2)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(90)`)
        .style("fill", "green")
        .text("Cost (Dollars per 100km)"); 

    // Title
    svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top/1.6)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("CO2 Emissions and Cost for Gasoline Vehicles");

    
}