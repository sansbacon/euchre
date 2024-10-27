// Define constants
const totalLaps = 2
const totalLanes = 8
const playbackSpeedFactor = 1

// Fetch the event data
fetch('./events.json')
  .then(response => response.json())
  .then(data => {
    const events = data.events;
    populateNavbar(events);
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

// Function to create lanes dynamically
function createLanes(totalLanes) {
  const pool = document.getElementById('pool');
  for (let i = 1; i <= totalLanes; i++) {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.id = `lane-${i}`;
    
    // Lane label (competitor name)
    const laneLabel = document.createElement('div');
    laneLabel.className = 'lane-label';
    laneLabel.textContent = `200F_${i}`;
    
    // Dot that moves along the lane
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = `dot-${i}`;
    
    // Total time label that displays at the end
    const totalTimeLabel = document.createElement('div');
    totalTimeLabel.className = 'total-time';
    totalTimeLabel.id = `total-time-${i}`;
    
    lane.appendChild(laneLabel);
    lane.appendChild(dot);
    lane.appendChild(totalTimeLabel);
    
    pool.appendChild(lane);
  }
}

// Function to animate a dot in its lane
function animateDot(dot, poolWidth, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor) {
  let lapsCompleted = 0;
  const lapDistance = poolWidth - 100; // Total distance minus dot's start position
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

// Create the lanes
// createLanes(totalLanes);

// Get page elements
function simulateRace(event) {
  updateLanes(event)
  const totalLaps = event.laps
  const pool = document.getElementById('pool');
  const poolWidth = pool.offsetWidth;
  const dots = document.querySelectorAll('.dot');

  // Move each dot
  dots.forEach((dot, index) => {
    const totalTime = 1 + Math.random();
    const totalTimeElement = document.getElementById(`total-time-${index + 1}`);
    animateDot(dot, poolWidth, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor);
  })
}