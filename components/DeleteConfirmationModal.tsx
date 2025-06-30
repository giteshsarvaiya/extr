import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { Trash2, X, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expenseAmount: number;
  expenseDescription: string;
  currencySymbol?: string;
}

export default function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  expenseAmount,
  expenseDescription,
  currencySymbol = '$',
}: DeleteConfirmationModalProps) {
  const { colors, theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when modal opens
  useEffect(() => {
    if (visible) {
      setIsProcessing(false);
    }
  }, [visible]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleBackdropPress = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  // Format currency amount
  const formatAmount = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
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
                <View style={styles.headerLeft}>
                  <View style={[styles.warningIcon, { backgroundColor: '#ef4444' + '15' }]}>
                    <AlertTriangle size={24} color="#ef4444" />
                  </View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Delete Expense
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
                {/* Expense Details Card */}
                <View style={[styles.expenseCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View style={styles.expenseHeader}>
                    <Text style={[styles.expenseAmount, { color: colors.text }]}>
                      {formatAmount(expenseAmount)}
                    </Text>
                    <View style={[styles.trashIcon, { backgroundColor: '#ef4444' + '10' }]}>
                      <Trash2 size={20} color="#ef4444" />
                    </View>
                  </View>
                  <Text style={[styles.expenseDescription, { color: colors.textSecondary }]}>
                    {expenseDescription}
                  </Text>
                </View>

                {/* Warning Message */}
                <View style={styles.warningContainer}>
                  <Text style={[styles.warningText, { color: '#ef4444' }]}>
                    ⚠️ This action cannot be undone
                  </Text>
                  <Text style={[styles.warningSubtext, { color: colors.textSecondary }]}>
                    This expense will be permanently removed from your records.
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { borderColor: colors.primary }
                  ]}
                  onPress={onClose}
                  disabled={isProcessing}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.deleteButton,
                    { backgroundColor: '#ef4444' }
                  ]}
                  onPress={handleConfirm}
                  disabled={isProcessing}
                >
                  <Trash2 size={20} color="#ffffff" />
                  <Text style={[styles.deleteButtonText, { color: '#ffffff' }]}>
                    {isProcessing ? 'Deleting...' : 'Delete'}
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
    gap: 20,
  },
  expenseCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseAmount: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  trashIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  warningContainer: {
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  warningSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
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
  deleteButton: {
    // Background color set inline
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});