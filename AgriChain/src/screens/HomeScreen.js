import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const ACTION_CARDS = [
  {
    emoji: '\u{1F4C5}',
    title: 'Harvest Advisor',
    subtitle: 'Best time to harvest',
    route: 'CropInput',
  },
  {
    emoji: '\u{1F4B0}',
    title: 'Best Mandi',
    subtitle: 'Where to sell',
  },
  {
    emoji: '\u{1F4E6}',
    title: 'Spoilage Risk',
    subtitle: 'Keep crops fresh',
  },
  {
    emoji: '\u{1F3DB}\u{FE0F}',
    title: 'Govt Schemes',
    subtitle: 'Get benefits',
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <Text style={styles.brand}>{'\u{1F33E} AgriChain'}</Text>
          <Text style={styles.languageToggle}>{'EN | \u0939\u093f\u0902'}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>{'Namaste \u{1F44B}'}</Text>
          <Text style={styles.greetingSubtitle}>
            What do you need help with today?
          </Text>
        </View>

        <View style={styles.grid}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => {
                if (card.route) {
                  navigation.navigate(card.route);
                }
              }}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardTextBlock}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: COLORS.card,
    fontSize: 27,
    fontWeight: '800',
  },
  languageToggle: {
    color: '#E5F4EC',
    fontSize: 15,
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 96,
  },
  greetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: '#4F5B62',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  actionCard: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardTextBlock: {
    rowGap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#5D6A72',
    lineHeight: 18,
  },
});
