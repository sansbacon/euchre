// Define constants
const playbackSpeedFactor = 50

// Fetch the event data
fetch('./events.json')
  .then(response => response.json())
  .then(data => {
    const events = data.events;
    populateNavbar(events);
    clickFirstEvent();
  })
  .catch(error => console.error('Error fetching data:', error));

/** Populates the navbar with the event labels
 * 
 * @param {list} events - List of events from the json
 */
function populateNavbar(events) {
  const navbar = document.getElementById('navbar');

  events.forEach(event => {
    const eventButton = document.createElement('div');
    eventButton.textContent = event.event;
    eventButton.className = 'event-label';
    eventButton.onclick = () => simulateEvent(event);
    navbar.appendChild(eventButton);
  });
}

/**
 * Loads the first event by clicking its label
 */
function clickFirstEvent() {
  const firstEventLabel = document.querySelector('.event-label');
  firstEventLabel.click()
}

function setArenaElement(event) {
  const arena = document.getElementById('arena');
  arena.setAttribute('arena-sport', event.sport);
  arena.innerHTML = ''; // Clear existing lanes
  return arena;
}

function setLaneElement(result, laneHeightPercent) {
  const lane = document.createElement('div');
  lane.className = 'lane';
  lane.id = `lane-${result.lane}`
  lane.style.height = laneHeightPercent + '%';
  return lane;
}

function setLaneLabelElement(result) {
  const laneLabel = document.createElement('div');
  laneLabel.className = 'lane-label';
  laneLabel.id = `lane-label-${result.lane}`;
  laneLabel.textContent = result.athlete;
  return laneLabel;
}


function setDotElement(result) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.id = `dot-${result.lane}`;
  return dot
}

function setTotalTimeLabelElement(result) {
  const totalTimeLabel = document.createElement('div');
  totalTimeLabel.className = 'total-time-label';
  totalTimeLabel.id = `total-time-label-${result.lane}`;
  totalTimeLabel.textContent = '';  // Initially blank
  return totalTimeLabel
}

function calculateMaxLaneLabelWidth() {
  const labels = document.querySelectorAll('.lane-label');
  let maxWidth = 0;
  labels.forEach(label => {
    const width = label.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });
  return maxWidth;
}

function eventFinishesOnRight(event) {
  return (event.laps % 2 === 1);
}

function setDynamicPositions(event) {
  const maxLaneLabelWidth = calculateMaxLaneLabelWidth() + 'px';
  const paddingHorizontal = getComputedStyle(document.documentElement).getPropertyValue('--padding-horizontal');
  const lanes = document.querySelectorAll('.lane');

  lanes.forEach(lane => {
    // Dot position
    dot = lane.querySelector('.dot');
    dot.style.left = `calc(${maxLaneLabelWidth} + ${paddingHorizontal})`;
    dotLeft = getComputedStyle(dot).left;
    dotWidth = getComputedStyle(dot).width;

    // Total time label position
    totalTimeLabel = lane.querySelector('.total-time-label');

    if (eventFinishesOnRight(event)) {
      totalTimeLabel.style.left = 'auto';
      totalTimeLabel.style.right = `calc(${dotWidth} + 2 * ${paddingHorizontal})`
    } else {
      totalTimeLabel.style.left = `calc(${dotLeft} + ${dotWidth} + ${paddingHorizontal})`;
      totalTimeLabel.style.right = 'auto';
    }

  });
}

function populateArena(event) {

  // Calculate lane height
  const numberOfLanes = event.results.length;
  const laneHeightPercent = (100 / numberOfLanes).toFixed(2);

  // Set arena element
  const arena = setArenaElement(event);

  event.results.forEach(result => {
    // Set elements within the arena
    const lane = setLaneElement(result, laneHeightPercent);
    const laneLabel = setLaneLabelElement(result);
    const dot = setDotElement(result);
    const totalTimeLabel = setTotalTimeLabelElement(result)

    // Append to the arena element
    lane.appendChild(laneLabel);
    lane.appendChild(dot);
    lane.appendChild(totalTimeLabel);
    arena.appendChild(lane);
  });

  // Update positions based on finishing end and longest lane label
  setDynamicPositions(event);

}

function setEventTitle(event) {
  const eventTitleElement = document.getElementById('event-title');
  eventTitleElement.textContent = event.event;
}

function setLapMarker(event) {
  const lapMarker = document.getElementById('lap-marker');
  const lapDistance = event.distance_m / event.laps;
  lapMarker.textContent = `${lapDistance}m`;
}

function determinePlacings(results) {
    // Sort the results by timeSeconds in ascending order
    console.log(results[0].lane);
    results.sort((a, b) => a.timeSeconds - b.timeSeconds);
    console.log(results[0].lane);

    // Initialize placing and a counter for ties
    let placing = 1;
    let tieCount = 0;

    for (let i = 0; i < results.length; i++) {
        if (i > 0 && results[i].timeSeconds === results[i - 1].timeSeconds) {
            // If tied with the previous time, assign the same placing
            results[i].placing = placing;
            tieCount++; // Increase the tie count
        } else {
            // If not tied, update placing, taking into account previous ties
            placing += tieCount;
            results[i].placing = placing;
            tieCount = 1; // Reset tie count for next sequence
        }
    }

    // Sort the results by lane again
    results.sort((a, b) => a.lane - b.lane);
    return results;
}

