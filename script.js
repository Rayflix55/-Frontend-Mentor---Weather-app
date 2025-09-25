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
// CHUNK 2: SEARCH + AUTO GEOLOCATION (WORKING VERSION)
// ================================

// EXPLANATION: Auto-detect user location when page loads
function initializeWeatherApp() {
    console.log('🚀 Starting Weather App...');
    
    // Try to get user's current location automatically
    if (navigator.geolocation) {
        console.log('📍 Geolocation supported, requesting permission...');
        
        // Show loading message
        updateLocationDisplay('🔄 Detecting your location...', '');
        
        navigator.geolocation.getCurrentPosition(
            // SUCCESS: Got user's location
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                console.log('✅ Got coordinates:', latitude, longitude);
                updateLocationDisplay('📍 Found your location!', 'Getting weather data...');
                
                // Convert coordinates to city name and get weather
                reverseGeocode(latitude, longitude);
            },
            
            // ERROR: Couldn't get location
            function(error) {
                console.warn('⚠️ Geolocation error:', error.message);
                
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied. You can search manually above.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location unavailable. Please search for your city above.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location timeout. Please search for your city above.";
                        break;
                    default:
                        errorMessage = "Location error. Please search for your city above.";
                        break;
                }
                
                updateLocationDisplay('🔍 Search for your city', errorMessage);
            },
            
            // OPTIONS: Location settings
            {
                enableHighAccuracy: true,  // Use GPS if available
                timeout: 10000,           // Wait up to 10 seconds
                maximumAge: 300000        // Use cached location up to 5 minutes old
            }
        );
    } else {
        console.warn('❌ Geolocation not supported');
        updateLocationDisplay('🔍 Search for your city', 'Geolocation not supported by your browser');
    }
}

// EXPLANATION: Convert GPS coordinates to city/state/country
function reverseGeocode(latitude, longitude) {
    // Use geocoding API to get location details from coordinates
    const reverseUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
    
    console.log('🌍 Reverse geocoding:', reverseUrl);
    
    fetch(reverseUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Reverse geocoding result:', data);
            
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                console.log('✅ Found location details:', location);
                
                weatherApp.currentLocation = location;
                fetchWeatherData(location);
            } else {
                // If reverse geocoding fails, use coordinates directly
                console.log('📍 Using coordinates directly');
                const fallbackLocation = {
                    name: 'Your Location',
                    country: '',
                    admin1: '', // State/Province
                    latitude: latitude,
                    longitude: longitude
                };
                weatherApp.currentLocation = fallbackLocation;
                fetchWeatherData(fallbackLocation);
            }
        })
        .catch(error => {
            console.error('❌ Reverse geocoding error:', error);
            
            // Still try to get weather with coordinates
            const fallbackLocation = {
                name: 'Your Location',
                country: '',
                admin1: '',
                latitude: latitude,
                longitude: longitude
            };
            weatherApp.currentLocation = fallbackLocation;
            fetchWeatherData(fallbackLocation);
        });
}

// EXPLANATION: Manual search function (when user types city)
function handleSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a city name!');
        return;
    }
    
    console.log('🔍 Manual search for:', query);
    showSearchLoading();
    searchCity(query);
}

// EXPLANATION: Search for city by name
function searchCity(cityName) {
    const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    
    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                console.log('✅ Found city:', location);
                
                weatherApp.currentLocation = location;
                fetchWeatherData(location);
            } else {
                throw new Error('City not found');
            }
        })
        .catch(error => {
            console.error('❌ Search error:', error);
            hideSearchLoading();
            alert(`Sorry, couldn't find "${cityName}". Please try a different city.`);
        });
}

