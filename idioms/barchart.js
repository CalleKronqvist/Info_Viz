function createBarchart(data, containerId) {
    // Data pre-processing: Group by MAKE and calculate average EMISSIONS (CO2)
    const avgCO2ByMake = d3.rollup(
      data,
      (v) => d3.mean(v, d => d.EMISSIONS), // Calculate average EMISSIONS for each MAKE
      (d) => d.MAKE // Group by MAKE
    );
  
    // Convert the Map to an array and sort by the highest average EMISSIONS
    const sortedData = Array.from(avgCO2ByMake, ([make, avgCO2]) => ({
      make,
      avgCO2
    })).sort((a, b) => b.avgCO2 - a.avgCO2); // Sort descending by avgCO2
  
    console.log(sortedData); // Check the processed data
  
    // Core Bar Chart setup
    const width = window.innerWidth * 0.7;
    const height = 600;
  
    const margin = {
      top: 20,
      right: 60,
      bottom: 70,
      left: 150,  // Increase to fit long MAKE names
    };
  
    // Create the SVG container
    const svg = d3
      .select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    // Set up the yScale for MAKE (categorical)
    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.make)) // Use MAKE for y-axis
      .range([margin.top, height - margin.bottom])
      .padding(0.3); // Add padding between bars
  
    // Set up the xScale for EMISSIONS (CO2)
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.avgCO2)]) // Domain from 0 to max CO2
      .range([margin.left, width - margin.right]);
  
    // Create and append the bars
    svg
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.make)) // Align to MAKE
      .attr("height", yScale.bandwidth())    // Set bar height
      .attr("x", margin.left)                // Start from the left margin
      .attr("width", (d) => xScale(d.avgCO2) - margin.left)  // Width based on avgCO2
      .style("fill", "steelblue")
      .style("stroke", "black")
      .on("mouseover", function (event, d) {
        d3.select(this).style("cursor", "pointer").style("stroke-width", "3px");
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).style("stroke-width", "1px");
      })
      .on("click", function (event, d) {
        swal.fire("Average CO2 emissions: " + d.avgCO2.toFixed(2)); // Show avgCO2 on click
      });
  
    // Create and add x-axis (EMISSIONS)
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text("Average CO2 Emissions (g/km)");
  
    // Create and add y-axis (MAKE)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickSizeOuter(0));
  
    // Optionally, you can add a chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Average CO2 Emissions by Model (Proxy for Fuel Consumption)");
  }
  