// Fetch the event data
fetch('./data/events.json')
  .then(response => response.json())
  .then(data => {
    const events = data.events;
    populateNavbar(events);
    clickFirstEvent();
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    document.getElementById('arena').textContent = 'Failed to load event data. Please try again later.';
 });

 // Precomputed styles
const style = getComputedStyle(document.documentElement);
const defaultArenaHeight = parseInt(style.getPropertyValue('--arena-default-height'));
const minLaneHeight = parseInt(style.getPropertyValue('--lane-min-height'));
const paddingHorizontal = style.getPropertyValue('--padding-horizontal');
const timeLabelLongest = parseFloat(style.getPropertyValue('--time-label-longest'));

/**
 * Populates the navbar with the event labels
 * @param {list} events - List of events in json format
 */
function populateNavbar(events) {
  const navbar = document.getElementById('navbar');
  let lastSport = ''; // initialize

  events.forEach(event => {
    // Get the event's sport
    const eventSport = event.sport;

    // Add a sport subheading if it is different to the previous value
    if (eventSport != lastSport) {
      const sportHeading = document.createElement('div');
      sportHeading.className = 'nav-heading';
      sportHeading.textContent = eventSport;
      navbar.appendChild(sportHeading);
      lastSport = eventSport; // update
    }

    // Add the event button
    const eventButton = document.createElement('div');
    eventButton.textContent = event.event;
    eventButton.className = 'nav-item';
    eventButton.onclick = () => simulateEvent(event);
    navbar.appendChild(eventButton);
  });
}

/**
 * Loads the first event by clicking its label
 */
function clickFirstEvent() {
  const firstEventLabel = document.querySelector('.nav-item');
  firstEventLabel.click()
}

/**
 * Initializes the arena element
 * @param {list} events - List of events in json format
 * @returns 
 */
function setArenaElement(event, arenaHeight) {
  const arena = document.getElementById('arena');
  arena.setAttribute('arena-sport', event.sport);
  arena.style.height = `${arenaHeight}px`;
  arena.innerHTML = ''; // Clear existing lanes
  return arena;
}

/**
 * Initializes the lane element
 * @param {object} result - Dictionary with details of the lane's result
 * @param {number} laneHeightPercent - Percentage of the arena taken up by the lane
 * @returns {HTMLDivElement} Lane element
 */
function setLaneElement(result, laneHeightPercent) {
  const lane = document.createElement('div');
  lane.className = 'lane';
  lane.id = `lane-${result.lane}`
  lane.style.height = laneHeightPercent + '%';
  return lane;
}

/**
 * Initializes the lane label element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Lane label element
 */
function setLaneLabelElement(result) {
  const laneLabel = document.createElement('div');
  laneLabel.className = 'lane-label';
  laneLabel.id = `lane-label-${result.lane}`;
  laneLabel.textContent = result.athlete + ' (' + result.country + ')';
  return laneLabel;
}

/**
 * Initializes the dot element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Dot element
 */
function setDotElement(result) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.id = `dot-${result.lane}`;
  return dot
}

/**
 * Initializes the total time label element
 * @param {object} result - Dictionary with details of the lane's result
 * @returns {HTMLDivElement} Total time label element
 */
function setTotalTimeLabelElement(result) {
  const totalTimeLabel = document.createElement('div');
  totalTimeLabel.className = 'total-time-label';
  totalTimeLabel.id = `total-time-label-${result.lane}`;
  totalTimeLabel.textContent = '';  // Initially blank
  return totalTimeLabel
}

/**
 * Calculates the maximum lane label width in the document
 * @returns {number} Maximum lane label width in the document
 */
function calculateMaxLaneLabelWidth() {
  const labels = document.querySelectorAll('.lane-label');
  let maxWidth = 0;
  labels.forEach(label => {
    const width = label.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });
  return maxWidth;
}

/**
 * Indicates whether an event finishes on the right-hand side of the arena
 * @param {number} totalLaps 
 * @returns {boolean} True if the event finishes on the right-hand side of the arena; false otherwise
 */
function eventFinishesOnRight(totalLaps) {
  return (totalLaps % 2 === 1);
}

/**
 * Sets dynamic positions of objects in document based on the maximum lane label width
 * @param {object} event - Dictionary containing event details 
 */
function setDynamicPositions(event) {
  // Get document elements
  const maxLaneLabelWidth = calculateMaxLaneLabelWidth() + 'px';
  const lanes = document.querySelectorAll('.lane');
  const totalLaps = event.laps;

  lanes.forEach(lane => {
    // Dot position
    dot = lane.querySelector('.dot');
    dot.style.left = `calc(${maxLaneLabelWidth} + ${paddingHorizontal})`;
    dotLeft = getComputedStyle(dot).left;
    dotWidth = getComputedStyle(dot).width;

    // Total time label position
    totalTimeLabel = lane.querySelector('.total-time-label');

    if (eventFinishesOnRight(totalLaps)) {
      totalTimeLabel.style.left = 'auto';
      totalTimeLabel.style.right = `calc(${dotWidth} + 2 * ${paddingHorizontal})`
    } else {
      totalTimeLabel.style.left = `calc(${dotLeft} + ${dotWidth} + ${paddingHorizontal})`;
      totalTimeLabel.style.right = 'auto';
    }

  });
}