// EXPLANATION: Get weather data (SIMPLE & RELIABLE VERSION)
function fetchWeatherData(location) {
    console.log('🌤️ Fetching weather for:', location);
    
    // Simple, reliable weather API call
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&` +
        `daily=weather_code,temperature_2m_max,temperature_2m_min&` +
        `hourly=temperature_2m,weather_code&` +
        `timezone=auto`;
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Weather data received:', data);
            
            weatherApp.weatherData = data;
            
            // Update all UI elements
            updateCurrentWeather(data, location);
            updateTodaysHighlights(data);
            
            hideSearchLoading();
        })
        .catch(error => {
            console.error('❌ Weather fetch error:', error);
            hideSearchLoading();
            alert('Failed to get weather data. Please try again.');
        });
}

// EXPLANATION: Update current weather display with enhanced location info
function updateCurrentWeather(weatherData, location) {
    const current = weatherData.current;
    if (!current) return;
    
    // ENHANCED LOCATION DISPLAY: Show city, state, country
    const locationElement = document.querySelector('.current div p:first-child');
    if (locationElement) {
        let locationText = location.name;
        
        // Add state/province if available
        if (location.admin1 && location.admin1 !== location.name) {
            locationText += `, ${location.admin1}`;
        }
        
        // Add country
        if (location.country) {
            locationText += `, ${location.country}`;
        }
        
        locationElement.textContent = locationText;
        console.log('✅ Updated location:', locationText);
    }
    
    // Update current date
    const dateElement = document.querySelector('.current div p:nth-child(2)');
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
    const descriptionElement = document.querySelector('.current p:nth-child(2)');
    if (descriptionElement) {
        descriptionElement.textContent = weatherInfo.description;
    }
    
    // Update temperature
    const tempElement = document.querySelector('.current p:last-child');
    if (tempElement) {
        const temp = Math.round(current.temperature_2m);
        tempElement.textContent = `${temp}°C`;
    }
}

// EXPLANATION: Update today's highlights
function updateTodaysHighlights(weatherData) {
    const current = weatherData.current;
    if (!current) return;
    
    // Update Humidity
    const humidityElement = document.querySelector('.humidity p:last-child');
    if (humidityElement) {
        humidityElement.textContent = Math.round(current.relative_humidity_2m) + '%';
    }
    
    // Update Wind Speed
    const windElement = document.querySelector('.wind p:last-child');
    if (windElement) {
        windElement.textContent = Math.round(current.wind_speed_10m) + ' km/h';
    }
    
    // Update UV Index
    const uvElement = document.querySelector('.uv p:last-child');
    if (uvElement) {
        uvElement.textContent = Math.round(current.uv_index || 0);
    }
    
    // Update Feels Like
    const feelsLikeElement = document.querySelector('.feel p:last-child');
    if (feelsLikeElement) {
        const feelsLike = Math.round(current.apparent_temperature);
        feelsLikeElement.textContent = `${feelsLike}°C`;
    }
}

// EXPLANATION: Helper functions for loading states
function updateLocationDisplay(location, description) {
    const locationElement = document.querySelector('.current div p:first-child');
    const descElement = document.querySelector('.current p:nth-child(2)');
    
    if (locationElement) locationElement.textContent = location;
    if (descElement) descElement.textContent = description;
}

function showSearchLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Searching...';
        submitButton.disabled = true;
    }
}

function hideSearchLoading() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Search';
        submitButton.disabled = false;
    }
}

// EXPLANATION: Start the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM loaded, initializing weather app...');
    initializeWeatherApp();
});

console.log('✅ Chunk 2: Search + Auto Geolocation Ready');
console.log('📱 Will auto-detect location when page loads');

// ================================
// CHUNK 3: DAILY FORECAST (FIXED VERSION)
// ================================

// EXPLANATION: Fixed daily forecast that prevents duplicates and fits your cards
function updateDailyForecast(weatherData) {
    console.log('📅 Updating daily forecast (FIXED)...');
    
    const daily = weatherData.daily;
    if (!daily || !daily.time) {
        console.error('No daily forecast data available');
        return;
    }
    
    // Get all your forecast day elements
    const dayElements = [
        document.querySelector('.sun'),
        document.querySelector('.mon'), 
        document.querySelector('.tue'),
        document.querySelector('.wed'),
        document.querySelector('.thu'),
        document.querySelector('.fri'),
        document.querySelector('.sat')
    ];
    
    console.log('📊 Available forecast days:', daily.time.length);
    console.log('🗓️ Forecast dates:', daily.time);
    
    // FIX: Start from index 1 to skip today (since today is shown in current weather)
    for (let i = 0; i < 7; i++) {
        const dayElement = dayElements[i];
        const dataIndex = i + 1; // Skip today, start from tomorrow
        
        if (!dayElement) {
            console.warn(`Day element ${i} not found`);
            continue;
        }
        
        // Check if we have data for this day
        if (dataIndex >= daily.time.length) {
            console.warn(`No data for day ${dataIndex}`);
            continue;
        }
        
        // Get data for this day
        const date = new Date(daily.time[dataIndex]);
        const weatherCode = daily.weather_code[dataIndex];
        const maxTemp = daily.temperature_2m_max[dataIndex];
        const minTemp = daily.temperature_2m_min[dataIndex];
        
        // Get weather info
        const weatherInfo = getWeatherInfo(weatherCode);
        
        // FIX: Use short day names that fit your cards
        const dayNameElement = dayElement.querySelector('p:first-child');
        if (dayNameElement) {
            const dayName = getShortDayName(date, dataIndex);
            dayNameElement.textContent = dayName;
            console.log(`✅ Day ${i}: ${dayName} (${date.toLocaleDateString()})`);
        }
        
        // Update weather icon
        const iconElement = dayElement.querySelector('img');
        if (iconElement) {
            iconElement.src = weatherInfo.icon;
            iconElement.alt = weatherInfo.description;
        }
        
        // Update temperature
        const tempElement = dayElement.querySelector('p:last-child');
        if (tempElement) {
            const maxTempRounded = Math.round(maxTemp);
            const minTempRounded = Math.round(minTemp);
            
            tempElement.textContent = `${maxTempRounded}°C`;
            tempElement.title = `High: ${maxTempRounded}°C, Low: ${minTempRounded}°C`;
        }
        
        // Add tooltip to the whole card
        dayElement.title = `${getFullDayName(date)}: ${weatherInfo.description}, High ${Math.round(maxTemp)}°C, Low ${Math.round(minTemp)}°C`;
    }
    
    console.log('✅ Daily forecast updated (fixed version)');
}

// FIX: Better day name function that fits your cards
function getShortDayName(date, dayIndex) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Compare dates properly
    const dateString = date.toDateString();
    const todayString = today.toDateString();
    const tomorrowString = tomorrow.toDateString();
    
    if (dateString === todayString) {
        return 'Today'; // This shouldn't happen now since we skip today
    } else if (dateString === tomorrowString) {
        return 'Tmrw'; // Short form that fits your cards
    } else {
        // Return 3-letter day names that fit perfectly
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return dayNames[date.getDay()];
    }
}

// Helper function for full day names (for tooltips)
function getFullDayName(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dateString = date.toDateString();
    const todayString = today.toDateString();
    const tomorrowString = tomorrow.toDateString();
    
    if (dateString === todayString) {
        return 'Today';
    } else if (dateString === tomorrowString) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
}

// ACCURACY CHECK: Function to verify forecast accuracy
function checkForecastAccuracy(weatherData) {
    console.log('🔍 ACCURACY CHECK:');
    
    if (!weatherData.daily) {
        console.error('❌ No daily data');
        return;
    }
    
    const daily = weatherData.daily;
    const today = new Date().toDateString();
    
    console.log('📅 Today is:', today);
    console.log('📊 Forecast data:');
    
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        const forecastDate = new Date(daily.time[i]);
        const maxTemp = daily.temperature_2m_max[i];
        const minTemp = daily.temperature_2m_min[i];
        const weatherCode = daily.weather_code[i];
        
        console.log(`Day ${i}: ${forecastDate.toDateString()} - High: ${Math.round(maxTemp)}°C, Low: ${Math.round(minTemp)}°C, Code: ${weatherCode}`);
    }
    
    // Check if temperatures make sense
    for (let i = 0; i < daily.temperature_2m_max.length; i++) {
        const max = daily.temperature_2m_max[i];
        const min = daily.temperature_2m_min[i];
        
        if (max < min) {
            console.warn(`⚠️ Day ${i}: Max temp (${max}) is less than min temp (${min}) - this seems wrong!`);
        }
        
        if (max > 60 || max < -50 || min > 60 || min < -50) {
            console.warn(`⚠️ Day ${i}: Temperature seems unrealistic - Max: ${max}°C, Min: ${min}°C`);
        }
    }
    
    return true;
}

// ENHANCED: Replace the fetchWeatherData function with accuracy checking
function fetchWeatherDataWithAccuracyCheck(location) {
    console.log('🌤️ Fetching weather with accuracy check for:', location);
    
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&` +
        `daily=weather_code,temperature_2m_max,temperature_2m_min&` +
        `hourly=temperature_2m,weather_code&` +
        `timezone=auto&` +
        `forecast_days=7`;
    
    console.log('🔗 API URL:', weatherUrl);
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Raw weather data received:', data);
            
            // Check accuracy before using the data
            checkForecastAccuracy(data);
            
            weatherApp.weatherData = data;
            
            // Update all UI elements
            updateCurrentWeather(data, location);
            updateTodaysHighlights(data);
            updateDailyForecast(data); // This now uses the fixed version
            
            hideSearchLoading();
        })
        .catch(error => {
            console.error('❌ Weather fetch error:', error);
            hideSearchLoading();
            alert('Failed to get weather data. Please try again.');
        });
}

