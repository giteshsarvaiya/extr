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
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, setHours, setMinutes, setSeconds, setMilliseconds, isAfter, isBefore } from 'date-fns';
import Sidebar from '@/components/Sidebar';
import HeaderBrand from '@/components/HeaderBrand';
import ExpenseModal from '@/components/ExpenseModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CurrencyFormatter } from '@/utils/formatCurrency';
import { Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

type ViewMode = 'daily' | 'weekly' | 'monthly';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Swipe gesture constants
const SWIPE_THRESHOLD = 50; // Minimum distance to trigger swipe
const SWIPE_VELOCITY_THRESHOLD = 300; // Minimum velocity to trigger swipe
const EDGE_SWIPE_AREA = 50; // Area from left edge where swipe to open is detected

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

  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Main amount display animation values
  const mainAmountTranslateY = useRef(new Animated.Value(0)).current;
  const mainAmountScale = useRef(new Animated.Value(1)).current;
  const mainAmountOpacity = useRef(new Animated.Value(1)).current;

  // FIXED: Sticky header animation values - start completely hidden and stay hidden
  const stickyHeaderOpacity = useRef(new Animated.Value(0)).current;
  const stickyHeaderScale = useRef(new Animated.Value(0.9)).current;
  const stickyHeaderTranslateY = useRef(new Animated.Value(-50)).current;

  // FIXED: Details content animation - now slides from bottom instead of covering entire screen
  const detailsTranslateY = useRef(new Animated.Value(screenHeight * 0.6)).current;
  const detailsOpacity = useRef(new Animated.Value(0)).current;

  // Toggle button animation
  const toggleButtonTranslateY = useRef(new Animated.Value(0)).current;
  const toggleButtonOpacity = useRef(new Animated.Value(1)).current;
  const toggleButtonScale = useRef(new Animated.Value(1)).current;

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

  // FIXED: Animate details when showDetails changes - keep navigation accessible
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
      }, 200);

      // Phase 3: Animate details content up from bottom (partial height)
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

      // Phase 4: Animate toggle button to fixed position
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(toggleButtonTranslateY, {
            toValue: -180,
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
      stickyHeaderOpacity.setValue(0);
      stickyHeaderScale.setValue(0.9);
      stickyHeaderTranslateY.setValue(-50);

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

      // Phase 2: Hide details content (slide down to partial height)
      Animated.parallel([
        Animated.timing(detailsTranslateY, {
          toValue: screenHeight * 0.6,
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
  }, [showDetails]);

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

  const currentTotal = getTotalForPeriod(getPeriodRange().start, getPeriodRange().end);
  const yesterdayTotal = getTotalForPeriod(
    startOfDay(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000)),
    endOfDay(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))
  );

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

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(expenseId) },
      ]
    );
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

  // NEW: Swipe gesture handlers
  const openSidebar = () => {
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  // NEW: Create swipe gesture
  const swipeGesture = Gesture.Pan()
    .onStart((event) => {
      // Only handle gestures that start from the left edge for opening
      // or anywhere when sidebar is open for closing
      if (!showSidebar && event.x > EDGE_SWIPE_AREA) {
        return;
      }
    })
    .onEnd((event) => {
      const { translationX, velocityX, x } = event;
      
      if (!showSidebar) {
        // Sidebar is closed - check for right swipe to open
        const shouldOpen = 
          (translationX > SWIPE_THRESHOLD && x < EDGE_SWIPE_AREA) || 
          (velocityX > SWIPE_VELOCITY_THRESHOLD && x < EDGE_SWIPE_AREA);
        
        if (shouldOpen) {
          runOnJS(openSidebar)();
        }
      } else {
        // Sidebar is open - check for left swipe to close
        const shouldClose = 
          translationX < -SWIPE_THRESHOLD || 
          velocityX < -SWIPE_VELOCITY_THRESHOLD;
        
        if (shouldClose) {
          runOnJS(closeSidebar)();
        }
      }
    })
    .runOnJS(true);

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
        <GestureDetector gesture={swipeGesture}>
          <View style={styles.mainContent}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
              <HeaderBrand
                isOpen={showSidebar}
                onPress={() => setShowSidebar(true)}
              />
            </View>

            {/* FIXED: Navigation section that stays accessible */}
            <View style={styles.navigationSection}>
              {/* Date Selector with Navigation */}
              <View style={styles.dateNavigationContainer}>
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

              {/* Divider between date header and tabs */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Tabs - Weekly, Daily, Monthly */}
              <View style={styles.tabsContainer}>
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
            </View>

            {/* FIXED: Sticky Header - completely hidden when not in use and no flash */}
            {showDetails && (
              <Animated.View 
                style={[
                  styles.fixedStickyHeader,
                  { 
                    backgroundColor: colors.background,
                    borderBottomColor: colors.border,
                    opacity: stickyHeaderOpacity,
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

            <View style={styles.content}>
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
                <Text style={[styles.comparison, { color: colors.textSecondary }]}>
                  vs. yesterday {formatCurrencyDetailed(yesterdayTotal)}
                </Text>
              </Animated.View>

              {/* Animated Toggle Button */}
              <Animated.View
                style={[
                  styles.toggleButtonContainer,
                  {
                    transform: [
                      { translateY: toggleButtonTranslateY },
                      { scale: toggleButtonScale }
                    ],
                    opacity: toggleButtonOpacity,
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

              {/* FIXED: Details Content - now positioned to not cover navigation */}
              <Animated.View
                style={[
                  styles.detailsContainer,
                  {
                    transform: [{ translateY: detailsTranslateY }],
                    opacity: detailsOpacity,
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
                    paddingTop: 20, // Reduced padding since navigation is now accessible
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
                                  onPress={() => handleDeleteExpense(expense.id)}
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

            {/* FIXED: Floating Add Button - Positioned higher from bottom */}
            {viewMode === 'daily' && (
              <TouchableOpacity
                style={[
                  styles.floatingAddButton, 
                  { 
                    backgroundColor: colors.primary, 
                    shadowColor: colors.shadowColor,
                    bottom: 50 + insets.bottom,
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
          </View>
        </GestureDetector>

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
    paddingVertical: 6,
    paddingBottom: 10,
  },
  // FIXED: Navigation section that stays accessible
  navigationSection: {
    backgroundColor: 'transparent',
    zIndex: 10, // Ensure it stays above details content
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
  // Divider styles
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
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
    elevation: 4,
  },
  stickyAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
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
    elevation: 6,
  },
  toggleButtonText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
  // FIXED: Details container positioned to not cover navigation
  detailsContainer: {
    position: 'absolute',
    top: 120, // Start below the navigation section
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
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
    flex: 1,
    justifyContent: 'center',
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
    paddingRight: 12,
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