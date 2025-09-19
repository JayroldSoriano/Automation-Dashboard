# Automation Dashboard

A modern React Native application built with Expo for managing automation tasks and workflows.

## Features

- 🏠 **Dashboard Home Screen** - Overview of automation status and quick actions
- ⚙️ **Settings Screen** - Customize app preferences and account settings
- 🎨 **Modern UI** - Clean, responsive design with consistent theming
- 📱 **Cross-Platform** - Runs on iOS, Android, and Web
- 🧭 **Navigation** - Bottom tab navigation with React Navigation

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Automation-Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- **iOS**: `npm run ios` or press `i` in the terminal
- **Android**: `npm run android` or press `a` in the terminal
- **Web**: `npm run web` or press `w` in the terminal

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.js       # Custom button component
│   └── Card.js         # Card container component
├── constants/          # App constants and themes
│   ├── Colors.js       # Color palette
│   └── Layout.js       # Layout constants and dimensions
├── navigation/         # Navigation configuration
│   └── AppNavigator.js # Main navigation setup
├── screens/           # App screens
│   ├── HomeScreen.js  # Dashboard home screen
│   └── SettingsScreen.js # Settings screen
└── utils/             # Utility functions (to be added)
```

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Add the screen to the navigation in `src/navigation/AppNavigator.js`
3. Update the tab bar icons if needed

### Styling

The app uses a consistent design system defined in `src/constants/`:
- **Colors**: Centralized color palette
- **Layout**: Spacing, border radius, and responsive breakpoints

### Components

Reusable components are located in `src/components/`:
- **Button**: Customizable button with multiple variants
- **Card**: Container component with shadow and styling

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Web
```bash
expo build:web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.