// Replace the original fetchWeatherData function
window.fetchWeatherData = fetchWeatherDataWithAccuracyCheck;

console.log('✅ Chunk 3: FIXED Daily Forecast Ready');
console.log('🔧 Fixed: No duplicate "Today", "Tomorrow" is now "Tmrw", accuracy check added');

// ================================
// FIX: UPDATE TEMPERATURE IN CORRECT POSITION
// ================================

// EXPLANATION: Fixed function to update temperature in the right place
// Your HTML structure has temperature in a separate <p> element with orange color
function updateCurrentWeather(weatherData, location) {
    const current = weatherData.current;
    if (!current) return;
    
    console.log('📝 Updating current weather display...');
    
    // Update location name (in the first <p> inside the first <div>)
    const locationElement = document.querySelector('.current div p:first-child');
    if (locationElement) {
        let locationText = location.name;
        
        // Add state/province if available
        if (location.admin1 && location.admin1 !== location.name) {
            locationText += `, ${location.admin1}`;
        }
        
        // Add country
        if (location.country) {
            locationText += `, ${location.country}`;
        }
        
        locationElement.textContent = locationText;
        console.log('✅ Updated location:', locationText);
    }
    
    // Update current date (in the second <p> inside the first <div>)
    const dateElement = document.querySelector('.current div p:nth-child(2)');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
        console.log('✅ Updated date');
    }
    
    // Update weather description (the "Sunny" text - first <p> outside the <div>)
    const weatherInfo = getWeatherInfo(current.weather_code);
    const descriptionElement = document.querySelector('.current > p:first-of-type');
    if (descriptionElement) {
        descriptionElement.textContent = weatherInfo.description;
        console.log('✅ Updated description:', weatherInfo.description);
    }
    
    // FIX: Update temperature in the ORANGE colored <p> element (the "25°C" position)
    const tempElement = document.querySelector('.current > p.text-5xl.font-bold.text-orange-500');
    if (tempElement) {
        const temp = Math.round(current.temperature_2m);
        const tempText = `${temp}°C`;
        tempElement.textContent = tempText;
        console.log('✅ Updated temperature in orange position:', tempText);
    } else {
        // Fallback: try to find it by the last <p> element
        const fallbackTempElement = document.querySelector('.current p:last-child');
        if (fallbackTempElement && fallbackTempElement.textContent.includes('°')) {
            const temp = Math.round(current.temperature_2m);
            const tempText = `${temp}°C`;
            fallbackTempElement.textContent = tempText;
            console.log('✅ Updated temperature using fallback method:', tempText);
        } else {
            console.error('❌ Could not find temperature element');
        }
    }
}

