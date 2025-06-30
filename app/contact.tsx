import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  ArrowLeft,
  Mail,
  MessageCircle,
  Send,
  ExternalLink,
  Phone,
  MapPin
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactScreen() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleOpenXGitesh = () => {
    Linking.openURL('https://x.com/SarvaiyaGitesh');
  };

  const handleOpenEmailGitesh = () => {
    Linking.openURL('mailto:gitesh.sarvaiya28@gmail.com');
  };
  
  const handleOpenXRajeev = () => {
    Linking.openURL('https://x.com/rajeevdew');
  };

  const handleOpenEmailRajeev = () => {
    Linking.openURL('mailto:rajeevdewangan10@gmail.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* FIXED: Apply theme colors to status bar background */}
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.background}
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
            <MessageCircle size={28} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.introCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.introTitle, { color: colors.text }]}>Get in Touch</Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              We'd love to hear from you! Whether you have questions, feedback, or need support, 
              we're here to help.
            </Text>
          </View>

          <View style={styles.contactMethods}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Methods</Text>
            
            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={handleOpenEmailGitesh}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                <Mail size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  gitesh.sarvaiya28@gmail.com
                </Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={handleOpenXGitesh}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#1DA1F2' + '20' }]}>
                <MessageCircle size={24} color="#1DA1F2" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Twitter/X</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  @SarvaiyaGitesh
                </Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={handleOpenEmailRajeev}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.primary + '20' }]}>
                <Mail size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  rajeevdewangan10@gmail.com
                </Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: colors.surface }]}
              onPress={handleOpenXRajeev}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#1DA1F2' + '20' }]}>
                <MessageCircle size={24} color="#1DA1F2" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>Twitter/X</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  @rajeevdew
                </Text>
              </View>
              <ExternalLink size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.supportCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.supportTitle, { color: colors.text }]}>💡 Quick Support</Text>
            <Text style={[styles.supportText, { color: colors.textSecondary }]}>
              For faster support, please include:
            </Text>
            <View style={styles.supportList}>
              <Text style={[styles.supportItem, { color: colors.textSecondary }]}>
                • Your device model and OS version
              </Text>
              <Text style={[styles.supportItem, { color: colors.textSecondary }]}>
                • App version (found in Settings)
              </Text>
              <Text style={[styles.supportItem, { color: colors.textSecondary }]}>
                • Steps to reproduce any issues
              </Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
  },
  introCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  contactMethods: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  formSection: {
    marginBottom: 32,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  messageInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  supportCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  supportTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  supportList: {
    paddingLeft: 8,
  },
  supportItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
});