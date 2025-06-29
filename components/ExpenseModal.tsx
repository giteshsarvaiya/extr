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
  withSpring,
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
  
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Animation values with stable initial states
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(30);

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (visible) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString());
        setDescription(editingExpense.description);
      } else {
        setAmount('');
        setDescription('');
      }
      
      // FIXED: More stable animation sequence with consistent timing
      backdropOpacity.value = withTiming(1, { 
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
      
      // Delay modal animation slightly to prevent jumping
      setTimeout(() => {
        modalOpacity.value = withTiming(1, { 
          duration: 300,
          easing: Easing.out(Easing.quad)
        });
        modalScale.value = withSpring(1, { 
          damping: 25, 
          stiffness: 400,
          mass: 0.8
        });
        modalTranslateY.value = withSpring(0, { 
          damping: 25, 
          stiffness: 400,
          mass: 0.8
        });
      }, 50);
      
      // Auto-focus amount field after stable animation
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 400);
    } else {
      // FIXED: Immediate reset to prevent visual glitches
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
      backdropOpacity.value = withTiming(0, { 
        duration: 250,
        easing: Easing.in(Easing.quad)
      });
    }
  }, [visible, editingExpense]);

  // Clear form when modal closes
  useEffect(() => {
    if (!visible) {
      setAmount('');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [visible]);

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
    if (!isSubmitting) {
      onClose();
    }
  };

  // FIXED: More stable animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }), []);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: modalScale.value },
      { translateY: modalTranslateY.value },
    ],
    opacity: modalOpacity.value,
  }), []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor="rgba(0,0,0,0.5)"
      />
      
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Modal Content */}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modal: {
    width: Math.min(width - 40, 400),
    maxWidth: '100%',
    borderRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
    // FIXED: More stable positioning - slightly above center
    marginTop: -height * 0.08,
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