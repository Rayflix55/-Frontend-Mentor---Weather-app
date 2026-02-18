# Weather App — Frontend Mentor Challenge

A fully responsive weather dashboard built as a **Frontend Mentor challenge** by **Rayflix**. Features real-time weather data display, hourly and daily forecasts, unit conversion dropdowns, a favorites system, voice search via microphone, and a holographic card hover effect — all wrapped in a deep dark UI with animated background images.

---

## 🌐 Live Site

Coded by [Rayflix](https://rayflixthetechbro.vercel.app)

---

## ✨ Features

### 🔍 Search & Navigation
- City search bar with live autocomplete suggestions
- Voice search via browser microphone (🎤 mic button)
- Search suggestions dropdown with glassmorphism styling
- Smooth AOS scroll animations on page load

### ⭐ Favorites System
- Save favorite cities via the **Favorites** dropdown
- Add current location to favorites with one click
- Scrollable favorites list with max height overflow

### 🌡️ Unit Conversion
- Toggle between **Celsius (°C)** and **Fahrenheit (°F)**
- Toggle wind speed between **km/h** and **mph**
- Persistent selected unit displayed in the navbar button

### 📊 Weather Sections

| Section | Description |
|---|---|
| **Current Weather** | City name, date, condition, and temperature |
| **Today's Highlights** | Humidity, Wind Speed, UV Index, Feels Like — holographic hover cards |
| **Daily Forecast** | 7-day forecast with weather icons (Sun–Sat) |
| **Hourly Forecast** | 8-hour scrollable forecast with day selector dropdown |

### 🎨 UI & Design
- Dark navy background (`rgba(2, 1, 44, 1)`) with full-cover thunderstorm background image
- Mobile-specific background image (`Mobile-image.jpg`) for screens under 768px
- Animated header text with color-cycling glow effect (white → orange → yellow)
- **Holographic card effect** on Today's Highlights — cyan shimmer on hover with scale transform
- Glassmorphism dropdowns with `backdrop-filter: blur` across all menus
- Custom SVG background overlays on search input and current weather card
- Attribution links with matching color-cycle animation

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure |
| **CSS3** | Custom animations, holographic effects, glassmorphism, responsive layout |
| **Tailwind CSS (v4 Browser)** | Utility-first layout and spacing |
| **JavaScript (Vanilla)** | Search logic, dropdown toggles, unit conversion, favorites, mic input |
| **AOS (Animate On Scroll)** | Scroll-triggered entrance animations |
| **Font Awesome** | Icons for search, favorites, settings, mic |
| **Google Fonts** | Agbalumo, Dancing Script |
| **OpenMeteo API** *(implied)* | Live weather data integration |
| **Web Speech API** | Voice/microphone search input |

---

## 📁 Project Structure

```
weather-app/
│
├── index.html                        # Main HTML (all sections)
├── style.css                         # All custom styles and responsive breakpoints
├── script.js                         # All JS logic (search, dropdowns, units, favorites, mic)
│
└── assets/
    └── images/
        ├── logo.svg                  # Navbar logo
        ├── favicon-32x32.png         # Browser favicon
        ├── icon-dropdown.svg         # Dropdown arrow icon
        ├── thunderstorm-village.jpg  # Desktop background image
        ├── Mobile-image.jpg          # Mobile background image
        ├── bg-today-large.svg        # Current weather card background
        ├── bg-today-small.svg        # Search input background
        ├── icon-sunny.webp           # Weather icon
        ├── icon-partly-cloudy.webp   # Weather icon
        ├── icon-rain.webp            # Weather icon
        ├── icon-storm.webp           # Weather icon
        ├── icon-drizzle.webp         # Weather icon
        ├── icon-fog.webp             # Weather icon
        └── icon-snow.webp            # Weather icon
```

---

## 📱 Responsive Design

| Breakpoint | Behaviour |
|---|---|
| `< 330px` | Single-column layout, 3-col daily grid, 2-col highlights grid, compact nav |
| `330px – 390px` | Stacked search, full-width cards, adjusted icon sizes |
| `391px – 480px` | Stacked search, 3-col daily grid, 2-col highlights grid |
| `481px – 767px` | Stacked search, 4-col daily grid, larger icons (65px), centered layout |
| `768px – 900px` | Stacked search, 5-col daily grid, 4-col highlights, tablet layout |
| `901px – 1000px` | Full 7-col daily grid, 4-col highlights, desktop-like layout |
| `1024px` | Full desktop layout with side-by-side hourly forecast panel |
| `> 1024px` | Side-by-side layout: weather sections left, hourly forecast right |

---

## 🚀 Running Locally

No build tools or installations required.

```bash
git clone https://github.com/Rayflix55/<repo-name>.git
cd <repo-name>
```

Then open `index.html` in your browser.

> **Note:** Voice search requires browser microphone permissions. Weather data requires a connected API (e.g. OpenMeteo) configured in `script.js`.

---

## 👤 Author

**Akpe (Rayflix) Samuel**
Frontend Developer

- 🌐 [rayflixthetechbro.vercel.app](https://rayflixthetechbro.vercel.app)
- 💻 [GitHub](https://github.com/Rayflix55)
- 📧 rayflix55@gmail.com

---

## 🏆 Challenge

- Challenge by [Frontend Mentor](https://www.frontendmentor.io)
- Coded by Rayflix

---

## 📄 License

This project is built for learning and portfolio purposes.
