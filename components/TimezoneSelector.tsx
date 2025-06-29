import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SectionList,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, X, RotateCcw, Check, Globe, Clock } from 'lucide-react-native';
import moment from 'moment-timezone';

interface TimezoneOption {
  label: string;
  value: string;
  continent: string;
  offset: string;
  currentTime: string;
  popular: boolean;
}

interface TimezoneSelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedValue: string;
  onSelect: (value: string) => void;
}

interface SectionData {
  title: string;
  data: TimezoneOption[];
}

// Popular timezones list
const POPULAR_TIMEZONES = [
  'America/New_York',
  'Europe/London', 
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/Paris',
  'Australia/Sydney',
  'Asia/Dubai',
  'Asia/Singapore'
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TimezoneSelector({ 
  visible, 
  onClose, 
  selectedValue, 
  onSelect 
}: TimezoneSelectorProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Generate all timezones using moment-timezone
  const generateTimezones = useCallback((): TimezoneOption[] => {
    const allTimezones = moment.tz.names();
    const now = moment();
    
    return allTimezones.map(tz => {
      // Parse timezone parts
      const parts = tz.split('/');
      const continent = parts[0] || 'Other';
      const city = parts[parts.length - 1] || tz;
      
      // Create human-friendly label
      const label = city.replace(/_/g, ' ');
      
      // Get current time and offset
      const momentInTz = now.clone().tz(tz);
      const currentTime = momentInTz.format('h:mm A');
      const offset = momentInTz.format('Z');
      const offsetFormatted = `UTC${offset}`;
      
      return {
        label,
        value: tz,
        continent,
        offset: offsetFormatted,
        currentTime,
        popular: POPULAR_TIMEZONES.includes(tz)
      };
    });
  }, []);

  // Initialize timezones when component mounts
  useEffect(() => {
    if (visible && timezones.length === 0) {
      setIsLoading(true);
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        const generatedTimezones = generateTimezones();
        setTimezones(generatedTimezones);
        setIsLoading(false);
      }, 100);
    }
  }, [visible, timezones.length, generateTimezones]);

  // Update current times every minute
  useEffect(() => {
    if (!visible || timezones.length === 0) return;

    const updateTimes = () => {
      setTimezones(prevTimezones => 
        prevTimezones.map(tz => {
          const momentInTz = moment().tz(tz.value);
          return {
            ...tz,
            currentTime: momentInTz.format('h:mm A')
          };
        })
      );
    };

    const interval = setInterval(updateTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [visible, timezones.length]);

  // Filter and group timezones
  const sectionData = useMemo((): SectionData[] => {
    if (timezones.length === 0) return [];

    let filteredTimezones = timezones;
    
    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filteredTimezones = timezones.filter(tz => 
        tz.label.toLowerCase().includes(query) ||
        tz.continent.toLowerCase().includes(query) ||
        tz.offset.toLowerCase().includes(query) ||
        tz.value.toLowerCase().includes(query)
      );
    }

    // Group by popular and continent
    const popular = filteredTimezones.filter(tz => tz.popular);
    const byContinent: { [key: string]: TimezoneOption[] } = {};
    
    filteredTimezones.filter(tz => !tz.popular).forEach(tz => {
      if (!byContinent[tz.continent]) {
        byContinent[tz.continent] = [];
      }
      byContinent[tz.continent].push(tz);
    });

    // Sort continents alphabetically
    const sortedContinents = Object.keys(byContinent).sort();

    // Build sections
    const sections: SectionData[] = [];
    
    if (popular.length > 0) {
      sections.push({
        title: 'MOST USED',
        data: popular
      });
    }

    sortedContinents.forEach(continent => {
      if (byContinent[continent].length > 0) {
        sections.push({
          title: continent.toUpperCase(),
          data: byContinent[continent].sort((a, b) => a.label.localeCompare(b.label))
        });
      }
    });

    return sections;
  }, [timezones, debouncedSearchQuery]);

  const handleSelect = useCallback((value: string) => {
    onSelect(value);
    onClose();
  }, [onSelect, onClose]);

  const handleReset = useCallback(() => {
    onSelect('America/New_York');
    onClose();
  }, [onSelect, onClose]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderTimezoneItem = useCallback(({ item }: { item: TimezoneOption }) => (
    <TouchableOpacity
      style={[
        styles.timezoneItem,
        { borderBottomColor: colors.border },
        selectedValue === item.value && { backgroundColor: colors.primary + '10' }
      ]}
      onPress={() => handleSelect(item.value)}
      activeOpacity={0.7}
    >
      <View style={styles.timezoneContent}>
        <View style={styles.timezoneMain}>
          <View style={styles.timezoneInfo}>
            <Text style={[styles.timezoneLabel, { color: colors.text }]}>
              {item.label}
            </Text>
            <Text style={[styles.timezoneOffset, { color: colors.textSecondary }]}>
              {item.offset}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={16} color={colors.primary} />
            <Text style={[styles.currentTime, { color: colors.primary }]}>
              {item.currentTime}
            </Text>
          </View>
        </View>
      </View>
      {selectedValue === item.value && (
        <Check size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  ), [colors, selectedValue, handleSelect]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Text style={[styles.groupHeader, { color: colors.textSecondary }]}>
        {section.title}
      </Text>
    </View>
  ), [colors]);

  const keyExtractor = useCallback((item: TimezoneOption) => item.value, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 72, // Height of each item
    offset: 72 * index,
    index,
  }), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Globe size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Select Timezone</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={handleReset} 
                style={styles.resetButton}
                activeOpacity={0.7}
              >
                <RotateCcw size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search timezone or city"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={clearSearch} 
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading timezones...
              </Text>
            </View>
          )}

          {/* Timezone List */}
          {!isLoading && (
            <SectionList
              sections={sectionData}
              renderItem={renderTimezoneItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              stickySectionHeadersEnabled={true}
              style={styles.listContainer}
              contentContainerStyle={styles.listContent}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews={true}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    minHeight: 24,
  },
  clearButton: {
    padding: 4,
    borderRadius: 4,
    minWidth: 24,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  groupHeader: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1.2,
  },
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: 72,
  },
  timezoneContent: {
    flex: 1,
  },
  timezoneMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timezoneInfo: {
    flex: 1,
  },
  timezoneLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  timezoneOffset: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});