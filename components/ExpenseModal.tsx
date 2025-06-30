import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, Check, X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => Promise<void>;
  editingExpense?: {
    id: string;
    amount: number;
    description: string;
  } | null;
}

export default function ExpenseModal({
  visible,
  onClose,
  onSubmit,
  editingExpense,
}: ExpenseModalProps) {
  const { colors, theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(30);

  // FIXED: Smoother modal opening/closing animations
  useEffect(() => {
    if (visible) {
      // Reset form data
      if (editingExpense) {
        setAmount(editingExpense.amount.toString());
        setDescription(editingExpense.description);
      } else {
        setAmount('');
        setDescription('');
      }
      
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
      
      // Enable auto focus after animation
      setTimeout(() => {
        setShouldAutoFocus(true);
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
      
      // Reset states
      setTimeout(() => {
        setShouldAutoFocus(false);
        setIsSubmitting(false);
        setIsAnimating(false);
      }, 200);
    }
  }, [visible, editingExpense]);

  // Handle auto focus separately
  useEffect(() => {
    if (shouldAutoFocus && visible && !isAnimating) {
      amountInputRef.current?.focus();
    }
  }, [shouldAutoFocus, visible, isAnimating]);

  const handleSubmit = async () => {
    if (!amount.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in both amount and description');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(numericAmount, description.trim());
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountSubmit = () => {
    descriptionInputRef.current?.focus();
  };

  const handleDescriptionSubmit = () => {
    if (amount.trim()) {
      handleSubmit();
    } else {
      amountInputRef.current?.focus();
    }
  };

  const handleBackdropPress = () => {
    if (!isSubmitting && !isAnimating) {
      onClose();
    }
  };

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
                <Text style={[styles.title, { color: colors.text }]}>
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </Text>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeButton}
                  disabled={isSubmitting}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Amount Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Amount
                  </Text>
                  <TextInput
                    ref={amountInputRef}
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                      }
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={handleAmountSubmit}
                    blurOnSubmit={false}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Description
                  </Text>
                  <TextInput
                    ref={descriptionInputRef}
                    style={[
                      styles.input,
                      styles.descriptionInput,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                      }
                    ]}
                    placeholder="What did you spend on?"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    returnKeyType="done"
                    onSubmitEditing={handleDescriptionSubmit}
                    multiline
                    textAlignVertical="top"
                    editable={!isSubmitting}
                  />
                </View>
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
                  disabled={isSubmitting}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    { backgroundColor: colors.primary }
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {editingExpense ? (
                    <Check size={20} color={colors.background} />
                  ) : (
                    <Plus size={20} color={colors.background} />
                  )}
                  <Text style={[styles.submitButtonText, { color: colors.background }]}>
                    {isSubmitting ? 'Saving...' : editingExpense ? 'Update' : 'Add'}
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
    marginTop: -20, // This moves the modal up by 20px from center
  },
  modal: {
    width: Math.min(width - 40, 400),
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
  form: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  descriptionInput: {
    height: 80,
    paddingTop: 16,
    paddingBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  submitButton: {
    // Background color set inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});