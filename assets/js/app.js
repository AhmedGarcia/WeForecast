document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '1f6368cc8815d1f8d0682ecff32d673a';  
    const searchForm = document.getElementById('searchForm');
    const cityInput = document.getElementById('cityInput');
    const currentWeatherDetails = document.getElementById('currentWeatherDetails');
    const forecastDetails = document.getElementById('forecastDetails');
    const historyList = document.getElementById('historyList');

    // Function to convert Celsius to Fahrenheit
    function celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }

    // Function to get coordinates of a city using OpenWeather's Geocoding API
    async function getCoordinates(city) {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        } else {
            throw new Error('City not found');
        }
    }

     // Function to get weather data using OpenWeather's 5 Day Forecast API
    async function getWeatherData(lat, lon) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        return data;
    }

     // Function to display current weather details on the page
    function displayCurrentWeather(data) {
        const current = data.list[0];
        const tempCelsius = current.main.temp;
        const tempFahrenheit = celsiusToFahrenheit(tempCelsius);

        currentWeatherDetails.innerHTML = `
            <h3>${data.city.name} (${new Date(current.dt_txt).toLocaleDateString()})</h3>
            <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
            <p>Temp: ${tempCelsius}°C / ${tempFahrenheit.toFixed(2)}°F</p>
            <p>Humidity: ${current.main.humidity}%</p>
            <p>Wind: ${current.wind.speed} m/s</p>
        `;
    }

     // Function to display 5-day weather forecast on the page
    function displayForecast(data) {
        forecastDetails.innerHTML = '';
        for (let i = 0; i < data.list.length; i += 8) {
            const day = data.list[i];
            const tempCelsius = day.main.temp;
            const tempFahrenheit = celsiusToFahrenheit(tempCelsius);

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `
                <h4>${new Date(day.dt_txt).toLocaleDateString()}</h4>
                <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                <p>Temp: ${tempCelsius}°C / ${tempFahrenheit.toFixed(2)}°F</p>
                <p>Humidity: ${day.main.humidity}%</p>
                <p>Wind: ${day.wind.speed} m/s</p>
            `;
            forecastDetails.appendChild(forecastCard);
        }
    }

    // Function to update search history in localStorage and display it
    function updateHistory(city) {
        let history = JSON.parse(localStorage.getItem('history')) || [];
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem('history', JSON.stringify(history));
        }
        displayHistory();
    }

    // Function to display search history from localStorage
    function displayHistory() {
        historyList.innerHTML = '';
        let history = JSON.parse(localStorage.getItem('history')) || [];
        history.forEach(function(city) {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', function() {
                cityInput.value = city;
                searchWeather(city);
            });
            historyList.appendChild(li);
        });
    }

    // Function to search for weather data of a city
    async function searchWeather(city) {
        try {
            const coordinates = await getCoordinates(city);
            const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
            updateHistory(city);
        } catch (error) {
            alert(error.message);
        }
    }

    // Event listener for the search form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            searchWeather(city);
            cityInput.value = '';
        }
    });

    // Display search history on page load
    displayHistory();
});
