/**
 * Language Switcher Component
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Compact pill-style language toggle that can be placed in any header/toolbar.
 * Shows the three language options with the active one highlighted.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageSwitcher({ style, compact = false }) {
  const { language, setLanguage } = useLanguage();

  const labels = compact
    ? { en: 'EN', hi: 'हिं', mr: 'मर' }
    : { en: 'EN', hi: 'हिंदी', mr: 'मराठी' };

  return (
    <View style={[styles.container, style]}>
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={[styles.pill, isActive && styles.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {labels[lang.code]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  pillTextActive: {
    color: '#FFF',
  },
});
