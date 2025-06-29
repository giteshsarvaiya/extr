# ExTr - Expense Tracker

A beautiful, minimal expense tracking app built with Expo and React Native.

## Features

- 📱 **Clean Interface**: Minimalist design with smooth animations
- 🎨 **Multiple Themes**: Opal (default), Sapphire (blue), and Emerald (green) themes
- 🌙 **Dark Mode**: Full dark mode support across all themes
- 📊 **Analytics**: View spending insights with daily, weekly, and monthly views
- 💱 **Multi-Currency**: Support for 150+ currencies with real-time formatting
- 🌍 **Timezone Support**: Accurate expense tracking across timezones
- 📱 **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Framework**: Expo SDK 52 with Expo Router
- **Language**: TypeScript
- **UI**: React Native with custom animations
- **Storage**: AsyncStorage for local data persistence
- **Icons**: Lucide React Native
- **Fonts**: Inter font family
- **Animations**: React Native Reanimated 3

## Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- EAS CLI (for building)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

This app uses EAS Build for creating production builds:

1. Install EAS CLI:
   ```bash
   npm install -g @expo/eas-cli
   ```

2. Login to your Expo account:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   eas build:configure
   ```

4. Build for Android:
   ```bash
   eas build --platform android --profile production
   ```

5. Build for iOS:
   ```bash
   eas build --platform ios --profile production
   ```

## Project Structure

```
├── app/                    # App routes (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── analytics.tsx      # Analytics screen
│   ├── settings.tsx       # Settings screen
│   ├── setup.tsx          # Initial setup
│   ├── pro.tsx           # Pro features
│   └── contact.tsx       # Contact screen
├── components/            # Reusable components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── SplashScreen.tsx  # Custom splash screen
│   └── ...
├── contexts/             # React contexts
│   ├── ThemeContext.tsx  # Theme management
│   ├── ExpenseContext.tsx # Expense data
│   └── SettingsContext.tsx # User settings
└── assets/              # Static assets
    └── images/          # App icons and images
```

## Features in Detail

### Theme System
- **Opal**: Classic black and white theme
- **Sapphire**: Professional blue tones
- **Emerald**: Nature-inspired green colors
- Each theme supports both light and dark modes

### Expense Management
- Add expenses with amount and description
- Edit and delete existing expenses
- View expenses by day, week, or month
- Real-time currency formatting

### Analytics
- Weekly and monthly spending comparisons
- Spending insights and trends
- Average daily spending calculations
- Largest expense tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please use the in-app contact form or reach out through the provided channels.

---

Made with ❤️ using Bolt.new⚡