# 🏃‍♂️ RUN TRACK - GPS Running Tracker Mobile App

A modern, high-performance mobile running tracking application built with **Expo + React Native + TypeScript**. Tracks real-time GPS coordinates, renders live running routes using `react-native-maps`, calculates distance via the Haversine formula, filters GPS noise/teleport jumps, and persists workout history locally with `@react-native-async-storage/async-storage`.

---

## 📱 Features

- **Real-Time GPS Tracking**: High accuracy tracking using `expo-location` (`Location.watchPositionAsync`).
- **Live Polyline Route**: Smooth real-time path drawing with `react-native-maps`.
- **GPS Signal & Accuracy Filtering**:
  - Automatically filters stationary micro-jitter (prevents distance accumulation while standing still).
  - Outlier / GPS teleport rejection (> 13 m/s jump filter).
  - Visual GPS status badge (`GPS Ready`, `Searching GPS...`, `GPS Signal Weak`, `GPS Permission Required`).
- **Dynamic Camera Following & Recenter**:
  - Auto-follows the runner as new GPS coordinates arrive.
  - Manual pan detection with floating **"My Location"** button to snap back.
- **Running Dashboard**:
  - Large, readable athletic cards: **Distance (km)**, **Time (00:00:00)**, **Pace (min/km)**, and **Speed (km/h)**.
  - One-touch tactile control: `START RUN`, `PAUSE`, `RESUME`, and `FINISH`.
- **Run Complete Summary**:
  - Full route review with Start & Finish markers.
  - Workout summary statistics.
  - Instant save to local storage.
- **Running History**:
  - Offline-first workout history saved with `AsyncStorage`.
  - Detailed run inspection (`RunDetailScreen`).
  - Delete workout capability.
- **Athlete Profile**:
  - Cumulative metrics: Total Runs, Total Distance, Total Time, Overall Average Pace.
  - Personal records: Longest Run, Fastest Pace, and Athlete Level Badges.

---

## 📁 Project Structure

```text
run-track/
├── App.tsx                       # App root with SafeAreaProvider & AppNavigator
├── app.json                      # Expo config with iOS/Android location permissions
├── package.json                  # Dependencies & scripts
├── tests/
│   └── unit_test.ts              # Unit tests for Haversine, Pace, Speed, & Time
└── src/
    ├── types/
    │   └── run.ts                # TypeScript interfaces (GPSCoordinate, RunRecord, etc.)
    ├── components/
    │   ├── GPSStatus.tsx         # GPS status badge & alert indicator
    │   ├── RunButton.tsx         # Tactile Start / Pause / Resume / Finish buttons
    │   └── StatCard.tsx          # Sporty metric card for large readable stats
    ├── navigation/
    │   └── AppNavigator.tsx      # Bottom Tab Navigator (Home, History, Profile) & Native Stack
    ├── screens/
    │   ├── HomeScreen.tsx        # Live GPS Map, Polyline, & Real-time dashboard
    │   ├── SummaryScreen.tsx     # Post-run summary, full route review & save
    │   ├── HistoryScreen.tsx     # Running history list with pull-to-refresh
    │   ├── RunDetailScreen.tsx   # Detailed run route map & verified metrics
    │   └── ProfileScreen.tsx     # Lifetime totals, personal bests & runner badge
    ├── services/
    │   ├── locationService.ts    # expo-location permissions and watchPosition wrapper
    │   └── storageService.ts     # AsyncStorage CRUD operations & profile aggregator
    └── utils/
        ├── distanceCalculator.ts # Haversine formula & GPS noise/jump filtering
        ├── paceCalculator.ts     # Real-time Pace (M:SS) & Speed (km/h) calculations
        └── timeFormatter.ts      # Stopwatch timer & readable date formatters
```

---

## 🛠️ Technology Stack

- **Framework**: Expo (SDK 52+ / 57)
- **Core**: React Native 0.86+, React 19, TypeScript
- **Maps**: `react-native-maps`
- **Location / GPS**: `expo-location`
- **Storage**: `@react-native-async-storage/async-storage`
- **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **Icons**: `@expo/vector-icons` (Ionicons)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your physical mobile device, OR an Android Emulator / iOS Simulator.

### 2. Installation
Navigate to the project directory:
```bash
cd "C:\Users\Anyarat Sawangchaeng\.gemini\antigravity\scratch\run-track"
npm install
```

### 3. Start Development Server

#### To run on Web Browser (Chrome, Edge, Safari):
```bash
npx expo start --web
```
Or run `npx expo start` and press **`w`** on your keyboard.
The app will automatically open in your default browser at `http://localhost:8081` with interactive OpenStreetMap/Leaflet tiles and GPS tracking!

#### To run for Mobile (Expo Go, Android, iOS):
```bash
npx expo start
```
- Press **`a`** for Android Emulator
- Press **`i`** for iOS Simulator
- Scan the QR code with **Expo Go** on your physical phone

---

## 🧭 How to Test Real GPS Movement

### Method A: Physical Mobile Device (Recommended for Real Running)
1. Install **Expo Go** from App Store (iOS) or Google Play (Android).
2. Run `npx expo start` in terminal.
3. Scan the QR code using the Expo Go app (Android) or Camera app (iOS).
4. Tap **"Allow while using app"** when prompted for location permission.
5. Tap **START RUN** and walk or run outside. Watch the map draw your actual route in real-time!

---

### Method B: iOS Simulator (GPS Route Simulation)
iOS Simulator allows simulating continuous running workouts with real GPS coordinates:
1. In Xcode Simulator menu, go to **Features** > **Location**.
2. Select **"City Run"** (simulates jogging through Cupertino/San Francisco) or **"Freeway Drive"**.
3. In the RUN TRACK app, tap **START RUN**.
4. You will see the runner marker moving along the streets and drawing a real-time green Polyline, with distance, speed, and pace updating continuously!
5. You can also load a custom `.gpx` file via **Features** > **Location** > **Custom Location...**.

---

### Method C: Android Emulator (Route Playback)
Android Studio Emulator includes built-in GPS route playback:
1. On the Emulator side toolbar, click the **"..." (Extended Controls)** icon.
2. Select the **Location** tab.
3. In the **Routes** tab, you can:
   - Select predefined points or import a `.gpx` or `.kml` walking/running route.
   - Set the playback speed (e.g., `10 km/h` for realistic running).
   - Click **"Play Route"**.
4. In RUN TRACK, tap **START RUN**. The app will detect the simulated movement and draw the polyline route accurately.

---

## 🧪 Running Verification Tests

Run the built-in unit tests to verify Haversine distance calculations, stationary drift filtering, and pace formatting:
```bash
npx tsx tests/unit_test.ts
```

Check TypeScript types without errors:
```bash
npx tsc --noEmit
```
