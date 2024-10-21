// idioms/violinchart.js

async function createViolinchart(data, containerId) {
    /* Dimensions */
    let fixedWidth = window.innerWidth * 0.4;
    let fixedHeight = 400;
    let margin = {
        top: 30,
        right: 60,
        bottom: 60,
        left: 60,
    };

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
            .slice(0, 5)
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
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // x-axis labels   
        svg.append("g")
            .attr("transform", `translate(0,${fixedHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("class", "axis-label")
            // .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(yScale));

        // Kernel density estimation
        const kde = (kernel, xValues, data) => {
            return xValues.map(x => [x, d3.mean(data, d => kernel(x - d))]);
        };

        const kernelEpanechnikov = bandwidth => {
            return function (x) {
                return Math.abs(x / bandwidth) <= 1 ? 0.75 * (1 - (x / bandwidth) ** 2) / bandwidth : 0;
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
                .x0(d => xScale(cl) - d[1] * violinWidth / 2)  // Left side of violin
                .x1(d => xScale(cl) + d[1] * violinWidth / 2)  // Right side of violin
                .y(d => yScale(d[0]))  // Emissions (y-axis)
                .curve(d3.curveBasis);  // Smooth curve

            svg.append("path")
                .datum(density)
                .attr("class", "violin")
                .attr("d", area)
                .style("fill", colorPalette[cl])  // Apply color scale based on vehicle class
                .style("stroke", "black");
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

    /* TODO ONCE MAIN FUNCTION WORKS PROPERLY */

}