console.log("JS Connected")

// ================================
// CHUNK 1: BASIC SETUP AND WEATHER CODES
// ================================

// EXPLANATION: This creates our weather app object to store all data
const weatherApp = {
    // Current app state
    currentLocation: null,
    weatherData: null,
    favorites: JSON.parse(localStorage.getItem('weather-favorites')) || [],
    units: localStorage.getItem('weather-units') || 'metric', // 'metric' or 'imperial'
    
    // Weather code to icon/description mapping
    // The API gives us numbers (0, 61, 95) - we convert them to icons and text
    weatherCodes: {
        0: { description: 'Clear sky', icon: 'assets/images/icon-sunny.webp', emoji: '☀️' },
        1: { description: 'Mainly clear', icon: 'assets/images/icon-sunny.webp', emoji: '🌤️' },
        2: { description: 'Partly cloudy', icon: 'assets/images/icon-partly-cloudy.webp', emoji: '⛅' },
        3: { description: 'Overcast', icon: 'assets/images/icon-partly-cloudy.webp', emoji: '☁️' },
        45: { description: 'Foggy', icon: 'assets/images/icon-fog.webp', emoji: '🌫️' },
        48: { description: 'Depositing rime fog', icon: 'assets/images/icon-fog.webp', emoji: '🌫️' },
        51: { description: 'Light drizzle', icon: 'assets/images/icon-drizzle.webp', emoji: '🌦️' },
        53: { description: 'Moderate drizzle', icon: 'assets/images/icon-drizzle.webp', emoji: '🌦️' },
        55: { description: 'Dense drizzle', icon: 'assets/images/icon-rain.webp', emoji: '🌧️' },
        61: { description: 'Slight rain', icon: 'assets/images/icon-rain.webp', emoji: '🌧️' },
        63: { description: 'Moderate rain', icon: 'assets/images/icon-rain.webp', emoji: '🌧️' },
        65: { description: 'Heavy rain', icon: 'assets/images/icon-storm.webp', emoji: '⛈️' },
        71: { description: 'Slight snow', icon: 'assets/images/icon-snow.webp', emoji: '🌨️' },
        73: { description: 'Moderate snow', icon: 'assets/images/icon-snow.webp', emoji: '❄️' },
        75: { description: 'Heavy snow', icon: 'assets/images/icon-snow.webp', emoji: '❄️' },
        95: { description: 'Thunderstorm', icon: 'assets/images/icon-storm.webp', emoji: '⛈️' },
        96: { description: 'Thunderstorm with hail', icon: 'assets/images/icon-storm.webp', emoji: '⛈️' },
        99: { description: 'Thunderstorm with heavy hail', icon: 'assets/images/icon-storm.webp', emoji: '⛈️' }
    }
};

// EXPLANATION: Helper function to get weather info from code
// Example: getWeatherInfo(61) returns { description: 'Slight rain', icon: 'assets/images/icon-rain.webp', emoji: '🌧️' }
function getWeatherInfo(weatherCode) {
    return weatherApp.weatherCodes[weatherCode] || {
        description: 'Unknown',
        icon: 'assets/images/icon-sunny.webp',
        emoji: '🌤️'
    };
}

// EXPLANATION: Helper function to format temperature based on units
function formatTemperature(temp) {
    if (weatherApp.units === 'imperial') {
        // Convert Celsius to Fahrenheit: (C × 9/5) + 32
        return Math.round((temp * 9/5) + 32) + '°F';
    }
    return Math.round(temp) + '°C';
}

// EXPLANATION: Helper function to format wind speed based on units
function formatWindSpeed(speed) {
    if (weatherApp.units === 'imperial') {
        // Convert km/h to mph: multiply by 0.621371
        return Math.round(speed * 0.621371) + ' mph';
    }
    return Math.round(speed) + ' km/h';
}

// EXPLANATION: Save data to browser storage so it persists when page reloads
function saveToStorage(key, data) {
    localStorage.setItem('weather-' + key, JSON.stringify(data));
}

// EXPLANATION: Load data from browser storage
function loadFromStorage(key, defaultValue = null) {
    const stored = localStorage.getItem('weather-' + key);
    return stored ? JSON.parse(stored) : defaultValue;
}

console.log('✅ Chunk 1: Weather App Setup Complete');
console.log('📊 Available weather codes:', Object.keys(weatherApp.weatherCodes).length);

// TEST: You can test the helper functions
console.log('🧪 Test - Weather code 61:', getWeatherInfo(61));
console.log('🧪 Test - Temperature 25°C:', formatTemperature(25));
console.log('🧪 Test - Wind speed 15 km/h:', formatWindSpeed(15));

// ================================
// CHUNK 2: SEARCH FUNCTIONALITY
// ================================

