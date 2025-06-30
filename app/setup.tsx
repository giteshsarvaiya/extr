import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ChevronRight, Globe, DollarSign, ChevronDown } from 'lucide-react-native';
import TimezoneSelector from '@/components/TimezoneSelector';
import CurrencySelector from '@/components/CurrencySelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CURRENCIES = [
  { label: 'US Dollar ($)', value: 'USD', symbol: '$' },
  { label: 'Euro (€)', value: 'EUR', symbol: '€' },
  { label: 'British Pound (£)', value: 'GBP', symbol: '£' },
  { label: 'Japanese Yen (¥)', value: 'JPY', symbol: '¥' },
  { label: 'Canadian Dollar (C$)', value: 'CAD', symbol: 'C$' },
];

export default function SetupScreen() {
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] = useState('$');
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  
  const { colors, theme } = useTheme();
  const { updateSettings } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleComplete = async () => {
    try {
      // IMPROVED: Mark setup as complete with all required settings
      await updateSettings({
        timezone: selectedTimezone,
        currency: selectedCurrency,
        currencySymbol: selectedCurrencySymbol,
        isSetupComplete: true, // ADDED: Explicit completion flag
      });
      
      if (__DEV__) {
        console.log('Setup completed with settings:', {
          timezone: selectedTimezone,
          currency: selectedCurrency,
          currencySymbol: selectedCurrencySymbol,
          isSetupComplete: true
        });
      }
      
      router.replace('/');
    } catch (error) {
      console.error('Error completing setup:', error);
      // Show error to user but still try to navigate
      router.replace('/');
    }
  };

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone);
    setShowTimezoneSelector(false);
  };

  const handleCurrencySelect = (currencyCode: string, currencySymbol: string) => {
    setSelectedCurrency(currencyCode);
    setSelectedCurrencySymbol(currencySymbol);
    setShowCurrencySelector(false);
  };

  const getTimezoneDisplayName = (timezone: string) => {
    // Convert timezone to a more readable format
    const parts = timezone.split('/');
    const city = parts[parts.length - 1] || timezone;
    return city.replace(/_/g, ' ');
  };

  const getCurrencyDisplayName = (currencyCode: string, symbol: string) => {
    const currency = CURRENCIES.find(c => c.value === currencyCode);
    return currency ? currency.label : `${currencyCode} (${symbol})`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* FIXED: Proper status bar configuration for dark mode */}
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={theme === 'dark' ? colors.background : colors.statusBarBackground}
        translucent={false}
      />
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) }]}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logo, { color: colors.background }]}>ExTr</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome to ExTr</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Let's set up your expense tracking preferences
            </Text>
          </View>

          <View style={styles.setupCards}>
            {/* Timezone Selection Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Globe size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Timezone</Text>
              </View>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                Choose your timezone for accurate expense tracking
              </Text>
              <TouchableOpacity
                style={[styles.selectorButton, { 
                  borderColor: colors.border,
                  backgroundColor: colors.background 
                }]}
                onPress={() => setShowTimezoneSelector(true)}
                activeOpacity={0.7}
              >
                <View style={styles.selectorContent}>
                  <Text style={[styles.selectorText, { color: colors.text }]}>
                    {getTimezoneDisplayName(selectedTimezone)}
                  </Text>
                  <Text style={[styles.selectorSubtext, { color: colors.textSecondary }]}>
                    {selectedTimezone}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Currency Selection Card */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <DollarSign size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Currency</Text>
              </View>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                Select your preferred currency for expense display
              </Text>
              <TouchableOpacity
                style={[styles.selectorButton, { 
                  borderColor: colors.border,
                  backgroundColor: colors.background 
                }]}
                onPress={() => setShowCurrencySelector(true)}
                activeOpacity={0.7}
              >
                <View style={styles.selectorContent}>
                  <Text style={[styles.selectorText, { color: colors.text }]}>
                    {getCurrencyDisplayName(selectedCurrency, selectedCurrencySymbol)}
                  </Text>
                  <Text style={[styles.selectorSubtext, { color: colors.textSecondary }]}>
                    {selectedCurrency} • {selectedCurrencySymbol}
                  </Text>
                </View>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Text style={[styles.completeButtonText, { color: colors.background }]}>
              Get Started
            </Text>
            <ChevronRight size={20} color={colors.background} />
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            You can change these settings anytime in the app settings
          </Text>
        </ScrollView>

        {/* Timezone Selector Modal */}
        <TimezoneSelector
          visible={showTimezoneSelector}
          onClose={() => setShowTimezoneSelector(false)}
          selectedValue={selectedTimezone}
          onSelect={handleTimezoneSelect}
        />

        {/* Currency Selector Modal */}
        <CurrencySelector
          visible={showCurrencySelector}
          onClose={() => setShowCurrencySelector(false)}
          selectedValue={selectedCurrency}
          onSelect={handleCurrencySelect}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  setupCards: {
    gap: 12,
    marginBottom: 40,
  },
  card: {
    padding: 24,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 40,
  },
  selectorContent: {
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  selectorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 56,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
});