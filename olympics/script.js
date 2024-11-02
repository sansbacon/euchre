// Define constants
const playbackSpeedFactor = 50

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

function setDynamicLabelWidth() {
  // Select all lane labels
  const labels = document.querySelectorAll('.lane-label');
  const totalTimes = document.querySelectorAll('.total-time');
  const dotSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dot-size'));
  const paddingHorizontal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padding-horizontal'));
  
  
  // Calculate the max width
  let maxWidth = 0;
  labels.forEach(label => {
    const width = label.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });

  // Set this max width as a CSS variable
  document.documentElement.style.setProperty('--lane-label-width', `${maxWidth}px`);

  // Update other widths
  // TODO: deal with odd number of lanes
  totalTimes.forEach(totalTime => {
    totalTime.style.left =  `calc(${maxWidth}px + ${dotSize}px + 2 * ${paddingHorizontal}px)`;
  });

}

// Update lanes when an event is clicked
function updateLanes(selectedEvent) {

  // Retrieve constants
  const dotSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dot-size'));
  const paddingHorizontal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padding-horizontal'));
  const laneLabelWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-label-width'));

  const pool = document.getElementById('pool');

  // Set arena colour
  // TODO: add to function
  if (selectedEvent.sport === 'Athletics') {
    pool.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--pool-athletics-color');
  } else {
    pool.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--pool-swimming-color');
  }
  
  const numberOfLanes = selectedEvent.results.length
  const laneHeight = (100 / numberOfLanes).toFixed(2); 
  document.documentElement.style.setProperty('--lane-height', `${laneHeight}%`);

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
    
    // Set where the times display
    // TODO: add to function
    if (selectedEvent.laps % 2 === 1) {
      totalTimeLabel.style.left = 'auto';
      totalTimeLabel.style.right = (dotSize + paddingHorizontal) + 'px';
    } else {
      totalTimeLabel.style.left =  (laneLabelWidth + dotSize + 2 * paddingHorizontal) + 'px';
      totalTimeLabel.style.right = 'auto';
    }
    
    lane.appendChild(laneLabel);
    lane.appendChild(totalTimeLabel);
    lane.appendChild(dot);

    pool.appendChild(lane);
  });

  setDynamicLabelWidth();
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

function displayMedals(results, totalLaps) {
  // Sort the results based on timeSeconds to identify the top 3
  const sortedResults = [...results].sort((a, b) => a.timeSeconds - b.timeSeconds);
  
  // Get the top three results
  const [gold, silver, bronze] = sortedResults;
  
  // Add medals based on fastest times
  results.forEach(result => {
    const laneIndex = result.lane - 1;
    const totalTimeLabel = document.getElementById(`total-time-${laneIndex + 1}`);


    
    if (result === gold) {
      addMedal(totalTimeLabel, 'G', 'gold', totalLaps);
    } else if (result === silver) {
      addMedal(totalTimeLabel, 'S', 'silver', totalLaps);
    } else if (result === bronze) {
      addMedal(totalTimeLabel, 'B', 'bronze', totalLaps);
    }

    console.log(totalLaps);


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

// Animate a dot in its lane
function animateDot(dot, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor, callback) {
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
      totalTimeElement.textContent = formatTime(totalTime)
      if (callback) {
        callback();
      }
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

function setEventTitle(event) {
  const eventTitleElement = document.getElementById('event-title');
  eventTitleElement.textContent = event.event; // Use event name from JSON data
}

function updateEventInfo(event) {
  const eventInfo = document.getElementById('event-info');
  const lapDistance = event.distance_m / event.laps;
  eventInfo.textContent = `${lapDistance}m`;
}

// Simulate the race
function simulateRace(event) {

  updateLanes(event)
  setEventTitle(event)
  updateEventInfo(event)

  const totalLaps = event.laps
  const dots = document.querySelectorAll('.dot');
  let completedLanes = 0;

  // Move each dot
  dots.forEach((dot, index) => {
    
    const result = event.results[index]
    
    // const totalTime = 1 + Math.random();
    const totalTime = result.timeSeconds;
    const totalTimeElement = document.getElementById(`total-time-${index + 1}`);
    // animateDot(dot, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor);

    animateDot(dot, totalLaps, totalTime, totalTimeElement, playbackSpeedFactor, () => {
      completedLanes++;

      if (completedLanes === 3) {
        displayMedals(event.results, totalLaps);
      }
    });
      
    //   completedLanes++; // This will only increment after the last lap
    //   console.log(`Lane ${index + 1} completed. Total completed lanes: ${completedLanes}`);
    //   if (completedLanes === dots.length) {
    //     console.log("All lanes completed. Displaying medals.");
    //     displayMedals(event.results);
    //   }
    // });
  });
  //displayMedals(event.results)
}