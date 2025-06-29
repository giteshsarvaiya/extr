import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { useSettings } from '@/contexts/SettingsContext';
import { TrendingUp, TrendingDown, DollarSign, ArrowLeft, ChartBar as BarChart3 } from 'lucide-react-native';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurrencyFormatter } from '@/utils/formatCurrency';

export default function AnalyticsScreen() {
  const { colors, theme } = useTheme();
  const { getTotalForPeriod, expenses } = useExpense();
  const { userSettings } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const now = new Date();
  const thisWeekTotal = getTotalForPeriod(startOfWeek(now), endOfWeek(now));
  const thisMonthTotal = getTotalForPeriod(startOfMonth(now), endOfMonth(now));
  
  const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekTotal = getTotalForPeriod(startOfWeek(lastWeekStart), endOfWeek(lastWeekStart));
  
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthTotal = getTotalForPeriod(lastMonthStart, lastMonthEnd);

  const weeklyChange = thisWeekTotal - lastWeekTotal;
  const monthlyChange = thisMonthTotal - lastMonthTotal;

  // IMPROVED: Enhanced currency formatting with English suffixes
  const formatCurrency = (amount: number): string => {
    const symbol = userSettings?.currencySymbol || '$';
    return CurrencyFormatter.analytics(amount, symbol);
  };

  // IMPROVED: Detailed formatting for comparisons
  const formatCurrencyDetailed = (amount: number): string => {
    const symbol = userSettings?.currencySymbol || '$';
    return CurrencyFormatter.detailed(amount, symbol);
  };

  const renderStatCard = (title: string, amount: number, change: number, period: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={styles.statHeader}>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[{fontSize:24}]}>{userSettings?.currencySymbol || '$'}</Text>
      </View>
      <Text style={[styles.statAmount, { color: colors.text }]}>
        {formatCurrency(amount)}
      </Text>
      <View style={styles.statChange}>
        {change > 0 ? (
          <TrendingUp size={16} color="#ef4444" />
        ) : change < 0 ? (
          <TrendingDown size={16} color="#22c55e" />
        ) : null}
        <Text style={[
          styles.changeText,
          { color: change > 0 ? '#ef4444' : change < 0 ? '#22c55e' : colors.textSecondary }
        ]}>
          {change > 0 ? '+' : ''}{formatCurrencyDetailed(Math.abs(change))} vs {period}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Properly themed status bar */}
      <StatusBar 
        style={theme === 'dark' ? 'dark' : 'light'} 
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
            <BarChart3 size={28} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            {renderStatCard('This Week', thisWeekTotal, weeklyChange, 'last week')}
            {renderStatCard('This Month', thisMonthTotal, monthlyChange, 'last month')}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Quick Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Expenses
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {expenses.length}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Average per Day
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(thisWeekTotal / 7)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Largest Expense
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {expenses.length > 0 
                  ? formatCurrency(Math.max(...expenses.map(e => e.amount)))
                  : formatCurrency(0)
                }
              </Text>
            </View>
          </View>

          <View style={[styles.insightCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>💡 Insights</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {thisWeekTotal > lastWeekTotal 
                ? `You've spent ${formatCurrencyDetailed(weeklyChange)} more this week. Consider reviewing your expenses.`
                : thisWeekTotal < lastWeekTotal
                ? `Great job! You've saved ${formatCurrencyDetailed(Math.abs(weeklyChange))} compared to last week.`
                : "Your spending is consistent with last week."
              }
            </Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  insightCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});