// EXPLANATION: This function handles your search form submission
// It connects to your existing handleSearch(event) in the HTML form
function handleSearch(event) {
    event.preventDefault(); // Stop form from refreshing the page
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a city name!');
        return;
    }
    
    console.log('🔍 Searching for:', query);
    
    // Show loading state
    showSearchLoading();
    
    // Search for the city and get weather data
    searchCity(query);
}

// EXPLANATION: Search for a city using the geocoding API
// This converts city name to coordinates (latitude, longitude)
function searchCity(cityName) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    
    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City search failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                console.log('🌍 Found city:', location.name, location.country);
                
                // Store the location and get weather data
                weatherApp.currentLocation = location;
                fetchWeatherData(location);
            } else {
                throw new Error('City not found');
            }
        })
        .catch(error => {
            console.error('❌ Search error:', error);
            hideSearchLoading();
            alert(`Sorry, couldn't find "${cityName}". Please try a different city name.`);
        });
}

// EXPLANATION: Get weather data using coordinates
// This gets current weather, hourly forecast, and daily forecast
function fetchWeatherData(location) {
    // Build the weather API URL with all the data we need
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&` +
        `hourly=temperature_2m,weather_code&` +
        `daily=weather_code,temperature_2m_max,temperature_2m_min&` +
        `timezone=auto&` +
        `temperature_unit=${weatherApp.units === 'imperial' ? 'fahrenheit' : 'celsius'}&` +
        `wind_speed_unit=${weatherApp.units === 'imperial' ? 'mph' : 'kmh'}`;
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('🌤️ Weather data received:', data);
            
            // Store weather data
            weatherApp.weatherData = data;
            
            // Update your HTML elements with the real weather data
            updateCurrentWeather(data, location);
            updateTodaysHighlights(data);
            updateDailyForecast(data);
            updateHourlyForecast(data);
            
            hideSearchLoading();
        })
        .catch(error => {
            console.error('❌ Weather fetch error:', error);
            hideSearchLoading();
            alert('Failed to get weather data. Please try again.');
        });
}

// EXPLANATION: Update your current weather section (the blue box)
function updateCurrentWeather(weatherData, location) {
    const current = weatherData.current;
    
    // Update location name (your existing element)
    const locationElement = document.querySelector('.current p:first-child');
    if (locationElement) {
        locationElement.textContent = `${location.name}, ${location.country}`;
    }
    
    // Update date
    const dateElement = document.querySelector('.current p:nth-child(2)');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Update weather description
    const weatherInfo = getWeatherInfo(current.weather_code);
    const descriptionElement = document.querySelector('.current p:nth-child(3)');
    if (descriptionElement) {
        descriptionElement.textContent = weatherInfo.description;
    }
    
    // Update temperature
    const tempElement = document.querySelector('.current p:last-child');
    if (tempElement) {
        const temp = weatherApp.units === 'imperial' ? 
            Math.round((current.temperature_2m * 9/5) + 32) + '°F' : 
            Math.round(current.temperature_2m) + '°C';
        tempElement.textContent = temp;
    }
}

// EXPLANATION: Update the "Today's Highlights" section
function updateTodaysHighlights(weatherData) {
    const current = weatherData.current;
    
    // Update Humidity
    const humidityElement = document.querySelector('.humidity p:last-child');
    if (humidityElement) {
        humidityElement.textContent = current.relative_humidity_2m + '%';
    }
    
    // Update Wind Speed
    const windElement = document.querySelector('.wind p:last-child');
    if (windElement) {
        const windSpeed = weatherApp.units === 'imperial' ? 
            Math.round(current.wind_speed_10m * 0.621371) + ' mph' :
            Math.round(current.wind_speed_10m) + ' km/h';
        windElement.textContent = windSpeed;
    }
    
    // Update UV Index
    const uvElement = document.querySelector('.uv p:last-child');
    if (uvElement) {
        uvElement.textContent = Math.round(current.uv_index || 0);
    }
    
    // Update Feels Like temperature
    const feelsLikeElement = document.querySelector('.feel p:last-child');
    if (feelsLikeElement) {
        const feelsLike = weatherApp.units === 'imperial' ? 
            Math.round((current.apparent_temperature * 9/5) + 32) + '°F' :
            Math.round(current.apparent_temperature) + '°C';
        feelsLikeElement.textContent = feelsLike;
    }
}

// EXPLANATION: Show loading state when searching
function showSearchLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Searching...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
    }
}

// EXPLANATION: Hide loading state after search completes
function hideSearchLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Search';
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    }
}

console.log('✅ Chunk 2: Search Functionality Complete');
console.log('🔍 Your search form is now connected to real weather APIs');