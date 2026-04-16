/* ═══════════════════════════════════════════════════════════════
   VoyageAI — Weather Integration Module
   Real-time weather data with 5-day forecast
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initWeather();
});

function initWeather() {
    document.getElementById('checkWeather')?.addEventListener('click', fetchWeather);
}

async function fetchWeather() {
    const selectEl = document.getElementById('weatherCity');
    const destId = selectEl.value;

    if (!destId) {
        showToast('Please select a destination', 'error');
        return;
    }

    const dest = getDestinationById(destId);
    if (!dest) return;

    showLoading('🌦️ Fetching weather data...');

    try {
        const resp = await fetch(`/api/weather/${encodeURIComponent(dest.name)}`);
        const data = await resp.json();

        renderWeatherResult(data, dest);
        hideLoading();
    } catch (err) {
        hideLoading();
        showToast('Failed to fetch weather data', 'error');
    }
}

function renderWeatherResult(data, dest) {
    const container = document.getElementById('weatherResult');
    const current = data.current;
    const forecast = data.forecast;

    // Weather alert logic
    let alertHtml = '';
    if (current.temp > 40) {
        alertHtml = `<div class="weather-alert bad">⚠️ Extreme heat warning! Temperature is above 40°C. Consider rescheduling your trip.</div>`;
    } else if (current.temp > 35) {
        alertHtml = `<div class="weather-alert warn">🌡️ It's quite hot. Stay hydrated and plan indoor activities during peak hours.</div>`;
    } else if (current.description.includes('rain') || current.description.includes('thunderstorm')) {
        alertHtml = `<div class="weather-alert warn">🌧️ Rain expected. Pack an umbrella and waterproof gear!</div>`;
    } else if (current.temp < 5) {
        alertHtml = `<div class="weather-alert warn">❄️ Very cold conditions. Pack warm clothing and layers.</div>`;
    } else {
        alertHtml = `<div class="weather-alert good">✅ Weather looks great for travel! Enjoy your trip to ${dest.name}.</div>`;
    }

    // Mock notice
    const mockNotice = data.mock 
        ? `<div class="weather-mock-notice">ℹ️ Showing simulated weather data. For live data, add your free OpenWeatherMap API key in app.py</div>` 
        : '';

    container.innerHTML = `
        <!-- Current Weather -->
        <div class="weather-current">
            <div class="weather-icon-large">
                <img src="https://openweathermap.org/img/wn/${current.icon}@4x.png" alt="${current.description}">
            </div>
            <div class="weather-current-info">
                <div class="weather-temp">${current.temp}°C</div>
                <div class="weather-desc">${current.description}</div>
                <div class="weather-details">
                    <span>🌡️ Feels like ${current.feels_like}°C</span>
                    <span>💧 Humidity ${current.humidity}%</span>
                    <span>🌬️ Wind ${current.wind} m/s</span>
                </div>
                <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">
                    📍 ${current.city || dest.name}, ${dest.state} &nbsp;•&nbsp; Best time to visit: ${dest.bestTime}
                </p>
            </div>
        </div>

        ${alertHtml}
        ${mockNotice}

        <!-- 5-Day Forecast -->
        <h3 style="margin: 24px 0 16px; font-size: 1.1rem;">📅 5-Day Forecast</h3>
        <div class="weather-forecast">
            ${forecast.map(day => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                return `
                    <div class="forecast-card">
                        <div class="forecast-date">${dayName}<br>${dateStr}</div>
                        <div class="forecast-icon">
                            <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}">
                        </div>
                        <div class="forecast-temp">${day.temp}°C</div>
                        <div class="forecast-range">${day.temp_min}° / ${day.temp_max}°</div>
                        <div class="forecast-desc">${day.description}</div>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Travel Tips -->
        <div class="glass-card" style="margin-top: 24px;">
            <h3 style="margin-bottom: 12px;">💡 Travel Tips for ${dest.name}</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                ${getWeatherTips(current, dest).map(tip => `
                    <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.88rem; color: var(--text-secondary);">
                        <span style="flex-shrink: 0;">${tip.icon}</span>
                        <span>${tip.text}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function getWeatherTips(current, dest) {
    const tips = [];

    if (current.temp > 35) {
        tips.push({ icon: '🧴', text: 'Apply sunscreen frequently and wear a hat during outdoor activities.' });
        tips.push({ icon: '💧', text: 'Carry plenty of water. Aim for 3-4 liters per day.' });
        tips.push({ icon: '⏰', text: 'Schedule outdoor sightseeing in early morning or late evening.' });
    } else if (current.temp > 25) {
        tips.push({ icon: '👕', text: 'Light, breathable cotton clothing is recommended.' });
        tips.push({ icon: '🧴', text: 'Don\'t forget sunscreen, even on cloudy days.' });
    } else if (current.temp < 10) {
        tips.push({ icon: '🧥', text: 'Pack warm layers — thermals, fleece, and a windproof jacket.' });
        tips.push({ icon: '🧤', text: 'Carry gloves, warm socks, and a beanie for outdoor activities.' });
    }

    if (current.description.includes('rain')) {
        tips.push({ icon: '☂️', text: 'Carry a compact umbrella and waterproof bag covers.' });
        tips.push({ icon: '👟', text: 'Wear waterproof shoes with good grip.' });
    }

    if (current.humidity > 70) {
        tips.push({ icon: '💨', text: 'High humidity — wear moisture-wicking fabrics.' });
    }

    // General tips based on destination categories
    if (dest.categories.includes('trekking') || dest.categories.includes('adventure')) {
        tips.push({ icon: '🥾', text: 'Wear sturdy trekking shoes and carry a first-aid kit.' });
    }

    if (dest.categories.includes('beach')) {
        tips.push({ icon: '🏊', text: 'Check tide timings before swimming. Swim only at designated areas.' });
    }

    if (dest.categories.includes('spiritual')) {
        tips.push({ icon: '👔', text: 'Dress modestly when visiting temples and religious sites.' });
    }

    // Always add these
    tips.push({ icon: '📱', text: 'Download offline maps for areas with poor connectivity.' });
    tips.push({ icon: '💰', text: 'Carry some cash — not all places accept digital payments.' });

    return tips.slice(0, 6); // Max 6 tips
}
