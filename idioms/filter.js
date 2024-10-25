// Load the data
d3.json("data.json").then(data => {
    console.log(data);
    createFilters(data);
    createSlider(data);
});

function createFilters(data) {
    const filterContainer = d3.select('.Filter')
        .append('div')
        .attr('class', 'filter-container');

    // Define a mapping for fuel types based on dataset codes
    const fuelTypeMap = {
        'X': 'Regular Gasoline',
        'Z': 'Premium Gasoline',
        'D': 'Diesel',
        'E': 'Ethanol (E85)',
        'N': 'Natural Gas'
    };
    // Create dropdown for vehicle class
    const fuelDropdown = filterContainer.append('select')
        .attr('class', 'dropdown')
        .attr('id', 'fuelDropdown')
        .on('change', function () {
            filterData(data);
        });

    fuelDropdown.selectAll('option')
        .data(['All', ...new Set(data.map(d => d['FUEL']))])
        .enter()
        .append('option')
        .attr('value', d => d) 
        .text(d => d === 'All' ? 'All' : (fuelTypeMap[d] || d));  // Display mapped name or original if not found


    // Create dropdown for brand
    const brandDropdown = filterContainer.append('select')
        .attr('class', 'dropdown')
        .attr('id', 'brandDropdown')
        .on('change', function () {
            filterData(data);
        });

    brandDropdown.selectAll('option')
        .data(['All', ...new Set(data.map(d => d['MAKE']))])
        .enter()
        .append('option')
        .text(d => d);

    // Create dropdown for model
    const engineSizeDropdown = filterContainer.append('select')
        .attr('class', 'dropdown')
        .attr('id', 'engineSizeDropdown')
        .on('change', function () {
            filterData(data);
        });

    engineSizeDropdown.selectAll('option')
        .data(['All', ...new Set(data.map(d => d['ENGINE SIZE']))])
        .enter()
        .append('option')
        .text(d => d);
}

function createSlider(data) {

    const fixedWidth = window.innerWidth * 0.4;
    //const height = 400;



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
        .attr('width', fixedWidth)
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

                // Snap to the nearest year
                const snappedPos = Math.round(pos);

                if (Math.abs(snappedPos - handle1Pos) < Math.abs(snappedPos - handle2Pos)) {
                    handle.attr('cx', x(snappedPos));
                } else {
                    handle2.attr('cx', x(snappedPos));
                }

                const startYear = Math.min(x.invert(handle.attr('cx')), x.invert(handle2.attr('cx')));
                const endYear = Math.max(x.invert(handle.attr('cx')), x.invert(handle2.attr('cx')));

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


function filterData(data) {

    // get the other filters/sliders
    const selectedFuel = d3.select('#fuelDropdown').property('value');
    const selectedBrand = d3.select('#brandDropdown').property('value');
    const selectedEngineSize = d3.select('#engineSizeDropdown').property('value');
    const startYear = +d3.select('#startYearLabel').text();
    const endYear = +d3.select('#endYearLabel').text();

    let filteredData = data.filter(d => d.YEAR >= startYear && d.YEAR <= endYear);

    if (selectedFuel !== 'All') {
        filteredData = filteredData.filter(d => d['FUEL'] === selectedFuel);
    }

    if (selectedBrand !== 'All') {
        filteredData = filteredData.filter(d => d['MAKE'] === selectedBrand);
    }

    if (selectedEngineSize !== 'All') {
        filteredData = filteredData.filter(d => d['ENGINE SIZE'] === selectedEngineSize);
    }

    if (selectedClasses.size > 0) {
        filteredData = filteredData.filter(d => selectedClasses.has(d['VEHICLE CLASS']));
    }

    // Update the visualization with the filtered data
    updateVisualizations(filteredData);
}