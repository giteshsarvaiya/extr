import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomSplashScreen from '@/components/SplashScreen';
import { Platform, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Inner component that has access to theme context
function AppContent() {
  const { colors, theme } = useTheme();
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="setup" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="contact" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* Global Status Bar - Properly themed */}
      <StatusBar 
        style={theme === 'dark' ? 'dark' : 'light'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (showCustomSplash) {
    return (
      <ThemeProvider>
        <CustomSplashScreen onAnimationComplete={handleSplashComplete} />
      </ThemeProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SettingsProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}