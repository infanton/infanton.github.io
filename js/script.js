let currentYearIndex = 0;
const yearElement = d3.select('.year');
const imageElement = d3.select('.image');
const nameElement = d3.select('.name');
const title1Element = d3.select('#title1');
const title2Element = d3.select('#title2');
const title3Element = d3.select('#title3');
const description1Element = d3.select('#description1');
const description2Element = d3.select('#description2');
const description3Element = d3.select('#description3');
const link1Element = d3.select('#link1');
const link2Element = d3.select('#link2');
const link3Element = d3.select('#link3');
const chartContainer = d3.select('#chart');
let dataset;

function updateTimer(timeInSeconds) {
  const timerValueElement = document.getElementById('timer-value');
  timerValueElement.textContent = timeInSeconds;
}

let timerSeconds = 120;
function startTimer() {
  updateTimer(timerSeconds);

  const timerInterval = setInterval(() => {
    timerSeconds--;

    updateTimer(timerSeconds);

    if (timerSeconds === 0) {
      nextYear();
      timerSeconds = 120;
    }
  }, 1000);
}

function updateChart() {
  const currentYearData = dataset[currentYearIndex];
  yearElement.text(`Election Year: ${currentYearData.year}`);
  imageElement
    .html('')
    .append('img')
    .attr('src', `/img/${currentYearData.year}.jpeg`)
    .attr('alt', `${currentYearData.year} US President`)
    .attr('width', '250')
    .attr('height', '350');
  nameElement.text(currentYearData.name);
  title1Element.text(currentYearData.title1);
  description1Element.text(currentYearData.description1);
  link1Element
    .html('')
    .append('a')
    .attr('href', `${currentYearData.link1}`)
    .text('Source Link');
  title2Element.text(currentYearData.title2);
  description2Element.text(currentYearData.description2);
  link2Element
    .html('')
    .append('a')
    .attr('href', `${currentYearData.link2}`)
    .text('Source Link');
  title3Element.text(currentYearData.title3);
  description3Element.text(currentYearData.description3);
  link3Element
    .html('')
    .append('a')
    .attr('href', `${currentYearData.link3}`)
    .text('Source Link');

  chartContainer.selectAll('.dem-bar')
    .attr('fill', d => (d.year === currentYearData.year ? 'blue' : 'lightgrey'));

  chartContainer.selectAll('.rep-bar')
    .attr('fill', d => (d.year === currentYearData.year ? 'red' : 'lightgrey'));

}

function nextYear() {
  currentYearIndex = (currentYearIndex + 1) % dataset.length;
  updateChart();
}

function prevYear() {
  currentYearIndex = (currentYearIndex - 1 + dataset.length) % dataset.length;
  updateChart();
}

d3.csv('/data/us_election_results.csv').then(function (data) {

  dataset = data.map(d => ({
    year: +d.year, 
    dem: +d.dem,
    rep: +d.rep,
    name: d.name,
    title1: d.title1,
    title2: d.title2,
    title3: d.title3,
    description1: d.description1,
    description2: d.description2,
    description3: d.description3,
    link1: d.link1,
    link2: d.link2,
    link3: d.link3
  }));

  const margin = { top: 80, right: 20, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  dataset.sort((a, b) => a.year - b.year);

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(dataset.map(d => String(d.year))));

  const xScale = d3.scaleBand() 
    .domain(years)
    .range([0, width])
    .padding(0.1); 

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  svg.selectAll('.dem-bar')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'dem-bar')
    .attr('x', d => xScale(String(d.year)))
    .attr('y', d => yScale(d.dem))
    .attr('width', xScale.bandwidth() / 2)
    .attr('height', d => height - yScale(d.dem))
    .attr('fill', 'blue');

  svg.selectAll('.dem-description-text')
    .data(dataset)
    .enter()
    .append('text')
    .attr('class', 'dem-description-text')
    .attr('x', d => xScale(String(d.year)) + xScale.bandwidth() / 4) 
    .attr('y', d => yScale(d.dem) - 10) 
    .text(d => 'Dem.')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', 'black');

  svg.selectAll('.rep-bar')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'rep-bar')
    .attr('x', d => xScale(String(d.year)) + xScale.bandwidth() / 2)
    .attr('y', d => yScale(d.rep))
    .attr('width', xScale.bandwidth() / 2)
    .attr('height', d => height - yScale(d.rep))
    .attr('fill', 'red');

  svg.selectAll('.rep-description-text')
    .data(dataset)
    .enter()
    .append('text')
    .attr('class', 'rep-description-text')
    .attr('x', d => xScale(String(d.year)) + xScale.bandwidth() * 3 / 4) 
    .attr('y', d => yScale(d.rep) - 10) 
    .text(d => 'Rep.')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', 'black');

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)'); 

  svg.append('g')
    .call(d3.axisLeft(yScale));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .text('Democrat vs. Republican Vote Percentages by Year');

  startTimer(60);

  updateChart();

  const legend = svg.append('g')
    .attr('transform', `translate(${width - 100}, 20)`); 

  legend.append('rect')
    .attr('x', 0)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', 'blue');

  legend.append('text')
    .attr('x', 30)
    .attr('y', 10)
    .text('Democrats');

  legend.append('rect')
    .attr('x', 0)
    .attr('y', 20)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', 'red');

  legend.append('text')
    .attr('x', 30)
    .attr('y', 30)
    .text('Republicans');

}).catch(function (error) {
  console.error('Error loading CSV:', error);
});