import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu } from 'lucide-react-native';

interface HeaderBrandProps {
  isOpen: boolean;
  onPress: () => void;
}

export default function HeaderBrand({ isOpen, onPress }: HeaderBrandProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Menu size={24} color={colors.text} />
      <Text style={[styles.brandName, { color: colors.text }]}>ExTr</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: 44,
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
});