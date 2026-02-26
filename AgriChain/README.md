# AgriChain (Expo React Native)

AgriChain is a React Native Expo app focused on farmer decision support:
- harvest timing guidance
- mandi selection support
- simple recommendation reasoning

## Tech Stack

- Expo SDK 55
- React Native
- React Navigation (bottom tabs + stack)
- React Native Paper
- Axios
- OpenWeatherMap API (7-day weather)
- data.gov.in Agmarknet API (mandi prices)

## Current Features

- Home screen with themed dashboard cards
- Bottom tab navigation: Home, Market, ARIA, Profile
- Crop input flow:
  - crop selection
  - district selection
  - soil type
  - sowing date
  - storage type
  - transit time slider (1-48 hours)
- Recommendation screen:
  - Best Harvest Window card
  - Best Mandi card with price range and earnings comparison
  - "Why we recommend this" expandable reasoning card (open by default)
- API + fallback logic:
  - tries live weather and mandi APIs
  - falls back to calculated/mock recommendations if API is unavailable

## Prerequisites

- Node.js 20.19.4 or newer (24.x recommended)
- npm
- Expo Go app on Android device
- Android Platform Tools (`adb`) for USB debugging workflow

## Install

```bash
npm install
```

## Run (Android with Expo Go)

```bash
npm run android
```

If you use a physical Android phone:
1. Enable Developer Options and USB debugging.
2. Connect phone by USB and approve debugging prompt.
3. Confirm detection:

```bash
adb devices
```

## Environment Variables

Create a `.env` file in project root:

```env
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
EXPO_PUBLIC_DATA_GOV_API_KEY=your_data_gov_key
```

Notes:
- `EXPO_PUBLIC_OPENWEATHER_API_KEY` is used for OpenWeatherMap One Call weather data.
- `EXPO_PUBLIC_DATA_GOV_API_KEY` is used for Agmarknet mandi price data.
- If either API fails or key is missing, app automatically uses fallback calculations.

## Navigation Flow

- Home -> Harvest Advisor -> Crop Input -> Recommendation

## Project Structure

```text
src/
  data/
    agriOptions.js
  screens/
    HomeScreen.js
    CropInputScreen.js
    RecommendationScreen.js
    MarketScreen.js
    AriaScreen.js
    ProfileScreen.js
  services/
    recommendationService.js
  theme/
    colors.js
App.js
```

## Scripts

- `npm start` - start Expo dev server
- `npm run android` - run on Android
- `npm run ios` - run on iOS (macOS required)
- `npm run web` - run web preview
