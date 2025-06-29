import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { DollarSign, Plus, ChartBar as BarChart3 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const { colors, theme } = useTheme();
  
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);
  const iconsOpacity = useSharedValue(0);
  const iconsScale = useSharedValue(0.8);
  const backgroundOpacity = useSharedValue(0);
  const accentOpacity = useSharedValue(0);
  const accentScale = useSharedValue(0);

  useEffect(() => {
    // Start animation sequence
    const startAnimation = () => {
      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      
      // Logo animation
      logoScale.value = withSequence(
        withTiming(1.2, { duration: 600, easing: Easing.out(Easing.back(1.2)) }),
        withTiming(1, { duration: 200 })
      );
      logoOpacity.value = withTiming(1, { duration: 600 });
      
      // Title animation
      titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
      titleTranslateY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));
      
      // Tagline animation
      taglineOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
      taglineTranslateY.value = withDelay(700, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
      
      // Accent lines animation
      accentOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));
      accentScale.value = withDelay(900, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
      
      // Icons animation
      iconsOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
      iconsScale.value = withDelay(1100, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.1)) }));
      
      // Complete animation after total duration
      setTimeout(() => {
        onAnimationComplete();
      }, 2500);
    };

    startAnimation();
  }, []);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const iconsStyle = useAnimatedStyle(() => ({
    opacity: iconsOpacity.value,
    transform: [{ scale: iconsScale.value }],
  }));

  const accentStyle = useAnimatedStyle(() => ({
    opacity: accentOpacity.value,
    transform: [{ scaleX: accentScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, backgroundStyle]}>
      {/* Properly themed status bar */}
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
      
      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.circle1, { backgroundColor: colors.text + '03' }]} />
        <View style={[styles.patternCircle, styles.circle2, { backgroundColor: colors.text + '03' }]} />
        <View style={[styles.patternRect, styles.rect1, { backgroundColor: colors.text + '03' }]} />
        <View style={[styles.patternRect, styles.rect2, { backgroundColor: colors.text + '03' }]} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo circle */}
        <Animated.View style={[styles.logoContainer, { backgroundColor: colors.primary, shadowColor: colors.shadowColor }, logoStyle]}>
          <Text style={[styles.logoText, { color: colors.background }]}>ExTr</Text>
        </Animated.View>

        {/* App name */}
        <Animated.View style={titleStyle}>
          <Text style={[styles.appName, { color: colors.text }]}>Expense Tracker</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineStyle}>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Simple. Clean. Effective.
          </Text>
        </Animated.View>

        {/* Accent lines */}
        <View style={styles.accentContainer}>
          <Animated.View style={[styles.accentLineLeft, { backgroundColor: colors.text }, accentStyle]} />
          <Animated.View style={[styles.accentLineRight, { backgroundColor: colors.text }, accentStyle]} />
        </View>

        {/* Feature icons */}
        <Animated.View style={[styles.iconsContainer, iconsStyle]}>
          <View style={[styles.iconCircle, { borderColor: colors.text }]}>
            <DollarSign size={20} color={colors.text} />
          </View>
          <View style={[styles.iconCircle, { borderColor: colors.text }]}>
            <Plus size={20} color={colors.text} />
          </View>
          <View style={[styles.iconCircle, { borderColor: colors.text }]}>
            <BarChart3 size={20} color={colors.text} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <View style={styles.bottomBranding}>
        <Text style={[styles.brandingText, { color: colors.textSecondary + '80' }]}>
          Made with Bolt.new⚡ 
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 120,
    height: 120,
    top: height * 0.15,
    left: width * 0.1,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: height * 0.2,
    right: width * 0.15,
  },
  patternRect: {
    position: 'absolute',
    borderRadius: 8,
  },
  rect1: {
    width: 40,
    height: 40,
    top: height * 0.7,
    left: width * 0.08,
  },
  rect2: {
    width: 30,
    height: 30,
    top: height * 0.25,
    right: width * 0.12,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  accentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.6,
    marginVertical: 40,
  },
  accentLineLeft: {
    height: 2,
    width: 60,
    borderRadius: 1,
  },
  accentLineRight: {
    height: 2,
    width: 60,
    borderRadius: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBranding: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 60,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});