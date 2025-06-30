import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { 
  Palette, 
  Globe, 
  DollarSign, 
  ChevronRight,
  Moon,
  Sun,
  ArrowLeft,
  Settings as SettingsIcon,
  RotateCcw
} from 'lucide-react-native';
import CustomModal from '@/components/CustomModal';
import TimezoneSelector from '@/components/TimezoneSelector';
import CurrencySelector from '@/components/CurrencySelector';
import ResetConfirmationModal from '@/components/ResetConfirmationModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEMES = [
  { label: 'Opal', value: 'default', description: 'Classic black and white' },
  { label: 'Sapphire', value: 'blue', description: 'Professional blue tones' },
  { label: 'Emerald', value: 'green', description: 'Nature-inspired green' },
];

export default function SettingsScreen() {
  const { colors, theme, toggleTheme, changeTheme, variant, resetTheme } = useTheme();
  const { userSettings, updateSettings, resetSettings } = useSettings();
  const { clearAllExpenses } = useExpense();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleThemeSelect = (selectedVariant: string) => {
    changeTheme(selectedVariant as any);
  };

  const handleTimezoneSelect = (timezone: string) => {
    updateSettings({ timezone });
  };

  const handleCurrencySelect = (currencyCode: string, currencySymbol: string) => {
    updateSettings({ 
      currency: currencyCode, 
      currencySymbol: currencySymbol 
    });
  };

  // IMPROVED: Enhanced reset app data function with confirmation modal
  const handleResetAppData = () => {
    setShowResetModal(true);
  };

  const performReset = async () => {
    try {
      // Show loading state
      Alert.alert('Resetting...', 'Please wait while we reset your data.');
      
      // Clear all expenses first
      await clearAllExpenses();
      
      // Reset all settings
      await resetSettings();
      
      // FIXED: Reset theme preferences as well
      await resetTheme();
      
      // Close the modal
      setShowResetModal(false);
      
      // Success message
      Alert.alert(
        'Reset Complete', 
        'All data has been cleared successfully. The app will now restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigation to setup
              router.replace('/setup');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Reset failed:', error);
      setShowResetModal(false);
      Alert.alert(
        'Reset Failed', 
        'There was an error resetting your data. Please try again or restart the app manually.',
        [
          { text: 'OK' },
          {
            text: 'Try Again',
            onPress: handleResetAppData
          }
        ]
      );
    }
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingsItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* FIXED: Apply theme colors to status bar background */}
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
      <SafeAreaView style={styles.safeContainer}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <SettingsIcon size={28} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
            
            <SettingsItem
              icon={<Palette size={20} color={colors.primary} />}
              title="Theme"
              subtitle={`${variant.charAt(0).toUpperCase() + variant.slice(1)} theme`}
              onPress={() => setShowThemeModal(true)}
            />

            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: colors.border }]}
              onPress={toggleTheme}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                  {theme === 'dark' ? (
                    <Moon size={20} color={colors.primary} />
                  ) : (
                    <Sun size={20} color={colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.settingsTitle, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
                    {theme === 'dark' ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <SettingsItem
              icon={<Globe size={20} color={colors.primary} />}
              title="Timezone"
              subtitle={userSettings.timezone}
              onPress={() => setShowTimezoneModal(true)}
            />

            <SettingsItem
              icon={<DollarSign size={20} color={colors.primary} />}
              title="Currency"
              subtitle={`${userSettings.currency} (${userSettings.currencySymbol})`}
              onPress={() => setShowCurrencyModal(true)}
            />
          </View>

          {/* IMPROVED: Data Management Section with destructive styling */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              DATA MANAGEMENT
            </Text>
            
            <TouchableOpacity 
              style={[styles.settingsItem, { borderBottomColor: colors.border }]}
              onPress={handleResetAppData}
            >
              <View style={styles.settingsItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#ef4444' + '15' }]}>
                  <RotateCcw size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={[styles.settingsTitle, { color: '#ef4444' }]}>
                    Reset App Data
                  </Text>
                  <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
                    Clear all expenses and settings
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
            
            <View style={[styles.aboutCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.aboutHeader}>
                <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.logo, { color: colors.background }]}>ExTr</Text>
                </View>
                <View style={styles.aboutInfo}>
                  <Text style={[styles.aboutTitle, { color: colors.text }]}>ExTr - Expense Tracker</Text>
                  <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>
                    Version 1.0.0
                  </Text>
                </View>
              </View>
              <Text style={[styles.aboutDescription, { color: colors.textSecondary }]}>
                A simple and elegant expense tracking app to help you manage your finances with ease.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Custom Modals */}
        <CustomModal
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          title="Select Theme"
          options={THEMES}
          selectedValue={variant}
          onSelect={handleThemeSelect}
        />

        <TimezoneSelector
          visible={showTimezoneModal}
          onClose={() => setShowTimezoneModal(false)}
          selectedValue={userSettings.timezone}
          onSelect={handleTimezoneSelect}
        />

        <CurrencySelector
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          selectedValue={userSettings.currency}
          onSelect={handleCurrencySelect}
        />

        {/* Reset Confirmation Modal */}
        <ResetConfirmationModal
          visible={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={performReset}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    minHeight: 44,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  aboutCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logo: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  aboutInfo: {
    flex: 1,
  },
  aboutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  aboutDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});