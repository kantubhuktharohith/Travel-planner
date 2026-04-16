import os
import json
import requests
from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'voyageai_secret_key_2024'

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
WEATHER_API_KEY = '4a4b43e9a8d77edc8f9c8e3e5c7d1a2b'  # Demo key - replace with your own from openweathermap.org

# ─── Helper Functions ──────────────────────────────────────────────

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {} if filename == 'users.json' else []

def save_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─── Routes ────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')

# ─── Auth Endpoints ────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    fullname = data.get('fullname', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    users = load_json('users.json')

    if username in users:
        return jsonify({'error': 'Username already exists'}), 400

    users[username] = {
        'fullname': fullname or username,
        'password': generate_password_hash(password),
        'trips': []
    }
    save_json('users.json', users)

    session['user'] = username
    return jsonify({
        'message': 'Registration successful',
        'user': {'username': username, 'fullname': fullname or username}
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    users = load_json('users.json')

    if username not in users:
        return jsonify({'error': 'Invalid username or password'}), 401

    if not check_password_hash(users[username]['password'], password):
        return jsonify({'error': 'Invalid username or password'}), 401

    session['user'] = username
    return jsonify({
        'message': 'Login successful',
        'user': {
            'username': username,
            'fullname': users[username]['fullname'],
            'tripCount': len(users[username].get('trips', []))
        }
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/me')
def get_current_user():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    users = load_json('users.json')
    username = session['user']

    if username not in users:
        session.pop('user', None)
        return jsonify({'error': 'User not found'}), 401

    return jsonify({
        'username': username,
        'fullname': users[username]['fullname'],
        'tripCount': len(users[username].get('trips', []))
    })

# ─── Destinations Endpoint ─────────────────────────────────────────

@app.route('/api/destinations')
def get_destinations():
    destinations = load_json('destinations.json')
    return jsonify(destinations)

@app.route('/api/destinations/<int:dest_id>')
def get_destination(dest_id):
    destinations = load_json('destinations.json')
    for dest in destinations:
        if dest['id'] == dest_id:
            return jsonify(dest)
    return jsonify({'error': 'Destination not found'}), 404

# ─── Trip CRUD Endpoints ───────────────────────────────────────────

@app.route('/api/trips', methods=['GET'])
def get_trips():
    if 'user' not in session:
        return jsonify({'error': 'Login required'}), 401

    users = load_json('users.json')
    username = session['user']
    trips = users.get(username, {}).get('trips', [])
    return jsonify(trips)

@app.route('/api/trips', methods=['POST'])
def save_trip():
    if 'user' not in session:
        return jsonify({'error': 'Login required'}), 401

    data = request.get_json()
    users = load_json('users.json')
    username = session['user']

    if username not in users:
        return jsonify({'error': 'User not found'}), 404

    trip = {
        'id': len(users[username].get('trips', [])) + 1,
        'destination': data.get('destination', ''),
        'days': data.get('days', 1),
        'budget': data.get('budget', 'comfort'),
        'interests': data.get('interests', []),
        'itinerary': data.get('itinerary', []),
        'totalBudget': data.get('totalBudget', 0),
        'createdAt': data.get('createdAt', '')
    }

    if 'trips' not in users[username]:
        users[username]['trips'] = []

    users[username]['trips'].append(trip)
    save_json('users.json', users)

    return jsonify({'message': 'Trip saved successfully', 'trip': trip})

@app.route('/api/trips/<int:trip_id>', methods=['DELETE'])
def delete_trip(trip_id):
    if 'user' not in session:
        return jsonify({'error': 'Login required'}), 401

    users = load_json('users.json')
    username = session['user']

    if username not in users:
        return jsonify({'error': 'User not found'}), 404

    trips = users[username].get('trips', [])
    users[username]['trips'] = [t for t in trips if t.get('id') != trip_id]
    save_json('users.json', users)

    return jsonify({'message': 'Trip deleted successfully'})

# ─── Weather Proxy Endpoint ────────────────────────────────────────

@app.route('/api/weather/<city>')
def get_weather(city):
    try:
        # Current weather
        current_url = f'https://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={WEATHER_API_KEY}&units=metric'
        current_resp = requests.get(current_url, timeout=5)

        # 5-day forecast
        forecast_url = f'https://api.openweathermap.org/data/2.5/forecast?q={city},IN&appid={WEATHER_API_KEY}&units=metric&cnt=40'
        forecast_resp = requests.get(forecast_url, timeout=5)

        if current_resp.status_code == 200 and forecast_resp.status_code == 200:
            current_data = current_resp.json()
            forecast_data = forecast_resp.json()

            # Process forecast to get daily summaries
            daily_forecast = []
            seen_dates = set()
            for item in forecast_data.get('list', []):
                date = item['dt_txt'].split(' ')[0]
                if date not in seen_dates and len(daily_forecast) < 5:
                    seen_dates.add(date)
                    daily_forecast.append({
                        'date': date,
                        'temp': round(item['main']['temp']),
                        'temp_min': round(item['main']['temp_min']),
                        'temp_max': round(item['main']['temp_max']),
                        'humidity': item['main']['humidity'],
                        'description': item['weather'][0]['description'],
                        'icon': item['weather'][0]['icon'],
                        'wind': round(item['wind']['speed'], 1)
                    })

            return jsonify({
                'current': {
                    'temp': round(current_data['main']['temp']),
                    'feels_like': round(current_data['main']['feels_like']),
                    'humidity': current_data['main']['humidity'],
                    'description': current_data['weather'][0]['description'],
                    'icon': current_data['weather'][0]['icon'],
                    'wind': round(current_data['wind']['speed'], 1),
                    'city': current_data['name']
                },
                'forecast': daily_forecast
            })
        else:
            # Return mock data if API fails
            return jsonify(get_mock_weather(city))

    except Exception as e:
        # Return mock weather data as fallback
        return jsonify(get_mock_weather(city))

def get_mock_weather(city):
    """Fallback mock weather data when API is unavailable"""
    import random
    conditions = [
        {'description': 'clear sky', 'icon': '01d'},
        {'description': 'few clouds', 'icon': '02d'},
        {'description': 'scattered clouds', 'icon': '03d'},
        {'description': 'broken clouds', 'icon': '04d'},
        {'description': 'light rain', 'icon': '10d'},
    ]
    cond = random.choice(conditions)
    base_temp = random.randint(22, 35)

    forecast = []
    from datetime import datetime, timedelta
    for i in range(5):
        day_cond = random.choice(conditions)
        day_temp = base_temp + random.randint(-3, 3)
        forecast.append({
            'date': (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d'),
            'temp': day_temp,
            'temp_min': day_temp - 3,
            'temp_max': day_temp + 4,
            'humidity': random.randint(40, 80),
            'description': day_cond['description'],
            'icon': day_cond['icon'],
            'wind': round(random.uniform(2, 15), 1)
        })

    return {
        'current': {
            'temp': base_temp,
            'feels_like': base_temp + 2,
            'humidity': random.randint(40, 80),
            'description': cond['description'],
            'icon': cond['icon'],
            'wind': round(random.uniform(2, 15), 1),
            'city': city.title()
        },
        'forecast': forecast,
        'mock': True
    }

# ─── Run Server ────────────────────────────────────────────────────

if __name__ == '__main__':
    os.makedirs(DATA_DIR, exist_ok=True)
    print("\n[*] VoyageAI Travel Planner is running!")
    print("[>] Open http://localhost:5000 in your browser\n")
    app.run(debug=True, port=5000)
