window.onload = function() {
    // ON OPEN, THE FOLLOWING WILL EXECUTE
    setTimeout(() => {
        const heroText = document.getElementById('heroText');
        heroText.style.display = 'block';  // DISPLAY TEXT
        heroText.style.opacity = 1;  // TEXT FADEIN EFFECT
    }, 1000);  // ADJUSTABLE TIMER TO DELAY FADE
};

document.getElementById('searchSB').addEventListener('click', function () {
    // ADD THE SPINNING CLASS WHEN CLICKED
    this.classList.add('spin-surfboard');

    // REMOVE THE CLASS AFTER THE ANIMATION ENDS TO RESET FOR FUTURE CLICKS
    setTimeout(() => {
        this.classList.remove('spin-surfboard');
    }, 1000);  // 1000ms = 1 SECOND FOR THE ROTATION ANIMATION TO COMPLETE
});

// DEFINE BEACHES FOR EACH REGION
const beaches = {
    LA: [
        { name: "Venice Beach", lat: 33.99363480302914, lon: -118.4805410177902 },
        { name: "Santa Monica Beach", lat: 34.00986570676548, lon: -118.49754548847704 },
        { name: "Dockweiler Beach", lat: 33.93152697557243, lon: -118.43566324523219 },
        { name: "Redondo Beach", lat: 33.837004131485884, lon: -118.39060209773479 },
        { name: "Rat Beach", lat: 33.803967925377314, lon: -118.39484492295557 },
        { name: "Manhattan Beach", lat: 33.881499580767404, lon: -118.41073298714898 }
    ],
    Malibu: [
        { name: "Surfrider Beach", lat: 34.03634123774189, lon: -118.67846511449278 },
        { name: "Zuma Beach", lat: 34.023422990298585, lon: -118.83184775257114 },
        { name: "Point Dume Beach", lat: 34.003944178523, lon: -118.8063843433556 },
        { name: "Topanga Beach", lat: 34.03971881534786, lon: -118.58209966584575 },
        { name: "Leo Carrillo Beach", lat: 34.0468192243342, lon: -118.94052396580123 },
        { name: "Paradise Cove Beach", lat: 34.01985669850343, lon: -118.78677056043256 }
    ],
    OrangeCounty: [
        { name: "The Wedge", lat: 33.593136786068065, lon: -117.881567695644 },
        { name: "Huntington Beach", lat: 33.63837170321686, lon: -117.9736992750715 },
        { name: "Laguna Beach", lat: 33.54233573991039, lon: -117.78619744370147 },
        { name: "Dana Point Beach", lat: 33.467283459873194, lon: -117.71655066585058 },
        { name: "Seal Beach", lat: 33.737852383271765, lon: -118.1054242841189 },
        { name: "Crystal Cove State Beach", lat: 33.57537165072512, lon: -117.84265654460637 }
    ]
};

// EVENT LISTENERS FOR CITY SELECTION BUTTONS
document.getElementById('laButton').addEventListener('click', () => showBeachSelection('LA'));
document.getElementById('malibuButton').addEventListener('click', () => showBeachSelection('Malibu'));
document.getElementById('ocButton').addEventListener('click', () => showBeachSelection('OrangeCounty'));

// SHOW THE BEACH SELECTION DROPDOWN BASED ON THE SELECTED CITY
const showBeachSelection = (region) => {
    const beachDropdown = document.getElementById('beaches');
    const beachSelectionDiv = document.getElementById('beachSelection');
    const findWavesButtonDiv = document.getElementById('findWavesButtonDiv');

    beachSelectionDiv.style.display = 'block';
    findWavesButtonDiv.style.display = 'block';
    beachDropdown.innerHTML = '';

    beaches[region].forEach(beach => {
        const option = document.createElement('option');
        option.value = beach.name;
        option.textContent = beach.name;
        beachDropdown.appendChild(option);
    });
};

// HANDLE THE "FIND WAVES" BUTTON CLICK
document.getElementById('findWavesButton').addEventListener('click', function() {
    const selectedBeachName = document.getElementById('beaches').value;
    let beach = [];
    for (const region in beaches) {
        beach = beaches[region].find(b => b.name === selectedBeachName);
        if (beach) break;
    }

    if (beach) {
        fetchWaveData(beach.lat, beach.lon);
    } else {
        alert("Please select a valid beach.");
    }
});

// FETCH WAVE DATA FROM OPEN-METEO API
const fetchWaveData = (latitude, longitude) => {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period&length_unit=imperial&wind_speed_unit=mph&timezone=America%2FLos_Angeles&forecast_days=1`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.hourly) {
                displayWaveData(data); // CALL THE FUNCTION TO DISPLAY THE DATA
            } else {
                document.getElementById('waveDataDisplay').innerHTML = "No data available.";
            }
        })
        .catch(() => {
            document.getElementById('waveDataDisplay').innerHTML = "Failed to fetch wave data.";
        });
};

// DISPLAY WAVE DATA FOR THE TIME RANGE FROM 5 AM TO 9 PM
const displayWaveData = (data) => {
    const waveDataDisplay = document.getElementById('waveDataDisplay');
    const hourly = data.hourly;

    const startHour = 5;  // 5 AM
    const endHour = 21;  // 9 PM

    // FILTER TIMES BETWEEN 5 AM AND 9 PM
    const filteredTimes = hourly.time.filter(time => {
        const waveTime = new Date(time);
        const hour = waveTime.getHours();
        return hour >= startHour && hour <= endHour;  // 5AM-9PM
    });

    // PREPARE THE TABLE HTML
    let html = "<h3>Daily Wave Forecast</h3><table>";
    html += "<tr><th>Time</th><th>Height (ft)</th><th>Direction (°)</th><th>Period (s)</th></tr>";

    // LOOP THROUGH THE FILTERED TIMES AND CREATE A ROW FOR EACH
    filteredTimes.forEach(time => {
        const index = hourly.time.indexOf(time);  // GET THE INDEX FOR THE TIME
        html += `<tr>
                    <td>${new Date(time).toLocaleTimeString()}</td>
                    <td>${hourly.wave_height[index]}</td>
                    <td>${hourly.wave_direction[index]}</td>
                    <td>${hourly.wave_period[index]}</td>
                 </tr>`;
    });

    html += "</table>";
    waveDataDisplay.innerHTML = html; // INSERT THE HTML INTO THE PAGE
};
