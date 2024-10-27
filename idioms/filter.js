// Load the data
d3.json("data.json").then(data => {
    console.log(data);
    createFilters(data);
    createSlider(data);
    createEngineSizeSlider(data);
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
    // Create dropdown for fuel type
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

    // Create a placeholder option that is selected by default
    fuelDropdown.insert('option', ':first-child')
    .attr('value', 'All')
    .attr('disabled', true)
    .attr('selected', true)
    .text('Select Fuel Type');
    
    // Create dropdown for brand
    const brandDropdown = filterContainer.append('select')
    .attr('class', 'dropdown')
    .attr('id', 'brandDropdown')
    .on('change', function () {
        filterData(data);
    });

    // Add a placeholder option for brand
    brandDropdown.append('option')
    .attr('value', 'All')
    .attr('disabled', true)  // Make it unselectable
    .attr('selected', true)   // Make it selected by default
    .text('Select Brand');     // Placeholder text

    // Populate options for brand dropdown, including "All" option
    brandDropdown.selectAll('option.brand-option')
    .data(['All', ...new Set(data.map(d => d['MAKE']))])
    .enter()
    .append('option')
    .attr('class', 'brand-option')
    .attr('value', d => d)
    .text(d => d);
}
//     // Create dropdown for engine size
//     const engineSizeDropdown = filterContainer.append('select')
//     .attr('class', 'dropdown')
//     .attr('id', 'engineSizeDropdown')
//     .on('change', function () {
//         filterData(data);
//     });
    
//     // Add a placeholder option for engine size
//     engineSizeDropdown.append('option')
//     .attr('value', 'All')
//     .attr('disabled', true)  // Make it unselectable
//     .attr('selected', true)   // Make it selected by default
//     .text('Select Engine Size');     // Placeholder text

//     engineSizeDropdown.selectAll('option.size-option')
//     .data(['All', ...new Set(data.map(d => d['ENGINE SIZE']))])
//     .enter()
//     .append('option')
//     .attr('class', 'size-option')
//     .attr('value', d => d)
//     .text(d => d);
// }

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
    
    sliderContainer.append('text')
        .attr('class', 'slider-title')
        .text('Year Range')
        .style('display', 'block')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('text-align', 'center')
        .style('margin-bottom', '8px');
    // Create the slider labels
    sliderContainer.append('label')
        .attr('id', 'startYearLabel')
        .text(minYear);

    sliderContainer.append('label')
        .attr('id', 'endYearLabel')
        .text(maxYear);

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

    

    // Update the labels and filter the data as the sliders move
    function updateLabelAndFilter(data, selectedYears) {
        const [startYear, endYear] = selectedYears;

        d3.select('#startYearLabel').text(Math.round(startYear));
        d3.select('#endYearLabel').text(Math.round(endYear));

        const selectedFuel = d3.select('#fuelDropdown').property('value');
        const selectedBrand = d3.select('#brandDropdown').property('value');
        
        // Get year and engine size ranges from slider labels
        // const startYear = +d3.select('#startYearLabel').text();
        // const endYear = +d3.select('#endYearLabel').text();
   

        // console.log(`Filtering with: Fuel - ${selectedFuel}, Brand - ${selectedBrand}, Year Range - ${startYear} to ${endYear}, SIZE: ${startSize} to ${endSize}`);


        // Filter by year and engine size ranges
        let filteredData = data.filter(d => 
            d.YEAR >= startYear && d.YEAR <= endYear
            // d['ENGINE SIZE'] >= startSize && d['ENGINE SIZE'] <= endSize
        );

        // Filter further by fuel type and brand if not set to "All"
        if (selectedFuel !== 'All') {
            filteredData = filteredData.filter(d => d['FUEL'] === selectedFuel);
        }

        if (selectedBrand !== 'All') {
            filteredData = filteredData.filter(d => d['MAKE'] === selectedBrand);
        }
        
        // Update visualization with filtered data
        updateVisualizations(filteredData); 
    }
}


