  // Variables
  let currentYearIndex = 0;
  const yearElement = d3.select('.year');
  const imageElement = d3.select('.image');
  const nameElement = d3.select('.name');
  const descriptionElement = d3.select('.description');
  const chartContainer = d3.select('#chart');
  let dataset; // This will hold the loaded data
  
  // Function to update the chart with data for the current year
  function updateChart() {
    const currentYearData = dataset[currentYearIndex];
    yearElement.text(`Year: ${currentYearData.year}`);
    imageElement
      .html('')
      .append('img')
      .attr('src', `/img/${currentYearData.year}.jpeg`)
      .attr('alt', `${currentYearData.year} US President`)
    nameElement.text(currentYearData.name);
    descriptionElement.text(currentYearData.description);
  }
  
  // Function to move to the next year in the dataset
  function nextYear() {
    currentYearIndex = (currentYearIndex + 1) % dataset.length;
    updateChart();
  }
  
  // Function to move to the previous year in the dataset
  function prevYear() {
    currentYearIndex = (currentYearIndex - 1 + dataset.length) % dataset.length;
    updateChart();
  }
  
// Read data from CSV file
d3.csv('/data/us_election_results.csv').then(function(data) {
  // Parse the data and store it in the dataset variable
  dataset = data.map(d => ({
    year: +d.year, // Convert the year to a number
    dem: +d.dem,
    rep: +d.rep,
    name: d.name,
    description: d.description
  }));

  // Set up chart dimensions and margins
  const margin = { top: 80, right: 20, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Sort the dataset by the "year" field
  dataset.sort((a, b) => a.year - b.year);
  
        // Create an SVG element
      const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Get unique years from the data
    const years = Array.from(new Set(dataset.map(d => String(d.year))));
  
    // Create x and y scales
    const xScale = d3.scalePoint() // Use scalePoint for evenly spaced x-axis labels
      .domain(years)
      .range([0, width]);
  
    const yScale = d3.scaleLinear()
      .domain([0, 100]) // Assume percentages range from 0 to 100
      .range([height, 0]);
  
    // Create line generators for Democrats and Republicans
    const lineDem = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.dem))
      .curve(d3.curveMonotoneX);
  
    const lineRep = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.rep))
      .curve(d3.curveMonotoneX);
  
    // Append path elements for the lines
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('d', lineDem);
  
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('d', lineRep);
  
    // Add x-axis
   // Add x-axis with rotated tick labels
   svg.append('g')
   .attr('transform', `translate(0,${height})`)
   .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10))
   .selectAll('text')
   .style('text-anchor', 'end')
   .attr('dx', '-.8em')
   .attr('dy', '.15em')
   .attr('transform', 'rotate(-45)'); // Rotate the tick labels
  
    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
  
    // Add a title (optional)
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top / 2)
      .attr('text-anchor', 'middle')
      .text('Democrat vs. Republican Vote Percentages by Year');

  // Initial call to update the chart
  updateChart();

  // Interval to automatically move to the next year every few seconds (adjust as needed)
  setInterval(nextYear, 3000); // Move to the next year every 3 seconds
}).catch(function(error) {
  // Handle any errors that occurred while loading the CSV file
  console.error('Error loading CSV:', error);
});