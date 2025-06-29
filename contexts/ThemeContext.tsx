import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';
type ThemeVariant = 'default' | 'blue' | 'green';

interface Colors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  statusBarBackground: string;
  // Additional colors for better theme consistency
  accent: string;
  success: string;
  warning: string;
  error: string;
  cardBackground: string;
  inputBackground: string;
  shadowColor: string;
}

interface ThemeContextType {
  theme: ThemeType;
  variant: ThemeVariant;
  colors: Colors;
  toggleTheme: () => void;
  changeTheme: (variant: ThemeVariant) => void;
  resetTheme: () => void; // ADDED: Function to reset theme to defaults
}

const lightColors: Record<ThemeVariant, Colors> = {
  default: {
    background: '#ffffff',
    surface: '#f8f9fa',
    cardBackground: '#ffffff',
    inputBackground: '#f8f9fa',
    primary: '#000000',
    text: '#000000',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    statusBarBackground: '#000000',
    accent: '#374151',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#000000',
  },
  blue: {
    background: '#ffffff',
    surface: '#f1f5f9',
    cardBackground: '#ffffff',
    inputBackground: '#f1f5f9',
    primary: '#3b82f6',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    statusBarBackground: '#1e40af',
    accent: '#1e40af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#1e293b',
  },
  green: {
    background: '#ffffff',
    surface: '#f0fdf4',
    cardBackground: '#ffffff',
    inputBackground: '#f0fdf4',
    primary: '#22c55e',
    text: '#14532d',
    textSecondary: '#16a34a',
    border: '#dcfce7',
    statusBarBackground: '#15803d',
    accent: '#15803d',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#14532d',
  },
};

const darkColors: Record<ThemeVariant, Colors> = {
  default: {
    background: '#000000',
    surface: '#1a1a1a',
    cardBackground: '#1a1a1a',
    inputBackground: '#262626',
    primary: '#ffffff',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: '#374151',
    statusBarBackground: '#000000',
    accent: '#6b7280',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#000000',
  },
  blue: {
    background: '#0f172a',
    surface: '#1e293b',
    cardBackground: '#1e293b',
    inputBackground: '#334155',
    primary: '#60a5fa',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    statusBarBackground: '#0f172a',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#0f172a',
  },
  green: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    cardBackground: '#1a1a1a',
    inputBackground: '#262626',
    primary: '#4ade80',
    text: '#ecfdf5',
    textSecondary: '#86efac',
    border: '#166534',
    statusBarBackground: '#0a0a0a',
    accent: '#22c55e',
    success: '#4ade80',
    warning: '#f59e0b',
    error: '#ef4444',
    shadowColor: '#0a0a0a',
  },
};

// ADDED: Default theme values
const DEFAULT_THEME: ThemeType = 'light';
const DEFAULT_VARIANT: ThemeVariant = 'default';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [variant, setVariant] = useState<ThemeVariant>(DEFAULT_VARIANT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preferences from storage
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedVariant = await AsyncStorage.getItem('themeVariant');
        
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        }
        
        if (savedVariant && ['default', 'blue', 'green'].includes(savedVariant)) {
          setVariant(savedVariant as ThemeVariant);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreferences();
  }, []);

  // Save theme preferences to storage
  const saveThemePreferences = async (newTheme: ThemeType, newVariant: ThemeVariant) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      await AsyncStorage.setItem('themeVariant', newVariant);
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveThemePreferences(newTheme, variant);
  };

  const changeTheme = (newVariant: ThemeVariant) => {
    setVariant(newVariant);
    saveThemePreferences(theme, newVariant);
  };

  // ADDED: Function to reset theme to defaults
  const resetTheme = async () => {
    try {
      // Remove theme preferences from storage
      await AsyncStorage.multiRemove(['theme', 'themeVariant']);
      
      // Reset to default values
      setTheme(DEFAULT_THEME);
      setVariant(DEFAULT_VARIANT);
      
      if (__DEV__) {
        console.log('Theme reset to defaults');
      }
    } catch (error) {
      console.error('Error resetting theme:', error);
      throw error;
    }
  };

  const colors = theme === 'light' ? lightColors[variant] : darkColors[variant];

  // Don't render children until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        variant,
        colors,
        toggleTheme,
        changeTheme,
        resetTheme, // ADDED: Expose reset function
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};