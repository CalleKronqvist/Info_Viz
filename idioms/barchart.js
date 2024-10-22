/* Dimensions */
let fixedWidth = window.innerWidth * 0.4;
let fixedHeight = 400;

let margin = {
  top: 30,
  right: 60,
  bottom: 60,
  left: 200,  // Increase to fit long model names
};

async function createBarchart(data, containerId) {

  await d3.json("../colorPalette.json").then((c) => {
    colorPalette = c;

    /* Pre-process*/


    // Create a color scale based on VEHICLE CLASS
    // const colorScale = d3.scaleOrdinal()
    //   .domain(vehicleClasses)   // The domain is the unique vehicle classes
    //   .range(colorPalette);     // The range is the color palette you've provided

    let sortedData = d3.groups(data, d => d.MODEL)
      .map(([model, values]) => ({
          model: model,
          emissions: d3.mean(values, d => d['EMISSIONS']),
          vehicleClass: values[0]['VEHICLE CLASS'], // Assuming the vehicle class is the same for all instances of a model
          brand: values[0]['MAKE'] // Assuming the brand is the same for all instances of a model
      }))
      .sort((a, b) => b.emissions - a.emissions) // Sort by highest emissions
      .slice(0, 10); // changed this to 10 for now for better display

    /* Scales */
    // Set up the xScale for EMISSIONS (CO2)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.emissions)]) // Domain from 0 to max CO2
      .range([margin.left, fixedWidth - margin.right]);

    // Set up the yScale for MODEL (categorical)
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.model)) // Use MODEL for y-axis
      .range([margin.top, fixedHeight - margin.bottom])
      .padding(0.3); // Add padding between bars

    /* SVG container */
    const svg = d3
      .select(containerId)
      .append("svg")
      .attr("width", fixedWidth)
      .attr("height", fixedHeight);

    // Create and append the bars
    svg
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.model)) // Align to MODEL
      .attr("height", yScale.bandwidth())    // Set bar height
      .attr("x", margin.left)                // Start from the left margin
      .attr("width", (d) => xScale(d.emissions) - margin.left)  // Width based on emissions
      .attr("fill", (d) => colorPalette[d.vehicleClass])      // Color based on VEHICLE CLASS
      .style("stroke", "black")
      .on("mouseover", function (event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Model: ${d.model}<br/>Emissions: ${d.emissions}<br/>Brand: ${d.brand}<br/>Vehicle Class: ${d.vehicleClass}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add tooltip div
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    /* Axes */
    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${fixedHeight - margin.bottom})`)
      .call
      (
        d3.axisBottom(xScale)
          .tickSizeOuter(0)
      );
    // X-label
    svg
      .append("text")
      .attr("x", fixedWidth / 2)
      .attr("y", fixedHeight - margin.bottom / 3)
      .attr("text-anchor", "middle")
      .text("CO2 Emissions (g/km)");

    // Y-Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale).tickSizeOuter(0)
      );

    // Y-label
    // Swap x/y and set x to negative for rotate to work
    svg
      .append("text")
      .attr("x", -fixedHeight / 2)
      .attr("y", margin.left / 8)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .text("Model");

    // Title
    svg
      .append("text")
      .attr("x", fixedWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Top Models by CO2 Emissions");
  });
}

async function updateBarchart(data) {

  await d3.json("../colorPalette.json").then((c) => {
    colorPalette = c;

    // Get unique vehicle classes
    const vehicleClasses = Array.from(new Set(data.map(d => d['VEHICLE CLASS'])));

    // Create a color scale based on VEHICLE CLASS
    const colorScale = d3.scaleOrdinal()
      .domain(vehicleClasses)   // The domain is the unique vehicle classes
      .range(colorPalette);     // The range is the color palette you've provided

    let sortedData = d3.groups(data, d => d.MODEL)
      .map(([model, values]) => ({
          model: model,
          emissions: d3.mean(values, d => d['EMISSIONS']),
          vehicleClass: values[0]['VEHICLE CLASS'], // Assuming the vehicle class is the same for all instances of a model
          brand: values[0]['MAKE'] // Assuming the brand is the same for all instances of a model
      }))
      .sort((a, b) => b.emissions - a.emissions) // Sort by highest emissions
      .slice(0, 10); // changed this to 10 for now for better display


    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.emissions)]) // Domain from 0 to max CO2
      .range([margin.left, fixedWidth - margin.right]);

    // Set up the yScale for MODEL (categorical)
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.model)) // Use MODEL for y-axis
      .range([margin.top, fixedHeight - margin.bottom])
      .padding(0.3); // Add padding between bars

    // remove all existing bars 
    d3
      .selectAll(".BarChart > *")
      .remove();

    /* SVG container */
    const svg = d3
      .select(".BarChart")
      .append("svg")
      .attr("width", fixedWidth)
      .attr("height", fixedHeight);

    // Create and append the bars
    svg
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.model)) // Align to MODEL
      .attr("height", yScale.bandwidth())    // Set bar height
      .attr("x", margin.left)                // Start from the left margin
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.emissions) - margin.left)  // Width based on emissions
      .style("fill", (d) => colorPalette[d.vehicleClass])        // Color based on VEHICLE CLASS
      .style("stroke", "black")

    svg.selectAll(".bar")
      .on("mouseover", function (event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Model: ${d.model}<br/>Emissions: ${d.emissions}<br/>Brand: ${d.brand}<br/>Vehicle Class: ${d.vehicleClass}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add tooltip div
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    /* Axes */
    // X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${fixedHeight - margin.bottom})`)
      .call
      (
        d3.axisBottom(xScale)
          .tickSizeOuter(0)
      );
    // X-label
    svg
      .append("text")
      .attr("x", fixedWidth / 2)
      .attr("y", fixedHeight - margin.bottom / 3)
      .attr("text-anchor", "middle")
      .text("CO2 Emissions (g/km)");

    // Y-Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale).tickSizeOuter(0)
      );

    // Y-label
    // Swap x/y and set x to negative for rotate to work
    svg
      .append("text")
      .attr("x", -fixedHeight / 2)
      .attr("y", margin.left / 8)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90)`)
      .text("Model");

    // Title
    svg
      .append("text")
      .attr("x", fixedWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Top Models by CO2 Emissions");
  })
}