function displayMedals(results, totalLaps) {
  // Sort the results based on timeSeconds to identify the top 3
  const sortedResults = [...results].sort((a, b) => a.timeSeconds - b.timeSeconds);

  // Get the top three results
  const [gold, silver, bronze] = sortedResults;

  // Add medals based on fastest times
  results.forEach(result => {
    const laneIndex = result.lane - 1;
    const totalTimeLabel = document.getElementById(`total-time-label-${laneIndex + 1}`);

    if (result === gold) {
      addMedal(totalTimeLabel, 'G', 'gold', totalLaps);
    } else if (result === silver) {
      addMedal(totalTimeLabel, 'S', 'silver', totalLaps);
    } else if (result === bronze) {
      addMedal(totalTimeLabel, 'B', 'bronze', totalLaps);
    }


  });
}

function addMedal(labelElement, text, medalClass, totalLaps) {
  const timeLabelLongest = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--time-label-longest'));
  const paddingHorizontal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padding-horizontal'));
  const medal = document.createElement('span');
  medal.textContent = text;
  medal.classList.add('medal', medalClass);

  if (totalLaps % 2 === 0) {
    // Even lap: position from the left
    medal.style.left = paddingHorizontal + 'px';
    medal.style.right = 'auto'; // Reset right
  } else {
    // Odd lap: position from the right
    medal.style.right = timeLabelLongest + 'px';
    medal.style.left = 'auto'; // Reset left
  }

  labelElement.appendChild(medal);
}

function calculateLapDistance(dot) {
  const arenaWidth =  getComputedStyle(document.getElementById('arena')).width;
  const dotSize =  getComputedStyle(dot).width;
  const dotLeft = getComputedStyle(dot).left;
  const paddingHorizontal = getComputedStyle(document.documentElement).getPropertyValue('--padding-horizontal');
  const lapDistance = parseInt(arenaWidth) - parseInt(dotLeft) - parseInt(dotSize) - parseInt(paddingHorizontal);
  return lapDistance;

}

// Format a time for display
function formatTime(timeInSeconds) {
  const totalHundredths = Math.round(timeInSeconds * 100); // Convert to hundredths
  const hours = Math.floor(totalHundredths / 360000); // Total seconds in an hour
  const minutes = Math.floor((totalHundredths % 360000) / 6000); // Total seconds in a minute
  const seconds = Math.floor((totalHundredths % 6000) / 100); // Total seconds
  const hundredths = totalHundredths % 100; // Remaining hundredths

  // Construct the formatted time based on the values of hours and minutes
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  } else {
    return `${seconds}.${String(hundredths).padStart(2, '0')}`;
  }
}

function animateDot(result, totalLaps, playbackSpeedFactor, callback) {
  // Initialise counter
  let completedLaps = 0;

  // Get objects from document
  const laneNumber = result.lane;
  const dot = document.getElementById(`dot-${laneNumber}`);
  const totalTimeLabel = document.getElementById(`total-time-label-${laneNumber}`);

  // Calculate real time and clock time
  const totalTime = result.timeSeconds;
  const totalClockTime = totalTime / playbackSpeedFactor;
  const lapClockTime = totalClockTime / totalLaps;

  // Calculate lap distance
  const lapDistance = calculateLapDistance(dot);

  function completeNextLap() {
    // Last lap: set time label and exit function
    if (completedLaps >= totalLaps) {
      totalTimeLabel.textContent = formatTime(totalTime);
      if (callback) {
        callback();
      }
      return;
    }

    // Determine the position based on lap
    const newPosition = completedLaps % 2 === 0 ? lapDistance : 0;
    dot.style.transitionDuration = `${lapClockTime}s`;
    dot.style.transform = `translateX(${newPosition}px)`;

    // Move the dot and increment laps count
    setTimeout(() => {
      completedLaps++;
      completeNextLap(); // Continue to the next lap
    }, lapClockTime * 1000);
  }

  completeNextLap();

}

function animateAllDots(event) {
  const totalLaps = event.laps;
  let completedLanes = 0;
  event.results.forEach(result => {
    animateDot(result, totalLaps, playbackSpeedFactor, () => {
      completedLanes++;
      if (completedLanes === 3) {
        displayMedals(event.results, totalLaps);
      }
    });
  });
}


/** Simulates an event by moving each dot along the arena
 * 
 * @param {json} event - single event from the json
 */
function simulateEvent(event) {

  populateArena(event);
  determinePlacings(event.results);
  setEventTitle(event);
  setLapMarker(event);
  animateAllDots(event);

}