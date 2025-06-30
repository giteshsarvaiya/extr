import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { ChartBar as BarChart3, Crown, Settings, MessageCircle, X, ChevronRight } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
  Easing,
  withSpring
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.85, 320);
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 500;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  {
    icon: BarChart3,
    title: 'Analytics',
    route: '/analytics',
    description: 'View spending insights'
  },
  {
    icon: Crown,
    title: 'PRO (coming soon)',
    route: '/pro',
    description: 'Upgrade to premium'
  },
  {
    icon: Settings,
    title: 'Settings',
    route: '/settings',
    description: 'App preferences'
  },
  {
    icon: MessageCircle,
    title: 'Contact Us',
    route: '/contact',
    description: 'Get support'
  },
];

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);
  
  // IMPROVED: Smoother animations with better easing curves
  useEffect(() => {
    if (visible) {
      // Slide in from left with smooth spring animation
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(0.6, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // IMPROVED: Much smoother slide out with optimized timing
      translateX.value = withTiming(-SIDEBAR_WIDTH, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, {
        duration: 280,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  // IMPROVED: Enhanced gesture handler with smoother interactions
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      // Only allow swiping left (closing)
      if (newTranslateX <= 0) {
        translateX.value = Math.max(newTranslateX, -SIDEBAR_WIDTH);
        // Update backdrop opacity based on position with smoother interpolation
        const progress = Math.abs(newTranslateX) / SIDEBAR_WIDTH;
        const easedProgress = 1 - Math.pow(progress, 0.8); // Ease out curve
        backdropOpacity.value = Math.max(0, 0.6 * easedProgress);
      }
    },
    onEnd: (event) => {
      const shouldClose = 
        event.translationX < -SWIPE_THRESHOLD || 
        event.velocityX < -SWIPE_VELOCITY_THRESHOLD;
      
      if (shouldClose) {
        // IMPROVED: Smoother close animation with velocity-based timing
        const velocity = Math.abs(event.velocityX);
        const duration = Math.max(180, Math.min(300, 300 - (velocity / 10)));
        
        translateX.value = withTiming(-SIDEBAR_WIDTH, {
          duration,
          easing: Easing.in(Easing.cubic),
        });
        backdropOpacity.value = withTiming(0, {
          duration,
          easing: Easing.in(Easing.cubic),
        });
        runOnJS(onClose)();
      } else {
        // IMPROVED: Smoother snap back with spring animation
        translateX.value = withSpring(0, {
          damping: 18,
          stiffness: 250,
          mass: 0.7,
        });
        backdropOpacity.value = withTiming(0.6, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
      }
    },
  });

  // Animated styles
  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 100);
  };

  const handleBrandPress = () => {
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  // FIXED: Don't render the modal at all when not visible to prevent layout shifts
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      hardwareAccelerated={true}
      // CRITICAL FIX: Use overFullScreen to prevent layout interference
      presentationStyle="overFullScreen"
      statusBarTranslucent={false}
      // CRITICAL FIX: Prevent modal from affecting layout
      supportedOrientations={['portrait']}
    >
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
      
      {/* FIXED: Container that doesn't interfere with main content */}
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>
        
        {/* Sidebar with gesture handling */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View 
            style={[
              styles.sidebar, 
              { 
                backgroundColor: colors.surface,
              },
              sidebarStyle
            ]}
          >
            {/* FIXED: SafeAreaView inside sidebar for proper safe area handling */}
            <SafeAreaView style={styles.sidebarSafeArea}>
              <View style={styles.sidebarContent}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity 
                    style={styles.brandContainer}
                    onPress={handleBrandPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.logo, { color: colors.background }]}>ExTr</Text>
                    </View>
                    <View>
                      <Text style={[styles.brandName, { color: colors.text }]}>ExTr</Text>
                      <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                        Expense Tracker
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.closeButton}
                    activeOpacity={0.7}
                  >
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                  {MENU_ITEMS.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, { borderBottomColor: colors.border }]}
                        onPress={() => handleNavigation(item.route)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.menuItemLeft}>
                          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <IconComponent size={20} color={colors.primary} />
                          </View>
                          <View style={styles.menuItemText}>
                            <Text style={[styles.menuItemTitle, { color: colors.text }]}>
                              {item.title}
                            </Text>
                            <Text style={[styles.menuItemDescription, { color: colors.textSecondary }]}>
                              {item.description}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    Version 1.0.0
                  </Text>
                  <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
                    Made with ❤️ using Bolt.new⚡
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // CRITICAL FIX: Modal container that doesn't affect layout
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    // FIXED: Ensure modal doesn't interfere with main content
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  // FIXED: SafeAreaView wrapper for proper safe area handling
  sidebarSafeArea: {
    flex: 1,
  },
  sidebarContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logo: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 72,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
});