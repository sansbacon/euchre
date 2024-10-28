// Define constants
const playbackSpeedFactor = 20

// Fetch the event data
fetch('./events.json')
  .then(response => response.json())
  .then(data => {
    const events = data.events;
    populateNavbar(events);

    // Load first event
    // TODO: add to function
    const firstEvent = document.querySelector('.event-item');
    firstEvent.click()  
  })
  .catch(error => console.error('Error fetching data:', error));

// Populate the navbar with unique events
function populateNavbar(events) {
  const navbar = document.getElementById('navbar');
  events.forEach(event => {
    const eventButton = document.createElement('div');
    eventButton.textContent = event.event;
    eventButton.className = 'event-item';
    eventButton.onclick = () => simulateRace(event);
    navbar.appendChild(eventButton);
  });
}

// Update lanes when an event is clicked
function updateLanes(selectedEvent) {
  const pool = document.getElementById('pool');
  // TODO: add to function
  if (selectedEvent.sport === 'Athletics') {
    pool.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--pool-athletics-color');
  } else {
    pool.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--pool-swimming-color');
  }
  
  pool.innerHTML = ''; // Clear existing lanes

  selectedEvent.results.forEach(result => {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.id = `lane-${result.lane}`
    
    const laneLabel = document.createElement('div');
    laneLabel.className = 'lane-label';
    laneLabel.textContent = result.athlete; // Set athlete's name
    
    // Dot that moves along the lane
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = `dot-${result.lane}`;

    const totalTimeLabel = document.createElement('div');
    totalTimeLabel.className = 'total-time';
    totalTimeLabel.id = `total-time-${result.lane}`;
    // totalTimeLabel.textContent = result.timeSeconds.toFixed(2); // Set timeSeconds
    
    lane.appendChild(laneLabel);
    lane.appendChild(totalTimeLabel);
    lane.appendChild(dot);

    pool.appendChild(lane);
  });
}

// Animate a dot in its lane
function animateDot(dot, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor) {
  // Initialise counter
  let lapsCompleted = 0;

  // Calculate lap distance
  const poolWidth =  getComputedStyle(document.documentElement).getPropertyValue('--pool-width')
  const dotSize =  getComputedStyle(document.documentElement).getPropertyValue('--dot-size')
  const dotLeft = getComputedStyle(document.querySelector('.dot')).getPropertyValue('left')
  const lapDistance = parseInt(poolWidth) - parseInt(dotLeft) - parseInt(dotSize);

  // Calculate animation time
  const totalClockTime = totalTime / playbackSpeedFactor // animation time

  function completeNextLap() {
    // Last lap: set time label and exit function
    if (lapsCompleted >= totalLaps) {
      totalTimeElement.textContent = `${totalTime.toFixed(2)}`;
      return;
    }

    // Determine the position based on lap
    const newPosition = lapsCompleted % 2 === 0 ? lapDistance : 0;
    dot.style.transitionDuration = `${totalClockTime / totalLaps}s`;
    dot.style.transform = `translateX(${newPosition}px)`;

    // Move the dot and increment laps count
    setTimeout(() => {
      lapsCompleted++;
      completeNextLap(); // Continue to the next lap
    }, (totalClockTime / totalLaps) * 1000);
  }

  completeNextLap();
}


// Simulate the race
function simulateRace(event) {

  updateLanes(event)

  const totalLaps = event.laps
  const dots = document.querySelectorAll('.dot');

  // Move each dot
  dots.forEach((dot, index) => {
    
    const result = event.results[index]
    
    // const totalTime = 1 + Math.random();
    const totalTime = result.timeSeconds;
    const totalTimeElement = document.getElementById(`total-time-${index + 1}`);
    animateDot(dot, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor);
  })
}