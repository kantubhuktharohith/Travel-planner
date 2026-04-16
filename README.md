# 🌍 VoyageAI — Smart Travel Planner

A feature-rich travel planner web application with AI-powered itinerary generation, budget optimization, real-time weather forecasting, and interactive maps.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Key Features

### 🧠 Smart Itinerary Generator
- Auto-generates day-wise travel plans based on your interests
- Preference-based scoring algorithm ranks attractions intelligently
- Supports 12 interest categories: Adventure, Culture, Food, Nature, and more
- Morning / Afternoon / Evening slot distribution

### 💰 Budget Optimizer
- Enter your total budget → get ranked destination suggestions
- Three tiers: Backpacker, Comfort, and Luxury
- Visual cost breakdown with interactive doughnut chart (Chart.js)
- Shows savings and identifies over-budget destinations

### 📊 Expense Tracker
- Track trip expenses by category (Food, Stay, Transport, Activities, Shopping, Misc)
- Real-time bar chart visualization
- Running total with add/remove functionality

### 🌦️ Real-Time Weather
- Live weather data via OpenWeatherMap API
- 5-day forecast with temperature, humidity, and wind details
- Smart travel alerts (heat warnings, rain alerts, cold advisories)
- Context-aware travel tips based on conditions and destination type

### 🗺️ Interactive Map
- LeafletJS-powered map with dark theme tiles
- Custom markers for 25+ Indian destinations
- Search and filter by category (Beach, Adventure, Culture, Nature, etc.)
- Click-to-explore with fly-to animations

### 🔐 Login System
- User registration with password hashing (werkzeug)
- Flask session-based authentication
- Save and manage multiple trip plans
- Guest mode for quick exploration

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Python 3, Flask 3.0 |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Maps** | LeafletJS (open-source) |
| **Charts** | Chart.js 4.4 |
| **Weather API** | OpenWeatherMap |
| **Typography** | Google Fonts (Inter, Outfit) |
| **Auth** | werkzeug password hashing |
| **Data Storage** | JSON flat-file database |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Steps

1. **Clone / Download** the project

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python app.py
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5000`

---

## 📁 Project Structure

```
travel planner/
├── app.py                    # Flask backend — routes & API endpoints
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── data/
│   ├── destinations.json     # 25 curated Indian destinations
│   └── users.json            # User data & saved trips
├── static/
│   ├── css/
│   │   └── style.css         # Complete design system (700+ lines)
│   └── js/
│       ├── app.js            # SPA navigation & state management
│       ├── auth.js           # Login / Register / Logout
│       ├── itinerary.js      # Smart itinerary generation algorithm
│       ├── budget.js         # Budget optimizer & expense tracker
│       ├── weather.js        # Weather API integration
│       └── map.js            # LeafletJS interactive map
└── templates/
    └── index.html            # Single-page application template
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve the SPA |
| `POST` | `/api/register` | Create new user account |
| `POST` | `/api/login` | Authenticate user |
| `POST` | `/api/logout` | End user session |
| `GET` | `/api/me` | Get current user info |
| `GET` | `/api/destinations` | List all destinations |
| `GET` | `/api/destinations/<id>` | Get destination details |
| `GET` | `/api/trips` | Get user's saved trips |
| `POST` | `/api/trips` | Save a new trip |
| `DELETE` | `/api/trips/<id>` | Delete a saved trip |
| `GET` | `/api/weather/<city>` | Get weather forecast |

---

## 📸 Screenshots

| Dashboard | Itinerary Generator |
|-----------|-------------------|
| Stats, quick actions, popular destinations | AI-powered day-wise planning |

| Budget Optimizer | Interactive Map |
|-----------------|----------------|
| Cost breakdown with charts | LeafletJS with dark theme |

| Weather Forecast | Login System |
|-----------------|-------------|
| 5-day forecast with travel tips | Secure auth with guest mode |

---

## 🔮 Future Scope

- **AI Integration**: Connect to OpenAI/Gemini for truly intelligent itinerary suggestions
- **Group Planning**: Share and collaborate on trip plans with friends
- **Hotel Booking API**: Integration with MakeMyTrip or Booking.com
- **Flight Price Tracker**: Compare and monitor flight prices
- **Social Features**: Reviews, ratings, and travel community
- **PWA Support**: Offline access and mobile app experience
- **Multi-language**: Support for Hindi, Tamil, Telugu, and more

---

## 👨‍💻 Author

Developed as a Mini Project for academic submission.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