/**
 * Populates the arena when an event is first loaded
 * @param {object} event - Dictionary containing event details 
 */
function populateArena(event) {

  // Calculate lane height and arena height
  const numberOfLanes = event.results.length;
  const laneHeightPercent = (100 / numberOfLanes).toFixed(2);
  const arenaHeight = Math.max(numberOfLanes * minLaneHeight, defaultArenaHeight);

  // Set arena element
  const arena = setArenaElement(event, arenaHeight);

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

/**
 * Sets the event title
 * @param {object} event - Dictionary containing event details 
 */
function setEventTitle(event) {
  const eventTitleElement = document.getElementById('event-title');
  eventTitleElement.textContent = event.event;
}

/**
 * Sets the lap length annotation below the arena
 * @param {object} event - Dictionary containing event details 
 */
function setLapMarker(event) {
  const lapMarker = document.getElementById('lap-marker');
  const lapDistance = event.distance_m / event.laps;
  lapMarker.textContent = `${lapDistance.toLocaleString()}m`;
}

/**
 * Adds a placing attribute to each result based on their finishing time
 * @param {list} results - List of each lane's results
 * @returns 
 */
function determinePlacings(results) {
    // Sort the results by timeSeconds in ascending order
    results.sort((a, b) => a.timeSeconds - b.timeSeconds);

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

function addMedalIfWon(totalTimeLabel, placing, totalLaps) {
  // Define the medal abbrevations for each placing
  const placingAbbrevs = {
    1: 'G',
    2: 'S',
    3: 'B'
  };

  // Determine whether the athlete wins a medal
  const isMedalWinner = placingAbbrevs.hasOwnProperty(placing);

  if (isMedalWinner) {
    // Create the medal
    const medal = document.createElement('span');
    medal.classList.add('medal');
    medal.textContent = placingAbbrevs[placing];
    medal.setAttribute('medal-placing', placing);

    // Set the medal's position
    if (eventFinishesOnRight(totalLaps)) {
      medal.style.right = timeLabelLongest + 'px';
      medal.style.left = 'auto'; // Reset left
    } else {
      medal.style.left = timeLabelLongest + 'px';
      medal.style.right = 'auto'; // Reset right
    }

    totalTimeLabel.appendChild(medal); 
  }
}

/**
 * Calculates the distance of one lap based on the arena size, dot size, and padding
 * @param {HTMLDivElement} dot - Dot element 
 * @returns {number} Distance of one lap
 */
function calculateLapDistance(dot) {
  // Get document sizes
  const arenaWidth =  getComputedStyle(document.getElementById('arena')).width;
  const dotSize =  getComputedStyle(dot).width;
  const dotLeft = getComputedStyle(dot).left;

  // Calculate lap distance
  const lapDistance = parseInt(arenaWidth) - parseInt(dotLeft) - parseInt(dotSize) - parseInt(paddingHorizontal);
  return lapDistance;
}

/**
 * Formats a time in h:mm:ss.xx format
 * @param {number} timeInSeconds - the time in seconds
 * @returns {string} - Formatted time in h:mm:ss.xx format
 */
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

/**
 * Animates a dot along its lane for the whole event
 * @param {object} result - Dictionary with details of the lane's result
 * @param {number} totalLaps - Total number of laps in the race
 * @param {number} playbackSpeedFactor - Playback speed factor. 1 is real time; higher values are faster. 
 */
function animateDot(result, totalLaps, playbackSpeedFactor) {
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
      // Set time label
      totalTimeLabel.textContent = formatTime(totalTime);

      // Add a medal (if applicable)
      addMedalIfWon(totalTimeLabel, result.placing, totalLaps);
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

/**
 * Animates all dots along their lanes for the whole event
 * @param {object} event - Dictionary containing event details 
 * @param {number} playbackSpeedFactor - Playback speed factor. 1 is real time; higher values are faster. 
 */
function animateAllDots(event, playbackSpeedFactor) {
  // Total number of laps
  const totalLaps = event.laps;

  // Animate each dot
  event.results.forEach(result => {
    animateDot(result, totalLaps, playbackSpeedFactor);
  });
}

/**
 * Simulates an event by moving each dot along the arena
 * @param {object} event - Dictionary containing event details 
 */
function simulateEvent(event) {
  // Set the playback speed factor
  const playbackSpeedFactor = 20;

  // Simulate the event
  determinePlacings(event.results);
  populateArena(event);
  setEventTitle(event);
  setLapMarker(event);
  animateAllDots(event, playbackSpeedFactor);
}