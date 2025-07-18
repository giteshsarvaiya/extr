import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ChevronDown, ChevronUp, Edit, Trash2, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, setHours, setMinutes, setSeconds, setMilliseconds, isAfter, isBefore, isSameWeek, isSameMonth, isWithinInterval } from 'date-fns';
import Sidebar from '@/components/Sidebar';
import HeaderBrand from '@/components/HeaderBrand';
import ExpenseModal from '@/components/ExpenseModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CurrencyFormatter } from '@/utils/formatCurrency';
import { Platform } from 'react-native';

type ViewMode = 'daily' | 'weekly' | 'monthly';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const { expenses, addExpense, updateExpense, deleteExpense, getTotalForPeriod } = useExpense();
  const { userSettings, loading: settingsLoading } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{
    id: string;
    amount: number;
    description: string;
  } | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<{
    id: string;
    amount: number;
    description: string;
  } | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Main amount display animation values
  const mainAmountTranslateY = useRef(new Animated.Value(0)).current;
  const mainAmountScale = useRef(new Animated.Value(1)).current;
  const mainAmountOpacity = useRef(new Animated.Value(1)).current;

  // FIXED: Sticky header animation values - start completely hidden and stay hidden
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  const stickyHeaderScale = useRef(new Animated.Value(0.8)).current;
  const stickyHeaderTranslateY = useRef(new Animated.Value(-100)).current;

  // Details content animation
  const detailsTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;

  // Toggle button animation
  const toggleButtonTranslateY = useRef(new Animated.Value(0)).current;
  const toggleButtonScale = useRef(new Animated.Value(1)).current;
  const toggleButtonOpacity = useRef(new Animated.Value(1)).current;

  // FIXED: Calculate dynamic toggle button position based on content
  const getToggleButtonPosition = () => {
    // Base position calculation
    const basePosition = -200; // Reduced from -220 for better positioning
    const today = new Date();
    
    // Adjust based on view mode and content
    switch (viewMode) {
      case 'daily':
        // For daily view, check if it's today or other dates
        if (isToday(selectedDate)) {
          return basePosition; // Today has more content
        } else {
          return basePosition + 20; // Other dates might have less content
        }
      case 'weekly':
        // For weekly view, check if it's current week
        const { start: weekStart, end: weekEnd } = getPeriodRange();
        if (isWithinInterval(today, { start: weekStart, end: weekEnd })) {
          return basePosition; // Current week has more content
        } else {
          return basePosition + 30; // Other weeks might have less content
        }
      case 'monthly':
        // For monthly view, check if it's current month
        const { start: monthStart, end: monthEnd } = getPeriodRange();
        if (isWithinInterval(today, { start: monthStart, end: monthEnd })) {
          return basePosition; // Current month has more content
        } else {
          return basePosition + 40; // Other months might have less content
        }
      default:
        return basePosition;
    }
  };

  // IMPROVED: Enhanced setup check with better debugging
  useEffect(() => {
    if (__DEV__) {
      console.log('Settings loading:', settingsLoading);
      console.log('User settings:', userSettings);
      console.log('Setup complete:', userSettings.isSetupComplete);
      console.log('Timezone:', userSettings.timezone);
    }

    if (!settingsLoading) {
      // IMPROVED: Check both timezone and setup completion flag
      const needsSetup = !userSettings.timezone || 
                        userSettings.timezone === '' || 
                        !userSettings.isSetupComplete;
      
      if (__DEV__) {
        console.log('Needs setup:', needsSetup);
      }

      if (needsSetup) {
        if (__DEV__) {
          console.log('Redirecting to setup...');
        }
        router.replace('/setup');
      }
    }
  }, [settingsLoading, userSettings, router]);

  // FIXED: Animate details when showDetails changes - eliminate flash completely
  useEffect(() => {
    if (showDetails) {
      // Phase 1: Hide main amount display quickly
      Animated.parallel([
        Animated.timing(mainAmountTranslateY, {
          toValue: -200,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(mainAmountScale, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(mainAmountOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Phase 2: Show sticky header with smooth animation (delayed to prevent flash)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(stickyHeaderOpacity, {
            toValue: 1,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(stickyHeaderScale, {
            toValue: 1,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(stickyHeaderTranslateY, {
            toValue: 0,
            tension: 120,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300); // Increased delay to prevent any flash

      // Phase 3: Animate details content up
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(detailsTranslateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(detailsOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);

      // Phase 4: Animate toggle button to dynamic position
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(toggleButtonTranslateY, {
            toValue: getToggleButtonPosition(),
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(toggleButtonScale, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);

    } else {
      // FIXED: Immediately hide sticky header without any flash
      // Set values instantly to prevent any visual appearance
      stickyHeaderOpacity.setValue(0);
      stickyHeaderScale.setValue(0.8);
      stickyHeaderTranslateY.setValue(-100);

      // Phase 1: Animate toggle button down to original position
      Animated.parallel([
        Animated.spring(toggleButtonTranslateY, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(toggleButtonScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Phase 2: Hide details content
      Animated.parallel([
        Animated.timing(detailsTranslateY, {
          toValue: screenHeight,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(detailsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Phase 3: Show main amount display
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(mainAmountTranslateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(mainAmountScale, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(mainAmountOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
    }
  }, [showDetails]); // FIXED: Removed viewMode and selectedDate dependencies to prevent unnecessary animations

  // FIXED: Separate effect to handle position updates only when details are shown
  useEffect(() => {
    if (showDetails) {
      // Only animate the button position if details are currently shown
      Animated.spring(toggleButtonTranslateY, {
        toValue: getToggleButtonPosition(),
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [viewMode, selectedDate, showDetails]); // Only recalculate when details are shown

  // IMPROVED: Enhanced currency formatting with English suffixes
  const formatCurrency = (amount: number): string => {
    const symbol = userSettings?.currencySymbol || '$';
    return CurrencyFormatter.standard(amount, symbol);
  };

  // IMPROVED: Compact formatting for smaller displays (like expense items)
  const formatCurrencyCompact = (amount: number): string => {
    const symbol = userSettings?.currencySymbol || '$';
    return CurrencyFormatter.compact(amount, symbol);
  };

  // IMPROVED: Detailed formatting for analytics and comparisons
  const formatCurrencyDetailed = (amount: number): string => {
    const symbol = userSettings?.currencySymbol || '$';
    return CurrencyFormatter.detailed(amount, symbol);
  };

  const getPeriodRange = () => {
    switch (viewMode) {
      case 'daily':
        return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
      case 'weekly':
        return { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) };
      case 'monthly':
        return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
    }
  };

  const getPeriodLabel = () => {
    switch (viewMode) {
      case 'daily':
        return isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM dd, yyyy');
      case 'weekly':
        const { start, end } = getPeriodRange();
        return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy');
    }
  };

  // FIXED: Prevent navigation to future dates
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const today = new Date();
    let newDate: Date;

    switch (viewMode) {
      case 'daily':
        newDate = direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
        break;
      case 'weekly':
        newDate = direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
        break;
      case 'monthly':
        newDate = direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1);
        break;
    }

    // Prevent navigation to future dates
    if (direction === 'next') {
      // For daily view, don't allow going beyond today
      if (viewMode === 'daily' && isAfter(newDate, today)) {
        return;
      }
      
      // For weekly view, don't allow if the week contains future dates beyond today
      if (viewMode === 'weekly') {
        const weekStart = startOfWeek(newDate);
        const weekEnd = endOfWeek(newDate);
        if (isAfter(weekStart, today)) {
          return;
        }
      }
      
      // For monthly view, don't allow if the month is in the future
      if (viewMode === 'monthly') {
        const monthStart = startOfMonth(newDate);
        if (isAfter(monthStart, today)) {
          return;
        }
      }
    }

    setSelectedDate(newDate);
  };

  // FIXED: Check if next navigation is disabled
  const isNextDisabled = () => {
    const today = new Date();
    
    switch (viewMode) {
      case 'daily':
        return isToday(selectedDate) || isAfter(selectedDate, today);
      case 'weekly':
        const nextWeekStart = startOfWeek(addWeeks(selectedDate, 1));
        return isAfter(nextWeekStart, today);
      case 'monthly':
        const nextMonthStart = startOfMonth(addMonths(selectedDate, 1));
        return isAfter(nextMonthStart, today);
      default:
        return false;
    }
  };

  // UPDATED: Enhanced comparison logic based on view mode and current period
  const getComparisonData = () => {
    const now = new Date();
    const currentTotal = getTotalForPeriod(getPeriodRange().start, getPeriodRange().end);
    
    // Check if the selected period is current
    const isCurrentPeriod = (() => {
      switch (viewMode) {
        case 'daily':
          return isToday(selectedDate);
        case 'weekly':
          return isSameWeek(selectedDate, now);
        case 'monthly':
          return isSameMonth(selectedDate, now);
        default:
          return false;
      }
    })();

    // If not current period, don't show comparison
    if (!isCurrentPeriod) {
      return {
        currentTotal,
        showComparison: false,
        comparisonText: '',
        comparisonAmount: 0
      };
    }

    // Calculate comparison based on view mode
    let comparisonAmount = 0;
    let comparisonText = '';

    switch (viewMode) {
      case 'daily':
        const yesterdayStart = startOfDay(subDays(selectedDate, 1));
        const yesterdayEnd = endOfDay(subDays(selectedDate, 1));
        comparisonAmount = getTotalForPeriod(yesterdayStart, yesterdayEnd);
        comparisonText = 'vs. yesterday';
        break;
      
      case 'weekly':
        const lastWeekStart = startOfWeek(subWeeks(selectedDate, 1));
        const lastWeekEnd = endOfWeek(subWeeks(selectedDate, 1));
        comparisonAmount = getTotalForPeriod(lastWeekStart, lastWeekEnd);
        comparisonText = 'vs. prev. week';
        break;
      
      case 'monthly':
        const lastMonthStart = startOfMonth(subMonths(selectedDate, 1));
        const lastMonthEnd = endOfMonth(subMonths(selectedDate, 1));
        comparisonAmount = getTotalForPeriod(lastMonthStart, lastMonthEnd);
        comparisonText = 'vs. prev. month';
        break;
    }

    return {
      currentTotal,
      showComparison: true,
      comparisonText,
      comparisonAmount
    };
  };

  const { currentTotal, showComparison, comparisonText, comparisonAmount } = getComparisonData();

  // FIXED: Create expense date based on selected date
  const createExpenseDate = (): string => {
    const now = new Date();
    
    // If the selected date is today, use the current time
    if (isToday(selectedDate)) {
      return now.toISOString();
    }
    
    // If the selected date is in the past or future, use the current time but on the selected date
    const expenseDate = setMilliseconds(
      setSeconds(
        setMinutes(
          setHours(selectedDate, now.getHours()),
          now.getMinutes()
        ),
        now.getSeconds()
      ),
      now.getMilliseconds()
    );
    
    return expenseDate.toISOString();
  };

  // Modal handlers
  const handleAddExpense = () => {
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
    });
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (amount: number, description: string) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, amount, description);
      } else {
        await addExpense(amount, description, createExpenseDate());
      }
    } catch (error) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  // UPDATED: Delete handlers with confirmation modal
  const handleDeleteExpense = (expense: any) => {
    setDeletingExpense({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingExpense) {
      try {
        await deleteExpense(deletingExpense.id);
        setDeletingExpense(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
        Alert.alert('Error', 'Failed to delete expense');
      }
    }
  };

  // FIXED: Web-compatible date picker handling with future date prevention
  const handleDatePickerPress = () => {
    if (Platform.OS === 'web') {
      // For web, create a native HTML date input
      const input = document.createElement('input');
      input.type = 'date';
      input.value = format(selectedDate, 'yyyy-MM-dd');
      input.max = format(new Date(), 'yyyy-MM-dd'); // Set max to today - prevents future dates
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          const newDate = new Date(target.value + 'T00:00:00');
          // Double-check that the selected date is not in the future
          if (!isAfter(newDate, new Date())) {
            setSelectedDate(newDate);
          }
        }
      };
      
      // Trigger the date picker
      input.click();
    } else {
      // For mobile, use the native DateTimePicker
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      // Prevent selecting future dates
      const today = new Date();
      if (!isAfter(date, today)) {
        setSelectedDate(date);
      }
    }
    
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.created_at);
    const { start, end } = getPeriodRange();
    return expenseDate >= start && expenseDate <= end;
  });

  // Group expenses by date for weekly and monthly views
  const groupedExpenses = () => {
    if (viewMode === 'daily') {
      return [{ date: selectedDate, expenses: filteredExpenses }];
    }

    const groups: { [key: string]: any[] } = {};
    
    filteredExpenses.forEach(expense => {
      const expenseDate = new Date(expense.created_at);
      const dateKey = format(expenseDate, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    // Convert to array and sort by date (newest first)
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(dateKey => ({
        date: new Date(dateKey),
        expenses: groups[dateKey].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }));
  };

  const renderDateHeader = (date: Date) => {
    if (viewMode === 'daily') return null;

    const isDateToday = isToday(date);
    const dateLabel = isDateToday ? 'Today' : format(date, 'MMM dd, yyyy');
    const dayLabel = format(date, 'EEEE');

    return (
      <View style={[styles.dateHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.dateHeaderContent}>
          <Text style={[styles.dateHeaderDate, { color: colors.text }]}>
            {dateLabel}
          </Text>
          <Text style={[styles.dateHeaderDay, { color: colors.textSecondary }]}>
            {dayLabel}
          </Text>
        </View>
      </View>
    );
  };

  if (settingsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeContainer}>
        {/* FIXED: Main content container that won't be affected by sidebar */}
        <View style={styles.mainContent}>
          {/* FIXED: Header - Always accessible with proper z-index */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 20), zIndex: 1000 }]}>
            <HeaderBrand
              isOpen={showSidebar}
              onPress={() => setShowSidebar(true)}
            />
          </View>

          {/* FIXED: Date Selector with Navigation - Always accessible */}
          <View style={[styles.dateNavigationContainer, { zIndex: 999 }]}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigatePeriod('prev')}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={handleDatePickerPress}
              activeOpacity={0.7}
            >
              <Calendar size={20} color={colors.text} />
              <Text style={[styles.dateText, { color: colors.text }]}>{getPeriodLabel()}</Text>
              <ChevronDown size={20} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.navButton,
                isNextDisabled() && styles.navButtonDisabled
              ]}
              onPress={() => navigatePeriod('next')}
              activeOpacity={isNextDisabled() ? 1 : 0.7}
              disabled={isNextDisabled()}
            >
              <ChevronRight 
                size={20} 
                color={isNextDisabled() ? colors.textSecondary + '50' : colors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* FIXED: Divider between date header and tabs - Always accessible */}
          <View style={[styles.divider, { backgroundColor: colors.border, zIndex: 998 }]} />

          {/* FIXED: Tabs - Always accessible with proper z-index */}
          <View style={[styles.tabsContainer, { zIndex: 997 }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                viewMode === 'weekly' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setViewMode('weekly')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: viewMode === 'weekly' ? colors.primary : colors.textSecondary }
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                viewMode === 'daily' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setViewMode('daily')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: viewMode === 'daily' ? colors.primary : colors.textSecondary }
                ]}
              >
                Daily
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                viewMode === 'monthly' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setViewMode('monthly')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: viewMode === 'monthly' ? colors.primary : colors.textSecondary }
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {/* FIXED: Sticky Header - positioned below tabs with proper z-index */}
          {showDetails && (
            <Animated.View 
              style={[
                styles.fixedStickyHeader,
                { 
                  backgroundColor: colors.background,
                  borderBottomColor: colors.border,
                  opacity: stickyHeaderOpacity,
                  zIndex: 990, // FIXED: Lower z-index to stay below toggle button
                  transform: [
                    { scale: stickyHeaderScale },
                    { translateY: stickyHeaderTranslateY }
                  ]
                }
              ]}
              pointerEvents={showDetails ? 'auto' : 'none'}
            >
              <View style={styles.stickyContent}>
                <View style={[styles.amountBackground, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.stickyAmount, { color: colors.background }]}>
                    {formatCurrency(currentTotal)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* FIXED: Content area with proper positioning */}
          <View style={[styles.content, { zIndex: 1 }]}>
            {/* Main Amount Display - Always rendered but animated */}
            <Animated.View 
              style={[
                styles.amountContainer,
                {
                  transform: [
                    { translateY: mainAmountTranslateY },
                    { scale: mainAmountScale }
                  ],
                  opacity: mainAmountOpacity,
                }
              ]}
            >
              <Text style={[styles.mainAmount, { color: colors.text }]}>
                {formatCurrency(currentTotal)}
              </Text>
              {/* UPDATED: Conditional comparison display */}
              {showComparison && (
                <Text style={[styles.comparison, { color: colors.textSecondary }]}>
                  {comparisonText} {formatCurrencyDetailed(comparisonAmount)}
                </Text>
              )}
            </Animated.View>

            {/* FIXED: Animated Toggle Button - Highest z-index to stay above everything */}
            <Animated.View
              style={[
                styles.toggleButtonContainer,
                {
                  transform: [
                    { translateY: toggleButtonTranslateY },
                    { scale: toggleButtonScale }
                  ],
                  opacity: toggleButtonOpacity,
                  zIndex: 9999, // FIXED: Maximum z-index to stay above sticky header
                }
              ]}
            >
              <TouchableOpacity 
                style={[styles.toggleButton, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}
                onPress={() => setShowDetails(!showDetails)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleButtonText, { color: colors.textSecondary }]}>
                  {showDetails ? 'hide details' : 'show details'}
                </Text>
                {showDetails ? (
                  <ChevronUp size={12} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={12} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* FIXED: Animated Details Content - positioned to not interfere with header */}
            <Animated.View
              style={[
                styles.detailsContainer,
                {
                  transform: [{ translateY: detailsTranslateY }],
                  opacity: detailsOpacity,
                  zIndex: 1, // Below header elements
                }
              ]}
              pointerEvents={showDetails ? 'auto' : 'none'}
            >
              <Animated.ScrollView
                style={styles.detailsScrollView}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 40 + insets.bottom,
                  paddingTop: 80, // Extra padding to account for the toggle button
                }}
              >
                {/* Expense List with Date Headers */}
                <View style={styles.expenseList}>
                  {groupedExpenses().map((group, groupIndex) => (
                    <View key={groupIndex}>
                      {renderDateHeader(group.date)}
                      {group.expenses.map((expense) => (
                        <View key={expense.id} style={[styles.expenseItem, { borderBottomColor: colors.border }]}>
                          <View style={styles.expenseInfo}>
                            <View style={styles.expenseHeader}>
                              <Text style={[styles.expenseAmount, { color: colors.text }]}>
                                {formatCurrencyCompact(expense.amount)}
                              </Text>
                            </View>
                            <Text style={[styles.expenseDescription, { color: colors.textSecondary }]}>
                              {expense.description}
                            </Text>
                          </View>
                          <View style={styles.expenseRightSection}>
                            <Text style={[styles.expenseTime, { color: colors.textSecondary }]}>
                              {format(new Date(expense.created_at), 'h:mm a')}
                            </Text>
                            <View style={styles.expenseActions}>
                              <TouchableOpacity 
                                style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primary + '15' }]}
                                onPress={() => handleEditExpense(expense)}
                                activeOpacity={0.7}
                              >
                                <Edit size={16} color={colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error + '15' }]}
                                onPress={() => handleDeleteExpense(expense)}
                                activeOpacity={0.7}
                              >
                                <Trash2 size={16} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </Animated.ScrollView>
            </Animated.View>
          </View>

          {/* FIXED: Floating Add Button - Positioned higher from bottom with high z-index */}
          {viewMode === 'daily' && (
            <TouchableOpacity
              style={[
                styles.floatingAddButton, 
                { 
                  backgroundColor: colors.primary, 
                  shadowColor: colors.shadowColor,
                  bottom: 50 + insets.bottom,
                  zIndex: 1000, // Highest z-index to stay above everything
                }
              ]}
              onPress={handleAddExpense}
              activeOpacity={0.8}
            >
              <Plus size={24} color={colors.background} />
            </TouchableOpacity>
          )}

          {/* Date Picker - Only show on mobile platforms with future date prevention */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()} // FIXED: Prevent future date selection
            />
          )}

          {/* Expense Modal */}
          <ExpenseModal
            visible={showExpenseModal}
            onClose={() => setShowExpenseModal(false)}
            onSubmit={handleExpenseSubmit}
            editingExpense={editingExpense}
          />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingExpense(null);
            }}
            onConfirm={handleConfirmDelete}
            expenseAmount={deletingExpense?.amount || 0}
            expenseDescription={deletingExpense?.description || ''}
            currencySymbol={userSettings?.currencySymbol || '$'}
          />
        </View>

        {/* FIXED: Sidebar rendered outside main content to prevent layout shifts */}
        <Sidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
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
  // FIXED: Main content container that maintains its position
  mainContent: {
    flex: 1,
    // FIXED: Ensure main content doesn't shift when sidebar opens
    position: 'relative',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    minHeight: 44,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  // FIXED: Divider styles with z-index
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  fixedStickyHeader: {
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    position: 'relative',
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  amountBackground: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  stickyAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  mainAmount: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  comparison: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  toggleButtonContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 6,
    minHeight: 40,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20, // FIXED: Higher elevation to stay above sticky header
  },
  toggleButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
  detailsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailsScrollView: {
    flex: 1,
  },
  expenseList: {
    paddingHorizontal: 20,
  },
  dateHeader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  dateHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHeaderDate: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  dateHeaderDay: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    minHeight: 80,
  },
  expenseInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width:'50%'
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  expenseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: 12,
  },
  expenseRightSection: {
    flexDirection:'row',
    width:'full',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    gap: 30,
  },
  expenseTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 0,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    minHeight: 36,
    minWidth: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  editButton: {
    // Background color set inline
  },
  deleteButton: {
    // Background color set inline
  },
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});