function createEngineSizeSlider(data) {
    const fixedWidth = window.innerWidth * 0.4;

    // Get the range of engine sizes from the data
    const engineSizes = data.map(d => d['ENGINE SIZE']);
    const minSize = d3.min(engineSizes);
    const maxSize = d3.max(engineSizes);

    // Create the slider container
    const sliderContainer = d3.select('.Filter')
        .append('div')
        .attr('class', 'slider-container');
    
    sliderContainer.append('text')
        .attr('class', 'slider-title')
        .text('Engine Size Range')
        .style('display', 'block')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('text-align', 'center')
        .style('margin-bottom', '8px');
    // Create the slider labels
    sliderContainer.append('label')
        .attr('id', 'startSizeLabel')
        .text(minSize);

    sliderContainer.append('label')
        .attr('id', 'endSizeLabel')
        .text(maxSize);

    // Create the SVG for the slider
    const svg = sliderContainer.append('svg')
        .attr('width', fixedWidth)
        .attr('height', 100);

    // Create the scale for the slider with one decimal place step
    const x = d3.scaleLinear()
        .domain([minSize, maxSize])
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

                // Snap to the nearest tenth (1 decimal place)
                const snappedPos = Math.round(pos * 10) / 10;

                if (Math.abs(snappedPos - handle1Pos) < Math.abs(snappedPos - handle2Pos)) {
                    handle.attr('cx', x(snappedPos));
                } else {
                    handle2.attr('cx', x(snappedPos));
                }

                const startSize = Math.min(x.invert(handle.attr('cx')), x.invert(handle2.attr('cx'))).toFixed(1);
                const endSize = Math.max(x.invert(handle.attr('cx')), x.invert(handle2.attr('cx'))).toFixed(1);

                updateSizeLabelAndFilter(data, [startSize, endSize]);
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
        .text(d => d.toFixed(1)); // Show tick labels with 1 decimal place

    const handle = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(minSize));

    const handle2 = slider.insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', x(maxSize));

    // Create the slider labels with one decimal place
    // sliderContainer.append('label')
    //     .attr('id', 'startSizeLabel')
    //     .text(minSize.toFixed(1));

    // sliderContainer.append('label')
    //     .attr('id', 'endSizeLabel')
    //     .text(maxSize);

    function updateSizeLabelAndFilter(data, selectedSizes) {
        // console.log('went into update size')
        const [startSize, endSize] = selectedSizes;

        d3.select('#startSizeLabel').text(startSize);
        d3.select('#endSizeLabel').text(endSize);
        
        const selectedFuel = d3.select('#fuelDropdown').property('value');
        const selectedBrand = d3.select('#brandDropdown').property('value');
        
        // Get year and engine size ranges from slider labels
        const startYear = +d3.select('#startYearLabel').text();
        const endYear = +d3.select('#endYearLabel').text();
   

        console.log(`Filtering with: Fuel - ${selectedFuel}, Brand - ${selectedBrand}, Year Range - ${startYear} to ${endYear}, SIZE: ${startSize} to ${endSize}`);


        // Filter by year and engine size ranges
        let filteredData = data.filter(d => 
            d.YEAR >= startYear && d.YEAR <= endYear &&
            d['ENGINE SIZE'] >= startSize && d['ENGINE SIZE'] <= endSize
        );

        // Filter further by fuel type and brand if not set to "All"
        if (selectedFuel !== 'All') {
            filteredData = filteredData.filter(d => d['FUEL'] === selectedFuel);
        }

        if (selectedBrand !== 'All') {
            filteredData = filteredData.filter(d => d['MAKE'] === selectedBrand);
        }
        
        // Update visualization with filtered data
        updateVisualizations(filteredData); 

        // filterData(data);
    }
}

function filterData(data) {

    console.log('went into filter')
    // Get the selected fuel type and brand
    const selectedFuel = d3.select('#fuelDropdown').property('value');
    const selectedBrand = d3.select('#brandDropdown').property('value');
    
    // Get year and engine size ranges from slider labels
    const startYear = +d3.select('#startYearLabel').text();
    const endYear = +d3.select('#endYearLabel').text();
    const startSize = +d3.select('#startSizeLabel').text();
    const endSize = +d3.select('#endSizeLabel').text();

    console.log(`Filtering with: Fuel - ${selectedFuel}, Brand - ${selectedBrand}, Year Range - ${startYear} to ${endYear}`);


    // Filter by year and engine size ranges
    let filteredData = data.filter(d => 
        d.YEAR >= startYear && d.YEAR <= endYear &&
        d['ENGINE SIZE'] >= startSize && d['ENGINE SIZE'] <= endSize
    );

    // Filter further by fuel type and brand if not set to "All"
    if (selectedFuel !== 'All') {
        filteredData = filteredData.filter(d => d['FUEL'] === selectedFuel);
    }

    if (selectedBrand !== 'All') {
        filteredData = filteredData.filter(d => d['MAKE'] === selectedBrand);
    }
    
    // Update visualization with filtered data
    updateVisualizations(filteredData); 
}