// EXPLANATION: Alternative approach - find temperature element by content
function findAndUpdateTemperature(currentTemp) {
    // Find the element that currently shows "25°C" and update it
    const allParagraphs = document.querySelectorAll('.current p');
    
    for (let p of allParagraphs) {
        // Check if this paragraph contains a temperature (ends with °C or °F)
        if (p.textContent.match(/\d+°[CF]$/)) {
            const temp = Math.round(currentTemp);
            p.textContent = `${temp}°C`;
            console.log('✅ Found and updated temperature element:', p.textContent);
            return true;
        }
    }
    
    console.error('❌ Could not find temperature element to update');
    return false;
}

// EXPLANATION: Enhanced updateCurrentWeather with multiple targeting methods
function updateCurrentWeatherEnhanced(weatherData, location) {
    const current = weatherData.current;
    if (!current) return;
    
    console.log('📝 Updating current weather (enhanced targeting)...');
    
    // Update location name
    const locationElement = document.querySelector('.current div p:first-child');
    if (locationElement) {
        let locationText = location.name;
        if (location.admin1 && location.admin1 !== location.name) {
            locationText += `, ${location.admin1}`;
        }
        if (location.country) {
            locationText += `, ${location.country}`;
        }
        locationElement.textContent = locationText;
    }
    
    // Update date
    const dateElement = document.querySelector('.current div p:nth-child(2)');
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
    const descriptionElement = document.querySelector('.current > p:first-of-type');
    if (descriptionElement) {
        descriptionElement.textContent = weatherInfo.description;
    }
    
    // MULTI-METHOD TEMPERATURE UPDATE
    const temp = Math.round(current.temperature_2m);
    let tempUpdated = false;
    
    // Method 1: Try by class name (most specific)
    const tempByClass = document.querySelector('.current .text-5xl.font-bold.text-orange-500');
    if (tempByClass) {
        tempByClass.textContent = `${temp}°C`;
        tempUpdated = true;
        console.log('✅ Updated temperature by class name:', `${temp}°C`);
    }
    
    // Method 2: Try by finding existing temperature text
    if (!tempUpdated) {
        tempUpdated = findAndUpdateTemperature(temp);
    }
    
    // Method 3: Try by position (last resort)
    if (!tempUpdated) {
        const tempByPosition = document.querySelector('.current p:last-child');
        if (tempByPosition) {
            tempByPosition.textContent = `${temp}°C`;
            tempUpdated = true;
            console.log('✅ Updated temperature by position:', `${temp}°C`);
        }
    }
    
    if (!tempUpdated) {
        console.error('❌ Failed to update temperature with all methods');
        console.log('Available elements in .current:', document.querySelectorAll('.current *'));
    }
}

