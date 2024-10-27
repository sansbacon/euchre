const totalLaps = 2
const totalLanes = 8
const playbackSpeedFactor = 1


// Create lanes dynamically
function createLanes() {
  const pool = document.getElementById('pool');
  for (let i = 1; i <= totalLanes; i++) {
    const lane = document.createElement('div');
    lane.className = 'lane';
    lane.id = `lane-${i}`;
    
    const laneLabel = document.createElement('div');
    laneLabel.className = 'lane-label';
    laneLabel.textContent = `200F_${i}`;
    
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = `dot-${i}`;
    
    const totalTimeLabel = document.createElement('div');
    totalTimeLabel.className = 'total-time';
    totalTimeLabel.id = `time-${i}`;
    
    lane.appendChild(laneLabel);
    lane.appendChild(dot);
    lane.appendChild(totalTimeLabel);
    
    pool.appendChild(lane);
  }
}

// Helper function to create a random time between 3 and 4 seconds
function getRandomTime() {
  return 1 + Math.random();
}

// Function to animate a dot in its lane
function animateDot(dot, time, poolWidth, totalTimeElement) {
  let laps = 0;
  const distance = poolWidth - 100; // Total distance minus dot's start position (left margin of 60px + dot width of 20px)

  screenTime = time / playbackSpeedFactor

  function move() {
    if (laps >= totalLaps) {
      totalTimeElement.textContent = `${time.toFixed(2)}`;
      return;
    }

    // Determine the position based on lap
    const position = laps % 2 === 0 ? distance : 0;
    dot.style.transitionDuration = `${screenTime / totalLaps}s`;
    dot.style.transform = `translateX(${position}px)`;

    // Move the dot and increment laps count
    setTimeout(() => {
      laps++;
      move(); // Continue to the next lap
    }, (screenTime / totalLaps) * 1000); // Wait half the time before each lap move
  }

  move();
}


createLanes();


const pool = document.getElementById('pool');
const poolWidth = pool.offsetWidth;
const dots = document.querySelectorAll('.dot');

dots.forEach((dot, index) => {
  let time;
  if (index === 0) time = 2;       // 200F_1 lane
  else if (index === 1) time = 1.5;   // 200F_2 lane
  else time = getRandomTime();      // Random time between 3 and 4 for others

  const totalTimeElement = document.getElementById(`time-${index + 1}`);
  animateDot(dot, time, poolWidth, totalTimeElement);
});