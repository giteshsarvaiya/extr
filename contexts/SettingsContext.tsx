import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserSettings {
  timezone: string;
  currency: string;
  currencySymbol: string;
  isSetupComplete?: boolean; // Add setup completion flag
}

interface SettingsContextType {
  userSettings: UserSettings;
  loading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>; // Add reset function for debugging
}

const defaultSettings: UserSettings = {
  timezone: '', // CHANGED: Empty string to force setup
  currency: 'USD',
  currencySymbol: '$',
  isSetupComplete: false, // ADDED: Explicit setup completion flag
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // ADDED: Clear any corrupted data on first load (for debugging)
      if (__DEV__) {
        console.log('Loading settings...');
      }

      const savedSettings = await AsyncStorage.getItem('userSettings');
      
      if (__DEV__) {
        console.log('Saved settings from storage:', savedSettings);
      }

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // ADDED: Validate that settings are complete
        const isValidSettings = parsedSettings.timezone && 
                               parsedSettings.currency && 
                               parsedSettings.currencySymbol &&
                               parsedSettings.isSetupComplete;

        if (isValidSettings) {
          setUserSettings({ ...defaultSettings, ...parsedSettings });
          if (__DEV__) {
            console.log('Valid settings loaded:', parsedSettings);
          }
        } else {
          // ADDED: If settings are incomplete, reset to defaults
          if (__DEV__) {
            console.log('Incomplete settings found, resetting to defaults');
          }
          setUserSettings(defaultSettings);
          await AsyncStorage.removeItem('userSettings');
        }
      } else {
        if (__DEV__) {
          console.log('No saved settings found, using defaults');
        }
        setUserSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // ADDED: On error, reset to defaults
      setUserSettings(defaultSettings);
      try {
        await AsyncStorage.removeItem('userSettings');
      } catch (clearError) {
        console.error('Error clearing corrupted settings:', clearError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = { ...userSettings, ...newSettings };
      
      // ADDED: Mark setup as complete when timezone is set
      if (newSettings.timezone && !userSettings.isSetupComplete) {
        updatedSettings.isSetupComplete = true;
      }

      setUserSettings(updatedSettings);
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      if (__DEV__) {
        console.log('Settings updated:', updatedSettings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  // ADDED: Reset function for debugging
  const resetSettings = async () => {
    try {
      await AsyncStorage.removeItem('userSettings');
      setUserSettings(defaultSettings);
      if (__DEV__) {
        console.log('Settings reset to defaults');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        userSettings,
        loading,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};