import React from 'react';
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
import { 
  ArrowLeft,
  Crown,
  Cloud,
  Palette,
  Mail,
  MessageSquare,
  Check,
  Star,
  List
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRO_FEATURES = [
  {
    icon: <Cloud size={24} />,
    title: 'Google Account Integration',
    description: 'Sync your data across all devices with Google Account Integration'
  },
  {
    icon: <Cloud size={24} />,
    title: 'Cloud Data Synchronization',
    description: 'Never lose your data with automatic cloud backup and sync'
  },  
  {
    icon: <List size={24} />,
    title: 'Create and Manage Lists',
    description: 'Create and manage lists of different expenses'
  },
  {
    icon: <Palette size={24} />,
    title: 'Customizable UI Themes',
    description: 'Choose from premium themes and customize your app appearance'
  },
  {
    icon: <MessageSquare size={24} />,
    title: 'Personal Feature Requests',
    description: 'Request custom features and get priority development support'
  },
  {
    icon: <Mail size={24} />,
    title: 'Monthly/Weekly Email Reports',
    description: 'Get detailed spending reports delivered to your inbox'
  }
];

export default function ProScreen() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubscribe = () => {
    Alert.alert(
      'Subscribe to PRO',
      'This will redirect you to the subscription page. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // In a real app, this would integrate with RevenueCat
            Alert.alert('Coming Soon', 'PRO features will be available in the next update!');
          }
        },
      ]
    );
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
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Crown size={28} color="#FFD700" />
            <Text style={[styles.title, { color: colors.text }]}>PRO (comming soon)</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 100, 100) }
          ]}
        >
          <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
            <View style={styles.heroHeader}>
              <Crown size={40} color="#FFD700" />
              <Text style={[styles.heroTitle, { color: colors.text }]}>Upgrade to PRO</Text>
            </View>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Unlock premium features and take your expense tracking to the next level
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.primary }]}>$5</Text>
              <Text style={[styles.priceSubtext, { color: colors.textSecondary }]}>/month</Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>What's Included</Text>
            
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                    {React.cloneElement(feature.icon, { color: colors.primary })}
                  </View>
                  <Check size={20} color="#22c55e" />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.testimonialCard, { backgroundColor: colors.surface }]}>
            <View style={styles.testimonialHeader}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                ))}
              </View>
              <Text style={[styles.testimonialText, { color: colors.textSecondary }]}>
                "I am eagerly waiting for the ExTr Pro to be launched."
              </Text>
              <Text style={[styles.testimonialAuthor, { color: colors.text }]}>
                - Nilima S., pre-subscribed PRO user
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
            onPress={handleSubscribe}
          >
            <Crown size={20} color={colors.background} />
            <Text style={[styles.subscribeButtonText, { color: colors.background }]}>
              Subscribe to PRO
            </Text>
          </TouchableOpacity>

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            Cancel anytime. No hidden fees. 7-day free trial included.
          </Text>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
  },
  priceSubtext: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  testimonialCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  testimonialHeader: {
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});