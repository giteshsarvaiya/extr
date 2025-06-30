import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, Check, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
  const DESCRIPTION_MAX_LENGTH = 15;
  
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Reset form data when modal opens
  useEffect(() => {
    if (visible) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString());
        setDescription(editingExpense.description);
      } else {
        setAmount('');
        setDescription('');
      }
      setIsSubmitting(false);
      
      // Auto focus after a short delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [visible, editingExpense]);

  const handleSubmit = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please fill in the amount');
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
    handleSubmit();
  };

  const handleBackdropPress = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.statusBarBackground}
        translucent={false}
      />
      
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        {/* FIXED: Removed KeyboardAvoidingView to prevent layout flash */}
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View 
              style={[
                styles.modal,
                { 
                  backgroundColor: colors.surface,
                  shadowColor: colors.shadowColor,
                }
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
                        borderColor:
                          description.length > DESCRIPTION_MAX_LENGTH ? 'red' : colors.border,
                        backgroundColor: 'transparent',
                        color: colors.text,
                        position: 'relative',
                        zIndex: 1,
                      }
                    ]}
                    placeholder="What did you spend on? (optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    returnKeyType="done"
                    onSubmitEditing={handleDescriptionSubmit}
                    multiline
                    blurOnSubmit={true}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                  />
                  <Text
                    style={[
                      styles.charCount,
                      { color: description.length > DESCRIPTION_MAX_LENGTH ? 'red' : colors.textSecondary }
                    ]}
                  >
                    {DESCRIPTION_MAX_LENGTH - description.length}
                  </Text>
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
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  charCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
});