// Replace the existing updateCurrentWeather function
window.updateCurrentWeather = updateCurrentWeatherEnhanced;

console.log('✅ Temperature Position Fix Applied');
console.log('🎯 Temperature will now update in the orange 25°C position');
console.log('🔧 Using multiple targeting methods for reliability');

// ================================
// CHUNK 4: HOURLY FORECAST (REAL DATA)
// ================================

// EXPLANATION: Update your hourly forecast section with real weather data
// This will replace your static "1 PM, 2 PM, 3 PM..." with actual hourly forecasts
function updateHourlyForecast(weatherData) {
    console.log('⏰ Updating hourly forecast...');
    
    const hourly = weatherData.hourly;
    if (!hourly || !hourly.time || !hourly.temperature_2m) {
        console.error('No hourly forecast data available');
        return;
    }
    
    // Get all your hourly forecast elements
    const hourlyElements = [
        document.querySelector('.first'),
        document.querySelector('.second'), 
        document.querySelector('.third'),
        document.querySelector('.fourth'),
        document.querySelector('.fifth'),
        document.querySelector('.sixth'),
        document.querySelector('.seventh'),
        document.querySelector('.eight')
    ];
    
    // Get current hour to start from
    const now = new Date();
    const currentHour = now.getHours();
    
    console.log('🕐 Current hour:', currentHour);
    console.log('📊 Available hourly data points:', hourly.time.length);
    
    // Update each hourly card
    for (let i = 0; i < Math.min(8, hourlyElements.length); i++) {
        const hourlyElement = hourlyElements[i];
        if (!hourlyElement) {
            console.warn(`Hourly element ${i} not found`);
            continue;
        }
        
        // Calculate which hour to show (starting from next hour)
        const hourIndex = findHourlyIndex(hourly.time, i + 1);
        
        if (hourIndex === -1 || hourIndex >= hourly.time.length) {
            console.warn(`No data for hourly slot ${i}`);
            continue;
        }
        
        // Get data for this hour
        const hourTime = new Date(hourly.time[hourIndex]);
        const temperature = hourly.temperature_2m[hourIndex];
        const weatherCode = hourly.weather_code ? hourly.weather_code[hourIndex] : 1; // Default to clear if no code
        
        // Get weather info
        const weatherInfo = getWeatherInfo(weatherCode);
        
        // Update time (first element in the flex row)
        const timeElement = hourlyElement.querySelector('p:first-child');
        if (timeElement) {
            const timeText = formatHourTime(hourTime);
            timeElement.textContent = timeText;
            console.log(`✅ Hour ${i}: ${timeText}`);
        }
        
        // Update weather icon (img element)
        const iconElement = hourlyElement.querySelector('img');
        if (iconElement) {
            iconElement.src = weatherInfo.icon;
            iconElement.alt = weatherInfo.description;
            // Fix the image extension if it's wrong
            if (iconElement.src.includes('.wep')) {
                iconElement.src = iconElement.src.replace('.wep', '.webp');
            }
        }
        
        // Update temperature (last element)
        const tempElement = hourlyElement.querySelector('p:last-child');
        if (tempElement) {
            const tempRounded = Math.round(temperature);
            tempElement.textContent = `${tempRounded}°C`;
        }
        
        // Add tooltip with detailed info
        hourlyElement.title = `${formatHourTime(hourTime)}: ${weatherInfo.description}, ${Math.round(temperature)}°C`;
    }
    
    console.log('✅ Hourly forecast updated successfully');
}

// EXPLANATION: Find the correct index in hourly data for a given hour offset
function findHourlyIndex(hourlyTimes, hoursFromNow) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + (hoursFromNow * 60 * 60 * 1000));
    
    // Find the closest hour in the forecast data
    for (let i = 0; i < hourlyTimes.length; i++) {
        const forecastTime = new Date(hourlyTimes[i]);
        
        // If this forecast time is close to our target time (within 1 hour)
        const timeDiff = Math.abs(forecastTime.getTime() - targetTime.getTime());
        if (timeDiff < 60 * 60 * 1000) { // Within 1 hour
            return i;
        }
        
        // If forecast time is after our target, this is the closest
        if (forecastTime.getTime() >= targetTime.getTime()) {
            return i;
        }
    }
    
    // If no exact match, return the closest available
    return Math.min(hoursFromNow, hourlyTimes.length - 1);
}

// EXPLANATION: Format hour time for display
function formatHourTime(date) {
    const now = new Date();
    const hour = date.getHours();
    
    // Check if it's today, tomorrow, etc.
    const daysDiff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        // Today - just show hour
        if (hour === 0) return '12 AM';
        if (hour === 12) return '12 PM';
        if (hour < 12) return `${hour} AM`;
        return `${hour - 12} PM`;
    } else if (daysDiff === 1) {
        // Tomorrow - show "Tomorrow" for first few hours, then just hour
        if (hour < 6) {
            return 'Tmrw';
        } else {
            if (hour === 12) return '12 PM';
            if (hour < 12) return `${hour} AM`;
            return `${hour - 12} PM`;
        }
    } else {
        // Future days - show day name
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return dayNames[date.getDay()];
    }
}

