# 🌍 VoyageAI – Smart Travel Planner

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/Flask-3.0-black.svg" alt="Flask">
  <img src="https://img.shields.io/badge/JavaScript-ES6-yellow.svg" alt="JavaScript">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

<p align="center">
  <b>An AI-inspired travel planning platform that helps users create personalized itineraries, optimize travel budgets, track expenses, explore destinations, and monitor real-time weather conditions.</b>
</p>

---

## ✨ Overview

VoyageAI is a feature-rich travel planning web application designed to simplify trip preparation and decision-making. The platform combines intelligent itinerary generation, budget analysis, weather forecasting, expense tracking, and interactive mapping into a seamless user experience.

Whether you're a backpacker planning a budget-friendly adventure or a luxury traveler organizing a premium vacation, VoyageAI provides data-driven recommendations tailored to your preferences.

---

## 🚀 Features

### 🧠 Smart Itinerary Generator

Generate personalized travel plans based on user interests and destination preferences.

**Highlights**

* Automatic day-wise itinerary generation
* Intelligent attraction ranking algorithm
* Support for 12 travel interest categories:

  * Adventure
  * Culture
  * Food
  * Nature
  * Wildlife
  * History
  * Spiritual
  * Photography
  * Beaches
  * Shopping
  * Nightlife
  * Relaxation
* Morning, Afternoon, and Evening activity distribution
* Balanced and optimized travel schedules

---

### 💰 Budget Optimizer

Discover destinations that fit your budget before planning your trip.

**Features**

* Budget-based destination recommendations
* Three travel styles:

  * Backpacker
  * Comfort
  * Luxury
* Interactive cost breakdown visualization
* Savings estimation
* Over-budget destination alerts
* Doughnut charts powered by Chart.js

---

### 📊 Expense Tracker

Track spending throughout your journey with real-time updates.

**Categories**

* Food
* Accommodation
* Transportation
* Activities
* Shopping
* Miscellaneous

**Capabilities**

* Add and remove expenses instantly
* Running trip cost calculation
* Interactive spending analytics
* Category-wise expenditure charts

---

### 🌦️ Real-Time Weather Forecast

Stay informed with accurate weather information before and during your trip.

**Weather Insights**

* Current weather conditions
* 5-day forecast
* Temperature tracking
* Humidity levels
* Wind speed monitoring

**Smart Travel Alerts**

* Heavy rain warnings
* Heat advisories
* Cold weather alerts
* Destination-specific travel recommendations

---

### 🗺️ Interactive Destination Explorer

Explore destinations through an engaging map experience.

**Map Features**

* Built with LeafletJS
* Dark-themed map interface
* 25+ curated Indian destinations
* Category-based filtering
* Search functionality
* Custom destination markers
* Smooth fly-to animations

---

### 🔐 User Authentication & Trip Management

Secure account system with personalized trip storage.

**Authentication Features**

* User registration
* Secure password hashing
* Session-based authentication
* Guest access mode
* Save and manage multiple trip plans

---

## 🛠️ Technology Stack

| Category       | Technology                    |
| -------------- | ----------------------------- |
| Backend        | Python 3, Flask 3.0           |
| Frontend       | HTML5, CSS3, JavaScript (ES6) |
| Maps           | LeafletJS                     |
| Charts         | Chart.js 4.4                  |
| Weather API    | OpenWeatherMap                |
| Authentication | Werkzeug Password Hashing     |
| Database       | JSON Flat-File Storage        |
| Fonts          | Google Fonts (Inter, Outfit)  |

---

## 📂 Project Structure

```bash
voyageai/
│
├── app.py
├── requirements.txt
├── README.md
│
├── data/
│   ├── destinations.json
│   └── users.json
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── app.js
│       ├── auth.js
│       ├── itinerary.js
│       ├── budget.js
│       ├── weather.js
│       └── map.js
│
└── templates/
    └── index.html
```

---

## ⚙️ Installation

### Prerequisites

* Python 3.8 or higher
* pip (Python Package Manager)

### Clone the Repository

```bash
git clone https://github.com/your-username/voyageai.git
cd voyageai
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Weather API

Create a free API key from OpenWeatherMap and add it to your configuration.

```python
WEATHER_API_KEY = "your_api_key_here"
```

### Run the Application

```bash
python app.py
```

### Open in Browser

```text
http://localhost:5000
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint      | Description            |
| ------ | ------------- | ---------------------- |
| POST   | /api/register | Register a new user    |
| POST   | /api/login    | User login             |
| POST   | /api/logout   | Logout current user    |
| GET    | /api/me       | Get authenticated user |

### Destinations

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | /api/destinations      | Get all destinations    |
| GET    | /api/destinations/{id} | Get destination details |

### Trip Management

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | /api/trips      | Retrieve saved trips |
| POST   | /api/trips      | Save a trip          |
| DELETE | /api/trips/{id} | Delete a trip        |

### Weather

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| GET    | /api/weather/{city} | Weather forecast data |

---

## 📸 Screenshots

| Feature               | Preview        |
| --------------------- | -------------- |
| Dashboard             | Add Screenshot |
| Itinerary Generator   | Add Screenshot |
| Budget Optimizer      | Add Screenshot |
| Interactive Map       | Add Screenshot |
| Weather Forecast      | Add Screenshot |
| Authentication System | Add Screenshot |

---

## 🔮 Future Enhancements

* OpenAI / Gemini powered itinerary generation
* Collaborative group trip planning
* Hotel booking integrations
* Flight fare tracking
* Travel reviews and ratings
* Progressive Web App (PWA) support
* Offline functionality
* Multi-language support

  * Hindi
  * Telugu
  * Tamil
  * Kannada
  * Bengali

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to GitHub

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for more information.

---

## 👨‍💻 Author

**Your Name**

* GitHub: https://github.com/your-username
