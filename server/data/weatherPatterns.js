// Regional weather data for major Indian agricultural zones
// Modeled from IMD (India Meteorological Department) patterns

const weatherData = {
    "Maharashtra": {
        current: {
            temperature: 32, humidity: 45, rainfall_mm: 0, wind_speed_kmh: 12,
            condition: "Clear", uv_index: 8
        },
        forecast: [
            { day: 1, temp_high: 33, temp_low: 19, humidity: 42, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 34, temp_low: 20, humidity: 40, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 33, temp_low: 19, humidity: 48, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 4, temp_high: 31, temp_low: 18, humidity: 55, rainfall_mm: 2, condition: "Light Rain" },
            { day: 5, temp_high: 30, temp_low: 18, humidity: 60, rainfall_mm: 5, condition: "Rain" },
            { day: 6, temp_high: 32, temp_low: 19, humidity: 50, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 33, temp_low: 20, humidity: 44, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Western Plateau & Hills"
    },
    "Karnataka": {
        current: {
            temperature: 30, humidity: 55, rainfall_mm: 0, wind_speed_kmh: 8,
            condition: "Partly Cloudy", uv_index: 7
        },
        forecast: [
            { day: 1, temp_high: 31, temp_low: 20, humidity: 52, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 2, temp_high: 32, temp_low: 21, humidity: 50, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 31, temp_low: 20, humidity: 58, rainfall_mm: 3, condition: "Light Rain" },
            { day: 4, temp_high: 29, temp_low: 19, humidity: 65, rainfall_mm: 8, condition: "Rain" },
            { day: 5, temp_high: 28, temp_low: 19, humidity: 70, rainfall_mm: 12, condition: "Heavy Rain" },
            { day: 6, temp_high: 30, temp_low: 20, humidity: 60, rainfall_mm: 2, condition: "Light Rain" },
            { day: 7, temp_high: 31, temp_low: 20, humidity: 55, rainfall_mm: 0, condition: "Partly Cloudy" }
        ],
        season: "Rabi",
        agro_zone: "Southern Plateau & Hills"
    },
    "Uttar Pradesh": {
        current: {
            temperature: 24, humidity: 60, rainfall_mm: 0, wind_speed_kmh: 10,
            condition: "Hazy", uv_index: 5
        },
        forecast: [
            { day: 1, temp_high: 25, temp_low: 10, humidity: 58, rainfall_mm: 0, condition: "Hazy" },
            { day: 2, temp_high: 26, temp_low: 11, humidity: 55, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 3, temp_high: 24, temp_low: 10, humidity: 62, rainfall_mm: 0, condition: "Cloudy" },
            { day: 4, temp_high: 22, temp_low: 9, humidity: 70, rainfall_mm: 5, condition: "Rain" },
            { day: 5, temp_high: 23, temp_low: 10, humidity: 65, rainfall_mm: 2, condition: "Light Rain" },
            { day: 6, temp_high: 25, temp_low: 11, humidity: 58, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 26, temp_low: 12, humidity: 55, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Upper Gangetic Plain"
    },
    "Haryana": {
        current: {
            temperature: 22, humidity: 55, rainfall_mm: 0, wind_speed_kmh: 15,
            condition: "Clear", uv_index: 5
        },
        forecast: [
            { day: 1, temp_high: 23, temp_low: 8, humidity: 52, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 24, temp_low: 9, humidity: 50, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 22, temp_low: 8, humidity: 58, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 4, temp_high: 20, temp_low: 7, humidity: 65, rainfall_mm: 3, condition: "Light Rain" },
            { day: 5, temp_high: 21, temp_low: 8, humidity: 60, rainfall_mm: 0, condition: "Cloudy" },
            { day: 6, temp_high: 23, temp_low: 9, humidity: 55, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 24, temp_low: 10, humidity: 50, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Trans-Gangetic Plain"
    },
    "Madhya Pradesh": {
        current: {
            temperature: 28, humidity: 40, rainfall_mm: 0, wind_speed_kmh: 10,
            condition: "Clear", uv_index: 7
        },
        forecast: [
            { day: 1, temp_high: 29, temp_low: 14, humidity: 38, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 30, temp_low: 15, humidity: 36, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 29, temp_low: 14, humidity: 42, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 4, temp_high: 27, temp_low: 13, humidity: 50, rainfall_mm: 2, condition: "Light Rain" },
            { day: 5, temp_high: 28, temp_low: 14, humidity: 45, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 6, temp_high: 29, temp_low: 15, humidity: 40, rainfall_mm: 0, condition: "Sunny" },
            { day: 7, temp_high: 30, temp_low: 15, humidity: 38, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Central Plateau & Hills"
    },
    "Rajasthan": {
        current: {
            temperature: 26, humidity: 30, rainfall_mm: 0, wind_speed_kmh: 18,
            condition: "Clear", uv_index: 8
        },
        forecast: [
            { day: 1, temp_high: 27, temp_low: 11, humidity: 28, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 28, temp_low: 12, humidity: 25, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 27, temp_low: 11, humidity: 30, rainfall_mm: 0, condition: "Sunny" },
            { day: 4, temp_high: 26, temp_low: 10, humidity: 35, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 5, temp_high: 27, temp_low: 11, humidity: 32, rainfall_mm: 0, condition: "Sunny" },
            { day: 6, temp_high: 28, temp_low: 12, humidity: 28, rainfall_mm: 0, condition: "Sunny" },
            { day: 7, temp_high: 29, temp_low: 13, humidity: 26, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Western Dry"
    },
    "Gujarat": {
        current: {
            temperature: 30, humidity: 35, rainfall_mm: 0, wind_speed_kmh: 14,
            condition: "Clear", uv_index: 8
        },
        forecast: [
            { day: 1, temp_high: 31, temp_low: 16, humidity: 33, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 32, temp_low: 17, humidity: 30, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 31, temp_low: 16, humidity: 38, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 4, temp_high: 30, temp_low: 15, humidity: 42, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 5, temp_high: 31, temp_low: 16, humidity: 35, rainfall_mm: 0, condition: "Sunny" },
            { day: 6, temp_high: 32, temp_low: 17, humidity: 32, rainfall_mm: 0, condition: "Sunny" },
            { day: 7, temp_high: 33, temp_low: 18, humidity: 30, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Gujarat Plains & Hills"
    },
    "West Bengal": {
        current: {
            temperature: 27, humidity: 70, rainfall_mm: 0, wind_speed_kmh: 8,
            condition: "Hazy", uv_index: 5
        },
        forecast: [
            { day: 1, temp_high: 28, temp_low: 16, humidity: 68, rainfall_mm: 0, condition: "Hazy" },
            { day: 2, temp_high: 29, temp_low: 17, humidity: 65, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 3, temp_high: 27, temp_low: 16, humidity: 72, rainfall_mm: 3, condition: "Light Rain" },
            { day: 4, temp_high: 26, temp_low: 15, humidity: 78, rainfall_mm: 8, condition: "Rain" },
            { day: 5, temp_high: 27, temp_low: 16, humidity: 72, rainfall_mm: 2, condition: "Light Rain" },
            { day: 6, temp_high: 28, temp_low: 17, humidity: 68, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 29, temp_low: 17, humidity: 65, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Lower Gangetic Plain"
    },
    "Odisha": {
        current: {
            temperature: 29, humidity: 65, rainfall_mm: 0, wind_speed_kmh: 10,
            condition: "Partly Cloudy", uv_index: 6
        },
        forecast: [
            { day: 1, temp_high: 30, temp_low: 18, humidity: 62, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 2, temp_high: 31, temp_low: 19, humidity: 58, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 29, temp_low: 18, humidity: 68, rainfall_mm: 5, condition: "Rain" },
            { day: 4, temp_high: 28, temp_low: 17, humidity: 75, rainfall_mm: 10, condition: "Heavy Rain" },
            { day: 5, temp_high: 29, temp_low: 18, humidity: 68, rainfall_mm: 3, condition: "Light Rain" },
            { day: 6, temp_high: 30, temp_low: 19, humidity: 62, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 31, temp_low: 19, humidity: 58, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "East Coast Plain & Hills"
    },
    "Andhra Pradesh": {
        current: {
            temperature: 31, humidity: 50, rainfall_mm: 0, wind_speed_kmh: 12,
            condition: "Partly Cloudy", uv_index: 7
        },
        forecast: [
            { day: 1, temp_high: 32, temp_low: 20, humidity: 48, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 33, temp_low: 21, humidity: 45, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 31, temp_low: 20, humidity: 55, rainfall_mm: 2, condition: "Light Rain" },
            { day: 4, temp_high: 30, temp_low: 19, humidity: 62, rainfall_mm: 5, condition: "Rain" },
            { day: 5, temp_high: 31, temp_low: 20, humidity: 55, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 6, temp_high: 32, temp_low: 21, humidity: 48, rainfall_mm: 0, condition: "Sunny" },
            { day: 7, temp_high: 33, temp_low: 21, humidity: 45, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Southern Plateau & Hills"
    },
    "Punjab": {
        current: {
            temperature: 20, humidity: 60, rainfall_mm: 0, wind_speed_kmh: 12,
            condition: "Hazy", uv_index: 4
        },
        forecast: [
            { day: 1, temp_high: 21, temp_low: 7, humidity: 58, rainfall_mm: 0, condition: "Hazy" },
            { day: 2, temp_high: 22, temp_low: 8, humidity: 55, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 3, temp_high: 20, temp_low: 7, humidity: 62, rainfall_mm: 2, condition: "Light Rain" },
            { day: 4, temp_high: 18, temp_low: 6, humidity: 70, rainfall_mm: 5, condition: "Rain" },
            { day: 5, temp_high: 19, temp_low: 7, humidity: 65, rainfall_mm: 0, condition: "Cloudy" },
            { day: 6, temp_high: 21, temp_low: 8, humidity: 58, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 22, temp_low: 9, humidity: 55, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "Trans-Gangetic Plain"
    },
    "Tamil Nadu": {
        current: {
            temperature: 32, humidity: 60, rainfall_mm: 0, wind_speed_kmh: 10,
            condition: "Partly Cloudy", uv_index: 8
        },
        forecast: [
            { day: 1, temp_high: 33, temp_low: 23, humidity: 58, rainfall_mm: 0, condition: "Sunny" },
            { day: 2, temp_high: 34, temp_low: 24, humidity: 55, rainfall_mm: 0, condition: "Sunny" },
            { day: 3, temp_high: 33, temp_low: 23, humidity: 62, rainfall_mm: 2, condition: "Light Rain" },
            { day: 4, temp_high: 31, temp_low: 22, humidity: 70, rainfall_mm: 8, condition: "Rain" },
            { day: 5, temp_high: 32, temp_low: 23, humidity: 65, rainfall_mm: 3, condition: "Light Rain" },
            { day: 6, temp_high: 33, temp_low: 24, humidity: 58, rainfall_mm: 0, condition: "Partly Cloudy" },
            { day: 7, temp_high: 34, temp_low: 24, humidity: 55, rainfall_mm: 0, condition: "Sunny" }
        ],
        season: "Rabi",
        agro_zone: "East Coast Plain & Hills"
    }
};

export function getWeather(state) {
    return weatherData[state] || weatherData["Maharashtra"];
}

export function getRainfallRisk(state, daysAhead = 7) {
    const weather = getWeather(state);
    const totalRainfall = weather.forecast.slice(0, daysAhead).reduce((sum, d) => sum + d.rainfall_mm, 0);
    const rainyDays = weather.forecast.slice(0, daysAhead).filter(d => d.rainfall_mm > 0).length;
    return {
        totalRainfall,
        rainyDays,
        risk: totalRainfall > 20 ? "HIGH" : totalRainfall > 8 ? "MEDIUM" : "LOW",
        heavyRainDays: weather.forecast.slice(0, daysAhead).filter(d => d.rainfall_mm > 10).length
    };
}

export function getAvgTemperature(state) {
    const weather = getWeather(state);
    const temps = weather.forecast.map(d => (d.temp_high + d.temp_low) / 2);
    return Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
}

export function getAvgHumidity(state) {
    const weather = getWeather(state);
    const humidities = weather.forecast.map(d => d.humidity);
    return Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length);
}

export function getAllStates() {
    return Object.keys(weatherData);
}

export default weatherData;