// EXPLANATION: Add scroll functionality to hourly forecast
function addHourlyForecastInteractions() {
    const hourlyContainer = document.querySelector('.forecast .flex.flex-col');
    
    if (!hourlyContainer) {
        console.warn('Hourly forecast container not found');
        return;
    }
    
    // Add smooth scrolling
    hourlyContainer.style.scrollBehavior = 'smooth';
    
    // Add click interactions to hourly cards
    const hourlyElements = hourlyContainer.querySelectorAll('div[class*="bg-neutral-600"]');
    
    hourlyElements.forEach((element, index) => {
      
  // Add click for detailed info
        element.addEventListener('click', function() {
            showHourlyDetails(index);
        });
        
        // Make cursor pointer
        element.style.cursor = 'pointer';
    });
    
    console.log('✅ Added interactions to', hourlyElements.length, 'hourly cards');
}

// EXPLANATION: Show detailed hourly information when clicked
function showHourlyDetails(hourIndex) {
    if (!weatherApp.weatherData || !weatherApp.weatherData.hourly) {
        console.log('No hourly weather data available');
        return;
    }
    
    const hourly = weatherApp.weatherData.hourly;
    const dataIndex = findHourlyIndex(hourly.time, hourIndex + 1);
    
    if (dataIndex === -1 || dataIndex >= hourly.time.length) {
        console.log('No data for this hour');
        return;
    }
    
    const hourTime = new Date(hourly.time[dataIndex]);
    const temperature = hourly.temperature_2m[dataIndex];
    const weatherCode = hourly.weather_code ? hourly.weather_code[dataIndex] : 1;
    const weatherInfo = getWeatherInfo(weatherCode);
    
    // Create detailed info
    const details = `
🕐 ${hourTime.toLocaleString('en-US', { 
    weekday: 'short', 
    hour: 'numeric', 
    minute: '2-digit' 
})}
🌡️ Temperature: ${Math.round(temperature)}°C
🌤️ Conditions: ${weatherInfo.description}
    `.trim();
    
    // Simple alert for now (you can make this a styled modal later)
    alert(details);
    
    console.log(`📊 Showed hourly details for slot ${hourIndex}:`, details);
}

// EXPLANATION: Enhanced fetchWeatherData to include hourly updates
function fetchWeatherDataWithHourlyForecast(location) {
    console.log('🌤️ Fetching weather with hourly forecast for:', location);
    
    // Enhanced weather URL to get 48 hours of hourly data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&` +
        `daily=weather_code,temperature_2m_max,temperature_2m_min&` +
        `hourly=temperature_2m,weather_code,relative_humidity_2m,precipitation_probability&` +
        `timezone=auto&` +
        `forecast_days=2`; // Get 2 days for better hourly coverage
    
    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Weather data with hourly forecast received:', data);
            console.log('⏰ Hourly data points:', data.hourly ? data.hourly.time.length : 'None');
            
            weatherApp.weatherData = data;
            
            // Update all UI elements
            updateCurrentWeatherEnhanced(data, location);
            updateTodaysHighlights(data);
            updateDailyForecast(data);
            updateHourlyForecast(data); // NEW: Update hourly forecast!
            
            hideSearchLoading();
        })
        .catch(error => {
            console.error('❌ Weather fetch error:', error);
            hideSearchLoading();
            alert('Failed to get weather data. Please try again.');
        });
}

// Replace the fetchWeatherData function
window.fetchWeatherData = fetchWeatherDataWithHourlyForecast;

// Initialize hourly interactions when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addHourlyForecastInteractions();
        console.log('✅ Hourly forecast interactions added');
    }, 1500); // Wait 1.5 seconds for everything to load
});

