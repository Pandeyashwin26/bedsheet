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
import WeatherBanner from '../components/WeatherBanner';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();

  const ACTION_CARDS = [
    { emoji: '\u{1F4C5}', titleKey: 'home.harvestAdvisor', subtitleKey: 'home.harvestAdvisorSub', route: 'CropInput' },
    { emoji: '\u{1F4B0}', titleKey: 'home.bestMandi', subtitleKey: 'home.bestMandiSub', tab: 'Market' },
    { emoji: '\u{1F4E6}', titleKey: 'home.spoilageRisk', subtitleKey: 'home.spoilageRiskSub', route: 'Spoilage' },
    { emoji: '\u{1F52C}', titleKey: 'home.diseaseScanner', subtitleKey: 'home.diseaseScannerSub', tab: 'Disease' },
    { emoji: '\u{1F3DB}\u{FE0F}', titleKey: 'home.govtSchemes', subtitleKey: 'home.govtSchemesSub', route: 'Schemes' },
    { emoji: '\u{1F514}', titleKey: 'home.smartAlerts', subtitleKey: 'home.smartAlertsSub', route: 'Alerts' },
  ];
  const openAriaAssistant = () => {
    navigation.navigate('ARIA', {
      context: {
        crop: 'Onion',
        district: 'Nashik',
        risk_category: 'Medium',
        last_recommendation: 'Review latest market recommendation',
      },
    });
  };

  const handleCardPress = (card) => {
    if (card.route) {
      navigation.navigate(card.route);
    } else if (card.tab) {
      navigation.navigate('MainTabs', { screen: card.tab });
    }
  };

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
          <Text style={styles.brand}>{t('common.appName')}</Text>
          <LanguageSwitcher compact />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Weather Banner */}
        <WeatherBanner
          district="Nashik"
          cropContext={{ priceSpike: true, district: 'Nashik', spikePercent: 12 }}
          onPress={() => navigation.navigate('Alerts')}
        />

        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>{t('home.greeting')}</Text>
          <Text style={styles.greetingSubtitle}>
            {t('home.subtitle')}
          </Text>
        </View>

        <View style={styles.grid}>
          {ACTION_CARDS.map((card) => (
            <TouchableOpacity
              key={card.titleKey}
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => handleCardPress(card)}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <View style={styles.cardTextBlock}>
                <Text style={styles.cardTitle}>{t(card.titleKey)}</Text>
                <Text style={styles.cardSubtitle}>{t(card.subtitleKey)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.ariaFab}
        activeOpacity={0.9}
        onPress={openAriaAssistant}
      >
        <Text style={styles.ariaFabText}>{t('home.ariaFab')}</Text>
      </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 96,
    rowGap: 16,
  },
  greetingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
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
  ariaFab: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  ariaFabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
