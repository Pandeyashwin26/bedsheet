import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/colors';

const PRESERVATION_STEPS = [
  'Mix calcium chloride at 1% solution (10 g in 1 liter clean water).',
  'Dip or spray produce lightly, then allow surface drying in shade.',
  'Move produce to ventilated warehouse crates and avoid direct floor contact.',
  'Keep handling to minimum and dispatch in the next market cycle.',
];

export default function AriaScreen({ route }) {
  const topic = route?.params?.topic;
  const isPreservationGuide = topic === 'calcium-chloride-storage';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARIA</Text>
      {isPreservationGuide ? (
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>
            Calcium chloride + warehouse storage guide
          </Text>
          {PRESERVATION_STEPS.map((step) => (
            <Text key={step} style={styles.stepText}>
              {`\u2022 ${step}`}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.subtitle}>Voice assistant tools will appear here.</Text>
      )}
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
  guideCard: {
    marginTop: 8,
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEE3E9',
    padding: 14,
    rowGap: 8,
  },
  guideTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepText: {
    color: '#36444E',
    fontSize: 14,
    lineHeight: 20,
  },
});
