import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { TriangleAlert as AlertTriangle, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ResetConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetConfirmationModal({
  visible,
  onClose,
  onConfirm,
}: ResetConfirmationModalProps) {
  const { colors, theme } = useTheme();
  const [confirmationText, setConfirmationText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(30);

  // FIXED: Smooth modal opening/closing animations
  React.useEffect(() => {
    if (visible) {
      setConfirmationText('');
      setIsProcessing(false);
      setIsAnimating(true);
      
      // FIXED: Smooth opening animations with timing
      backdropOpacity.value = withTiming(1, { 
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
      
      modalOpacity.value = withTiming(1, { 
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
      
      modalScale.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });

      modalTranslateY.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });

      // Animation complete
      setTimeout(() => {
        setIsAnimating(false);
      }, 280);
    } else {
      setIsAnimating(true);
      
      // FIXED: Smooth closing animations
      backdropOpacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });
      
      modalOpacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });
      
      modalScale.value = withTiming(0.9, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });

      modalTranslateY.value = withTiming(30, { 
        duration: 200,
        easing: Easing.in(Easing.quad)
      });

      // Animation complete
      setTimeout(() => {
        setIsAnimating(false);
      }, 200);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (confirmationText.toLowerCase() !== 'reset everything') {
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleBackdropPress = () => {
    if (!isProcessing && !isAnimating) {
      onClose();
    }
  };

  const isConfirmationValid = confirmationText.toLowerCase() === 'reset everything';

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value }
    ],
  }));

  // CRITICAL FIX: Don't render the modal at all when not visible to prevent layout shifts
  if (!visible && !isAnimating) {
    return null;
  }

  return (
    <Modal
      visible={visible || isAnimating}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
      // CRITICAL FIX: Use overFullScreen to prevent layout interference
      presentationStyle="overFullScreen"
      // CRITICAL FIX: Prevent modal from affecting layout
      supportedOrientations={['portrait']}
    >
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
      
      {/* CRITICAL FIX: Container that doesn't interfere with main content */}
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdropTouchable} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Animated.View 
              style={[
                styles.modal,
                { 
                  backgroundColor: colors.surface,
                  shadowColor: colors.shadowColor,
                },
                modalStyle
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                  <View style={[styles.warningIcon, { backgroundColor: '#ef4444' + '15' }]}>
                    <AlertTriangle size={24} color="#ef4444" />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Reset App Data
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeButton}
                  disabled={isProcessing}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.warningText, { color: '#ef4444' }]}>
                  ⚠️ This action cannot be undone
                </Text>
                
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  This will permanently delete:
                </Text>
                
                <View style={styles.itemsList}>
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • All your expense records
                  </Text>
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • All app settings and preferences
                  </Text>
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • Currency and timezone settings
                  </Text>
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • Theme preferences (reset to default)
                  </Text>
                </View>

                <Text style={[styles.confirmationLabel, { color: colors.text }]}>
                  To confirm, type <Text style={[styles.confirmationPhrase, { color: '#ef4444' }]}>reset everything</Text> below:
                </Text>

                <TextInput
                  style={[
                    styles.confirmationInput,
                    {
                      borderColor: isConfirmationValid ? '#ef4444' : colors.border,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    }
                  ]}
                  placeholder="Type 'reset everything' to confirm"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmationText}
                  onChangeText={setConfirmationText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isProcessing}
                  autoFocus
                />
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: colors.border }
                  ]}
                  onPress={onClose}
                  disabled={isProcessing}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.resetButton,
                    { 
                      backgroundColor: isConfirmationValid ? '#ef4444' : colors.border,
                      opacity: isConfirmationValid ? 1 : 0.5,
                    }
                  ]}
                  onPress={handleConfirm}
                  disabled={!isConfirmationValid || isProcessing}
                >
                  <Text style={[styles.resetButtonText, { color: '#ffffff' }]}>
                    {isProcessing ? 'Resetting...' : 'Reset Everything'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
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
    // CRITICAL FIX: Ensure modal doesn't interfere with main content
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    // FIXED: Position modal higher from center
    marginTop: -20, // Moved higher from center
  },
  modal: {
    width: Math.min(width - 40, 450),
    maxWidth: '100%',
    borderRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  warningText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  itemsList: {
    gap: 8,
    paddingLeft: 8,
  },
  listItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  confirmationLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
    marginTop: 8,
  },
  confirmationPhrase: {
    fontFamily: 'Inter-Bold',
  },
  confirmationInput: {
    height: 52,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  resetButton: {
    // Background color set inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});