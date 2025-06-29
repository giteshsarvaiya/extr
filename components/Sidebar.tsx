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
  Easing
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
  
  // X-style slide animations
  useEffect(() => {
    if (visible) {
      // Slide in from left
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0.6, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Slide out to left
      translateX.value = withTiming(-SIDEBAR_WIDTH, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  // Gesture handler for swipe to close
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      // Only allow swiping left (closing)
      if (newTranslateX <= 0) {
        translateX.value = Math.max(newTranslateX, -SIDEBAR_WIDTH);
        // Update backdrop opacity based on position
        const progress = Math.abs(newTranslateX) / SIDEBAR_WIDTH;
        backdropOpacity.value = Math.max(0, 0.6 * (1 - progress));
      }
    },
    onEnd: (event) => {
      const shouldClose = 
        event.translationX < -SWIPE_THRESHOLD || 
        event.velocityX < -SWIPE_VELOCITY_THRESHOLD;
      
      if (shouldClose) {
        // Close the sidebar
        translateX.value = withTiming(-SIDEBAR_WIDTH, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
        });
        backdropOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
        });
        runOnJS(onClose)();
      } else {
        // Snap back to open position
        translateX.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        });
        backdropOpacity.value = withTiming(0.6, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <StatusBar 
        style={theme === 'dark' ? 'dark' : 'light'} 
        backgroundColor={colors.statusBarBackground}
      />
      
      <View style={styles.overlay}>
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
            {/* FIXED: Use SafeAreaView to properly handle safe areas */}
            <SafeAreaView style={styles.safeAreaContainer}>
              <View style={styles.sidebarContent}>
                {/* Header - Starts from top of safe area */}
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

                {/* Menu Items - Takes up available space between header and footer */}
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

                {/* Footer - Stays at bottom of safe area */}
                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    Version 1.0.0
                  </Text>
                  <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
                    Made with Bolt.new⚡
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
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropTouchable: {
    flex: 1,
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
  safeAreaContainer: {
    flex: 1,
  },
  sidebarContent: {
    flex: 1,
    justifyContent: 'space-between', // Header at top, footer at bottom
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
    flex: 1, // Takes up all available space between header and footer
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