console.log('✅ Chunk 4: Hourly Forecast Complete');
console.log('⏰ Your hourly cards will now show real hourly weather data!');
console.log('🖱️ Click on hourly cards to see detailed info!');

 document.addEventListener('DOMContentLoaded', () => {
  // ===== DOM elements (local names to avoid redeclaration) =====
  const unitsBtnEl = document.getElementById('unitsBtn');
  const unitsMenuEl = document.getElementById('unitsMenu');
  const unitsIconEl = document.getElementById('unitsIcon');
  const unitItems = unitsMenuEl ? unitsMenuEl.querySelectorAll('li[data-type]') : [];

  const favBtnEl = document.getElementById('favBtn');
  const favMenuEl = document.getElementById('favMenu');
  const favIconEl = document.getElementById('favIcon');
  const favListEl = document.getElementById('favList');
  const addFavBtnEl = document.getElementById('addFavBtn');

  // ===== Settings (persisted) =====
  let settings = JSON.parse(localStorage.getItem('weatherSettings')) || {
    temperature: 'celsius',
    wind: 'kmh',
    favorites: []
  };

  function saveSettings() {
    localStorage.setItem('weatherSettings', JSON.stringify(settings));
  }

  // ===== UI helpers =====
  function openMenu(menuEl, iconEl) {
    if (!menuEl) return;
    menuEl.classList.remove('scale-y-0', 'opacity-0', '-translate-y-2');
    menuEl.classList.add('scale-y-100', 'opacity-100', 'translate-y-0');
    if (iconEl) iconEl.classList.add('rotate-180');
  }
  function closeMenu(menuEl, iconEl) {
    if (!menuEl) return;
    menuEl.classList.remove('scale-y-100', 'opacity-100', 'translate-y-0');
    menuEl.classList.add('scale-y-0', 'opacity-0', '-translate-y-2');
    if (iconEl) iconEl.classList.remove('rotate-180');
  }

  // Close other menus helper (the new behaviour you requested)
  function closeOtherMenus(except) {
    if (except !== 'units') closeMenu(unitsMenuEl, unitsIconEl);
    if (except !== 'fav') closeMenu(favMenuEl, favIconEl);
  }

  // ===== Units menu rendering & interaction =====
  function renderUnitCheckmarks() {
    if (!unitItems) return;
    unitItems.forEach(li => {
      const type = li.dataset.type;
      const value = li.dataset.value;
      const label = li.textContent.replace(/^✓\s*/, '').trim();
      li.textContent = (settings[type] === value) ? `✓ ${label}` : label;
    });
    // Keep label "Units" as requested
    const selectedUnitEl = document.getElementById('selectedUnit');
    if (selectedUnitEl) selectedUnitEl.textContent = 'Units';
  }
  renderUnitCheckmarks();

  // Toggle units menu (and auto-close the favorites)
  if (unitsBtnEl) {
    unitsBtnEl.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const closed = unitsMenuEl.classList.contains('scale-y-0');
      closeOtherMenus('units');            // <-- close other menus first
      if (closed) openMenu(unitsMenuEl, unitsIconEl);
      else closeMenu(unitsMenuEl, unitsIconEl);
    });
  }

  // Pick a unit option
  unitItems.forEach(li => {
    li.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const type = li.dataset.type;
      const value = li.dataset.value;
      settings[type] = value;
      saveSettings();
      renderUnitCheckmarks();
      closeMenu(unitsMenuEl, unitsIconEl);

      // Re-apply units to UI (converts existing numbers) if available
      if (typeof applyUnitsToUI === 'function') applyUnitsToUI();
    });
  });

  // ===== Favorites logic =====
  function renderFavoritesList() {
    if (!favListEl) return;
    favListEl.innerHTML = '';
    if (!Array.isArray(settings.favorites) || settings.favorites.length === 0) {
      favListEl.innerHTML = '<p class="text-gray-400 text-sm px-2">No favorites yet</p>';
      return;
    }

    settings.favorites.forEach(city => {
      const row = document.createElement('div');
      row.className = 'flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = city;
      nameSpan.className = 'text-blue-700 font-medium';

      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '✕';
      removeBtn.className = 'text-red-500 hover:text-red-700 ml-3';

      // Click name -> trigger search (uses your existing searchCity or handleSearch)
      nameSpan.addEventListener('click', () => {
        if (typeof window.searchCity === 'function') {
          window.searchCity(city);
        } else {
          const input = document.getElementById('searchInput');
          if (input) {
            input.value = city;
            if (typeof window.handleSearch === 'function') {
              // call handleSearch with a synthetic event
              window.handleSearch({ preventDefault() {}, target: input });
            } else {
              // fallback: try to call fetch by geocoding
              if (typeof window.fetchWeatherData === 'function') {
                // try direct fetch if you have function taking a location object
                // nothing here — prefer searchCity/handleSearch
              }
            }
          }
        }
        closeMenu(favMenuEl, favIconEl);
      });

      // Remove favorite
      removeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        settings.favorites = settings.favorites.filter(x => x.toLowerCase() !== city.toLowerCase());
        saveSettings();
        renderFavoritesList();
      });

      row.appendChild(nameSpan);
      row.appendChild(removeBtn);
      favListEl.appendChild(row);
    });
  }
  renderFavoritesList();

  // Toggle favorites menu (and auto-close the units menu)
  if (favBtnEl) {
    favBtnEl.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const closed = favMenuEl.classList.contains('scale-y-0');
      closeOtherMenus('fav');             // <-- close other menus first
      if (closed) openMenu(favMenuEl, favIconEl);
      else closeMenu(favMenuEl, favIconEl);
    });
  }

  // Add current location to favorites (prevent duplicates)
  if (addFavBtnEl) {
    addFavBtnEl.addEventListener('click', (ev) => {
      ev.stopPropagation();

      // Get current city name from weatherApp.currentLocation (preferred)
      let cityName = null;
      if (window.weatherApp && weatherApp.currentLocation && weatherApp.currentLocation.name) {
        cityName = weatherApp.currentLocation.name;
      } else {
        // fallback: read from DOM (.current div first p)
        const locationElement = document.querySelector('.current div p:first-child');
        if (locationElement) {
          cityName = locationElement.textContent.trim().split(',')[0].trim();
        }
      }

      if (!cityName) {
        alert('No current location to add. Search for a city first.');
        return;
      }

      // prevent duplicates (case-insensitive)
      if ((settings.favorites || []).some(x => x.toLowerCase() === cityName.toLowerCase())) {
        alert(`${cityName} is already in your favorites.`);
        return;
      }

      settings.favorites = settings.favorites || [];
      settings.favorites.push(cityName);
      saveSettings();
      renderFavoritesList();
    });
  }

  // Close menus when clicking outside
  document.addEventListener('click', (ev) => {
    if (unitsMenuEl && !unitsMenuEl.contains(ev.target) && ev.target !== unitsBtnEl) {
      closeMenu(unitsMenuEl, unitsIconEl);
    }
    if (favMenuEl && !favMenuEl.contains(ev.target) && ev.target !== favBtnEl) {
      closeMenu(favMenuEl, favIconEl);
    }
  });

  // ===== Unit conversion helpers & UI application (optional) =====
  // If you already have applyUnitsToUI in your project, this won't override it.
  function cToF(c){ return Math.round((c * 9/5) + 32); }
  function fToC(f){ return Math.round((f - 32) * 5/9); }
  function kmhToMph(k){ return Math.round(k * 0.621371); }
  function mphToKmh(m){ return Math.round(m * 1.60934); }

  // Try to call your app's update renderers first and then convert any visible leaf strings
  function applyUnitsToUI() {
    // Re-render from data if your app provides renderers
    if (window.weatherApp && weatherApp.weatherData) {
      try {
        if (typeof window.updateCurrentWeatherEnhanced === 'function') {
          updateCurrentWeatherEnhanced(weatherApp.weatherData, weatherApp.currentLocation || {});
        }
        if (typeof window.updateTodaysHighlights === 'function') {
          updateTodaysHighlights(weatherApp.weatherData);
        }
        if (typeof window.updateDailyForecast === 'function') {
          updateDailyForecast(weatherApp.weatherData);
        }
        if (typeof window.updateHourlyForecast === 'function') {
          updateHourlyForecast(weatherApp.weatherData);
        }
      } catch (err) {
        console.warn('Error re-rendering before converting units:', err);
      }
    }

    // Then convert visible leaf nodes
    const leafEls = Array.from(document.querySelectorAll('body *')).filter(el => el.childElementCount === 0);
    leafEls.forEach(el => {
      // Temperatures like "25°C" or "77°F"
      if (/\d+\s*°\s*[CF]/i.test(el.textContent)) {
        const tmatch = el.textContent.match(/(-?\d+\.?\d*)\s*°\s*([CF])/i);
        if (!tmatch) return;
        const num = parseFloat(tmatch[1]);
        const curUnit = tmatch[2].toUpperCase();
        if (settings.temperature === 'fahrenheit' && curUnit === 'C') {
          el.textContent = `${cToF(num)}°F`;
        } else if (settings.temperature === 'celsius' && curUnit === 'F') {
          el.textContent = `${fToC(num)}°C`;
        }
      }
      // Winds like "15 km/h" or "9 mph"
      if (/\d+\s*(km\/h|kmh|mph)/i.test(el.textContent)) {
        const wmatch = el.textContent.match(/(-?\d+\.?\d*)\s*(km\/h|kmh|mph)/i);
        if (!wmatch) return;
        const num = parseFloat(wmatch[1]);
        const curUnit = wmatch[2].toLowerCase();
        if (settings.wind === 'mph' && curUnit.indexOf('mph') === -1) {
          el.textContent = `${kmhToMph(num)} mph`;
        } else if (settings.wind === 'kmh' && curUnit.indexOf('mph') !== -1) {
          el.textContent = `${mphToKmh(num)} km/h`;
        }
      }
    });
  }

  // Apply units on load (if any weather data is already present)
  applyUnitsToUI();

});




