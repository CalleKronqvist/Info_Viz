function createBarchart(data, containerId) {

  /* Pre-process*/

  // Define the color palette
  const colorPalette = [
    "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", 
    "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", 
    "#ffff99", "#b15928"
  ];

  // Get unique vehicle classes
  const vehicleClasses = Array.from(new Set(data.map(d => d['VEHICLE CLASS'])));

  // Create a color scale based on VEHICLE CLASS
  const colorScale = d3.scaleOrdinal()
    .domain(vehicleClasses)   // The domain is the unique vehicle classes
    .range(colorPalette);     // The range is the color palette you've provided

  let sortedData = data
    .map(d => ({
      model: d.MODEL,               // Use MODEL for y-axis
      emissions: d['EMISSIONS'],    // Use EMISSIONS for x-axis
      vehicleClass: d['VEHICLE CLASS'],  // Get vehicle class for color mapping
      brand: d['MAKE']              // brand for on-click event
    }))
    .sort((a, b) => b.emissions - a.emissions) // Sort by highest emissions
    .slice(0, 30);
  console.log(sortedData); // Check the processed data

  /* Dimensions */
  const width = window.innerWidth * 0.5;
  const height = 400;

  const margin = {
    top: 30,
    right: 60,
    bottom: 60,
    left: 200,  // Increase to fit long model names
  };

  /* Scales */
  // Set up the xScale for EMISSIONS (CO2)
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, (d) => d.emissions)]) // Domain from 0 to max CO2
    .range([margin.left, width - margin.right]);

  // Set up the yScale for MODEL (categorical)
  const yScale = d3
    .scaleBand()
    .domain(sortedData.map((d) => d.model)) // Use MODEL for y-axis
    .range([margin.top, height - margin.bottom])
    .padding(0.3); // Add padding between bars

  /* SVG container */
  const svg = d3
    .select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

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
    .style("fill", (d) => colorScale(d.vehicleClass))         // Color based on VEHICLE CLASS
    .style("stroke", "black")
    .on("mouseover", function (event, d) {
      d3.select(this).style("cursor", "pointer").style("stroke-width", "3px");
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).style("stroke-width", "1px");
    })
    .on("click", function (event, d) {
      swal.fire({title: d.brand +" " + d.model,
                html: "CO2 emissions: " + d.emissions.toFixed(2) + " g/km <br />" + "Class: " + d.vehicleClass
      }
    ); // Show emissions on click
    });

  /* Axes */
  // X-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call
      (
        d3.axisBottom(xScale)
    .tickSizeOuter(0)
  );
  // X-label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom/3)
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
    .attr("x", -height/2)
    .attr("y", margin.left/8)
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .text("Model");

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top/2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Top Models by CO2 Emissions");
}
