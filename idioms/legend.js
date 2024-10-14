function createLegend(data,containerId){
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

    width = window.innerWidth;
    height = 100;
    const margin = {
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
    const selectedClasses = new Set();

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
            .style("fill", colorScale(vehicleClass))
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
            if (!selectedClasses.has(d3.select(this).datum())){
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
            
                console.log("Selected vehicle classes:", Array.from(selectedClasses));
            });

    })}