// filter.js

// Load the data
d3.json("data.json").then(data => {
    createSlider(data);
});

function createSlider(data) {
    // Get the range of years from the data
    const years = data.map(d => d.YEAR);
    const minYear = d3.min(years);
    const maxYear = d3.max(years);

    // Create the slider container
    const sliderContainer = d3.select('.Filter')
        .append('div')
        .attr('class', 'slider-container');

    // Create the SVG for the slider
    const svg = sliderContainer.append('svg')
        .attr('width', 500)
        .attr('height', 100);

    // Create the scale for the slider
    const x = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, 400])
        .clamp(true);

    // Create the slider
    const slider = svg.append('g')
        .attr('class', 'slider')
        .attr('transform', 'translate(50,50)');

    slider.append('line')
        .attr('class', 'track')
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .style('stroke', '#000')
        .style('stroke-width', '2px')
        .style('stroke-linecap', 'round')
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-inset')
        .style('stroke', '#ddd')
        .style('stroke-width', '8px')
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-overlay')
        .style('pointer-events', 'stroke')
        .style('stroke-width', '50px')
        .style('stroke', 'transparent')
        .call(d3.drag()
            .on('start.interrupt', function () { slider.interrupt(); })
            .on('start drag', function (event) {
                const pos = x.invert(event.x);
                const handle1Pos = x.invert(handle.attr('cx'));
                const handle2Pos = x.invert(handle2.attr('cx'));

                if (Math.abs(pos - handle1Pos) < Math.abs(pos - handle2Pos)) {
                    handle.attr('cx', x(pos));
                } else {
                    handle2.attr('cx', x(pos));
                }

                const startYear = Math.min(handle1Pos, handle2Pos);
                const endYear = Math.max(handle1Pos, handle2Pos);

                updateLabelAndFilter(data, [startYear, endYear]);
            }));

    slider.insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .attr('transform', 'translate(0,18)')
        .selectAll('text')
        .data(x.ticks(10))
        .enter()
        .append('text')
        .attr('x', x)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(d => d);

    const handle = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(minYear));

    const handle2 = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(maxYear));

    // Create the slider labels
    sliderContainer.append('label')
        .attr('id', 'startYearLabel')
        .text(minYear);

    sliderContainer.append('label')
        .attr('id', 'endYearLabel')
        .text(maxYear);

    // Update the labels and filter the data as the sliders move
    function updateLabelAndFilter(data, selectedYears) {
        const [startYear, endYear] = selectedYears;

        d3.select('#startYearLabel').text(Math.round(startYear));
        d3.select('#endYearLabel').text(Math.round(endYear));

        filterData(data, [Math.round(startYear), Math.round(endYear)]);
    }
}

function filterData(data, selectedYears) {
    const [startYear, endYear] = selectedYears;
    const filteredData = data.filter(d => d.YEAR >= startYear && d.YEAR <= endYear);

    // Update the visualization with the filtered data
    updateVisualization(filteredData);
}

function updateVisualization(filteredData) {
    // Implement the logic to update your visualization with the filtered data

    console.log(filteredData);
}