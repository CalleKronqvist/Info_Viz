// idioms/violinchart.js

async function createViolinchart(data, containerId) {
    /* Dimensions */
    let fixedWidth = window.innerWidth * 0.45;
    let fixedHeight = 400;
    let margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 60,
    };

    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    await d3.json("../colorPalette.json").then((c) => {

        const colorPalette = c;
        let sortedData = data
            .map(d => ({
                model: d.MODEL,
                emissions: d['EMISSIONS'],
                vehicleClass: d['VEHICLE CLASS'],
                brand: d['MAKE']
            }))


        const classes = Array
            .from(new Set(sortedData.map(d => d.vehicleClass)))
            .slice(0, 3)
        // .slice((sortedData) => {
        //     return sortedData.length > 5 ? (0, 5) : (0, sortedData.length);
        // });

        console.log(classes);

        // Create X axis
        const xScale = d3
            .scaleBand()
            .domain(classes)
            // .range([margin.left, fixedWidth - margin.right]);
            .range([0, fixedWidth])
            .padding(0.1);

        // Create Y axis
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(sortedData, d => d.emissions)])  // Adjust this range based on your dataset
            .range([fixedHeight - margin.bottom, margin.top]);

        // plot container
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", fixedWidth)
            .attr("height", fixedHeight)
            .append("g")
            .attr("transform", `translate(${margin.left})`);

        // x-axis labels   
        svg.append("g")
            .attr("transform", `translate(0,${fixedHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("class", "axis-label")
            // .attr("transform", `translate(${margin.left/2},0)`)
            // .attr("transform", "rotate(-30)")
            .style("text-anchor", "middle");
            

        svg.append("g").call(d3.axisLeft(yScale));

        // Kernel density estimation
        const kde = (kernel, xValues, data) => {
            return xValues.map(x => [x, d3.mean(data, d => kernel(x - d))]);
        };

        const kernelEpanechnikov = bandwidth => {
            return function (x) {
                res = Math.abs(x / bandwidth) <= 1 ? 0.75 * (1 - (x / bandwidth) ** 2) / bandwidth : 0;
                return res * 30;
            };
        };

        const bandwidth = 10;
        const xDensity = d3.range(0, d3.max(sortedData, d => d.emissions), 1);  // Values for KDE

        // For each vehicle class, compute the density
        classes.forEach(cl => {
            const emissions = sortedData.filter(d => d.vehicleClass === cl).map(d => d.emissions);
            const density = kde(kernelEpanechnikov(bandwidth), xDensity, emissions);

            // Create violin path
            const violinWidth = xScale.bandwidth();  // Adjust this for wider or narrower violins

            // Area generator for violin plot, symmetric on both sides of the x-axis
            const area = d3.area()
                .x0(d => xScale(cl) + violinWidth /2 - d[1] * violinWidth / 2)  // Left side of violin
                .x1(d => xScale(cl) + violinWidth  /2 + d[1] * violinWidth / 2)  // Right side of violin
                .y(d => yScale(d[0]))  // Emissions (y-axis)
                .curve(d3.curveBasis);  // Smooth curve

            const path = svg.append("path")
                .datum(density)
                .attr("class", "violin")
                .attr("d", area)
                .style("fill", colorPalette[cl])  // Apply color scale based on vehicle class
                .style("stroke", "black");
            
            // Tooltip interaction
            path.on("mouseenter", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
                const [mouseX, mouseY] = d3.pointer(event);
                tooltip.html(`
                    <b>Vehicle Class:</b> ${cl}<br>
                    <b>CO2 Emissions:</b><br>
                    Max: ${d3.max(emissions)} g/km<br>
                    Min: ${d3.min(emissions)} g/km<br>
                    Median: ${d3.median(emissions)} g/km<br>
                    Mean: ${d3.mean(emissions).toFixed(2)} g/km<br>
                    `)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseleave", function () {
                tooltip.transition().duration(200).style("opacity", 0);
            });
            
            

            // Title
            svg
                .append("text")
                .attr("x", fixedWidth / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("Distribution of CO2 Emissions per Vehicle Class");
            
            // Y-Axis
            svg
                .append("text")
                .attr("x", -fixedHeight/2)
                .attr("y",-margin.left/1.5)
                .attr("text-anchor", "middle")
                .attr("transform", `rotate(-90)`)
                .text("CO2 Emissions (g/km)");
            // X-Axis
            svg
                .append("text")
                .attr("x", fixedWidth / 2)
                .attr("y", fixedHeight - margin.bottom / 3)
                .attr("text-anchor", "middle")
                .text("Vehicle Class");

        });
    });
    
}

async function updateViolinChart(filteredData) {
    /* Dimensions */
    let fixedWidth = window.innerWidth * 0.4;
    let fixedHeight = 400;
    let margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 60,
    };
    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    await d3.json("../colorPalette.json").then((c) => {

        const colorPalette = c;

        let sortedData = filteredData
            .map(d => ({
                model: d.MODEL,
                emissions: d['EMISSIONS'],
                vehicleClass: d['VEHICLE CLASS'],
                brand: d['MAKE']
            }))

        console.log(sortedData);


        const classes = Array
            .from(new Set(sortedData.map(d => d.vehicleClass)))
            .slice(0, 3)
        // .slice((sortedData) => {
        //     return sortedData.length > 5 ? (0, 5) : (0, sortedData.length);
        // });

        console.log(classes);

        d3.selectAll(".ViolinChart > svg").remove();

        // Create X axis
        const xScale = d3
            .scaleBand()
            .domain(classes)
            // .range([margin.left, fixedWidth - margin.right]);
            .range([0, fixedWidth])
            .padding(0.1);

        // Create Y axis
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(sortedData, d => d.emissions)])  // Adjust this range based on your dataset
            .range([fixedHeight - margin.bottom, margin.top]);

        // plot container
        const svg = d3.select(".ViolinChart")
            .append("svg")
            .attr("width", fixedWidth)
            .attr("height", fixedHeight)
            .append("g")
            .attr("transform", `translate(${margin.left})`);

        // x-axis labels   
        svg.append("g")
            .attr("transform", `translate(0,${fixedHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("class", "axis-label")
            // .attr("transform", "rotate(-30)")
            .style("text-anchor", "middle");

        svg
            .append("g")
            .call(d3.axisLeft(yScale));

        // Kernel density estimation
        const kde = (kernel, xValues, data) => {
            return xValues.map(x => [x, d3.mean(data, d => kernel(x - d))]);
        };

        const kernelEpanechnikov = bandwidth => {
            return function (x) {
                res = Math.abs(x / bandwidth) <= 1 ? 0.75 * (1 - (x / bandwidth) ** 2) / bandwidth : 0;
                return res * 30;
            };
        };

        const bandwidth = 10;
        const xDensity = d3.range(0, d3.max(sortedData, d => d.emissions), 1);  // Values for KDE

        // For each vehicle class, compute the density
        classes.forEach(cl => {
            console.log(cl);

            const emissions = sortedData.filter(d => d.vehicleClass === cl).map(d => d.emissions);
            const density = kde(kernelEpanechnikov(bandwidth), xDensity, emissions);

            // Create violin path
            const violinWidth = xScale.bandwidth();  // Adjust this for wider or narrower violins

            // Area generator for violin plot, symmetric on both sides of the x-axis
            const area = d3.area()
                .x0(d => xScale(cl) + violinWidth /2 - d[1] * violinWidth / 2)  // Left side of violin
                .x1(d => xScale(cl) + violinWidth /2 + d[1] * violinWidth / 2)  // Right side of violin
                .y(d => yScale(d[0]))  // Emissions (y-axis)
                .curve(d3.curveBasis)  // Smooth curve

            // Initialize path
            const path = svg.append("path")
                .datum(density)
                .attr("class", "violin")
                .attr("d", area)
                .style("fill", "#FFFFFF")  // Initially set to white for smoother transition
                .style("stroke", "#FFFFFF");  // Initially set to white for smoother transition
            
            // Add tooltip hover events before applying the transition or it will break
            path.on("mouseenter", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 1);
            })
            .on("mousemove", function (event, d) {
                const [mouseX, mouseY] = d3.pointer(event);
                tooltip.html(`
                    <b>Vehicle Class:</b> ${cl}<br>
                    <b>CO2 Emissions:</b><br>
                    Max: ${d3.max(emissions)} g/km<br>
                    Min: ${d3.min(emissions)} g/km<br>
                    Median: ${d3.median(emissions)} g/km<br>
                    Mean: ${d3.mean(emissions).toFixed(2)} g/km<br>
                    `)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseleave", function () {
                tooltip.transition().duration(200).style("opacity", 0);
            });
            
            // Transition
            path.transition()
                .duration(1000)
                .style("fill", colorPalette[cl])  // Apply color scale based on vehicle class
                .style("stroke", "black");
            });

            
    
            // Title
            svg
                .append("text")
                .attr("x", fixedWidth / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text("Distribution of CO2 Emissions per Vehicle Class");
                
             // Y-Axis
             svg
                 .append("text")
                 .attr("x", -fixedHeight/2)
                 .attr("y",-margin.left/1.5)
                 .attr("text-anchor", "middle")
                 .attr("transform", `rotate(-90)`)
                 .text("CO2 Emissions (g/km)");
             // X-Axis
             svg
                 .append("text")
                 .attr("x", fixedWidth / 2)
                 .attr("y", fixedHeight - margin.bottom / 3)
                 .attr("text-anchor", "middle")
                 .text("Vehicle Class");
        
    });
}   