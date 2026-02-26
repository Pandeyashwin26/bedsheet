import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

export default function MarketScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market</Text>
      <Text style={styles.subtitle}>Mandi prices and trends will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: '#4F5B62',
    fontSize: 16,
    textAlign: 'center',
  },
});
