import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Card, Text, ActivityIndicator } from 'react-native-paper';
import {
  formatCurrency,
  formatWindowLabel,
  getRecommendation,
} from '../services/recommendationService';
import { COLORS } from '../theme/colors';

const BADGE_ITEMS = [
  '\u{1F326}\u{FE0F} Weather \u2713',
  '\u{1F331} Soil \u2713',
  '\u{1F4C8} Mandi \u2713',
];

const defaultFormData = {
  crop: 'Onion',
  district: 'Nashik',
  soilType: 'Black Soil (Regur)',
  sowingDate: new Date().toISOString(),
  storageType: 'Warehouse',
  transitHours: 12,
};

export default function RecommendationScreen({ navigation, route }) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);

  const formData = useMemo(
    () => route?.params?.formData || defaultFormData,
    [route?.params?.formData]
  );

  useEffect(() => {
    let mounted = true;

    const loadRecommendation = async () => {
      setLoading(true);
      let response;
      try {
        response = await getRecommendation(formData);
      } catch {
        response = await getRecommendation(defaultFormData);
      }
      if (mounted) {
        setRecommendation(response);
        setLoading(false);
      }
    };

    loadRecommendation();

    return () => {
      mounted = false;
    };
  }, [formData]);

  if (loading || !recommendation) {
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator animating size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Preparing your recommendation...</Text>
      </View>
    );
  }

  const windowText = formatWindowLabel(
    recommendation.harvestWindow.start,
    recommendation.harvestWindow.end
  );

  const usingFallback =
    recommendation.sources.weather !== 'api' || recommendation.sources.mandi !== 'api';

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Recommendation" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <View style={[styles.cardHeader, styles.harvestHeader]}>
            <Text style={styles.cardHeaderText}>
              {'\u{1F5D3}\u{FE0F} Best Harvest Window'}
            </Text>
          </View>
          <Card.Content style={styles.cardBody}>
            <Text style={styles.windowValue}>{windowText}</Text>

            <View style={styles.badgeRow}>
              {BADGE_ITEMS.map((item) => (
                <View key={item} style={styles.badgePill}>
                  <Text style={styles.badgeText}>{item}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.windowSubtitle}>
              {recommendation.harvestWindow.subtitle}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <View style={[styles.cardHeader, styles.marketHeader]}>
            <Text style={styles.cardHeaderText}>
              {`\u{1F3EA} Sell at ${recommendation.mandi.marketName}`}
            </Text>
          </View>
          <Card.Content style={styles.cardBody}>
            <Text style={styles.priceRange}>
              {`${formatCurrency(recommendation.mandi.minPrice)} \u2014 ${formatCurrency(
                recommendation.mandi.maxPrice
              )} per kg`}
            </Text>

            <Text style={styles.marketMeta}>
              {`\u{1F4CD} ${recommendation.mandi.distanceKm} km away  |  \u{1F69B} Est. cost ${formatCurrency(
                recommendation.mandi.transportCost
              )}`}
            </Text>

            <View style={styles.profitBox}>
              <Text style={styles.profitLine}>
                {`Local sale \u2192 ${formatCurrency(recommendation.mandi.localSale)}`}
              </Text>
              <Text style={styles.profitLine}>
                {`${recommendation.mandi.marketName} \u2192 ${formatCurrency(
                  recommendation.mandi.mandiSale
                )}`}
              </Text>
              <Text style={styles.extraEarning}>
                {`You earn ${formatCurrency(
                  recommendation.mandi.extraEarnings
                )} MORE \u2705`}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setExpanded((prev) => !prev)}
            style={styles.whyHeaderRow}
          >
            <Text style={styles.whyTitle}>
              {'\u{1F50D} Why we recommend this'}
            </Text>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          {expanded ? (
            <Card.Content style={styles.whyBody}>
              {recommendation.reasons.map((reason) => (
                <View key={reason.text} style={styles.reasonRow}>
                  <Text style={styles.reasonIcon}>{reason.icon}</Text>
                  <Text style={styles.reasonText}>{reason.text}</Text>
                </View>
              ))}
            </Card.Content>
          ) : null}
        </Card>

        {usingFallback ? (
          <Text style={styles.fallbackText}>
            Live APIs are unavailable right now, so fallback calculations are shown.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loaderText: {
    marginTop: 14,
    color: '#58656D',
    fontSize: 15,
  },
  header: {
    backgroundColor: COLORS.card,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EC',
  },
  headerTitle: {
    color: COLORS.text,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    rowGap: 14,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  harvestHeader: {
    backgroundColor: COLORS.primary,
  },
  marketHeader: {
    backgroundColor: '#1D4E89',
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    paddingVertical: 14,
    rowGap: 12,
  },
  windowValue: {
    color: COLORS.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EAF4EE',
  },
  badgeText: {
    color: '#24513F',
    fontSize: 12,
    fontWeight: '600',
  },
  windowSubtitle: {
    color: '#53606A',
    fontSize: 14,
  },
  priceRange: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  marketMeta: {
    fontSize: 14,
    color: '#4F5D67',
  },
  profitBox: {
    backgroundColor: '#EEF3F8',
    borderRadius: 12,
    padding: 12,
    rowGap: 6,
  },
  profitLine: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  extraEarning: {
    marginTop: 2,
    color: '#0A8A3A',
    fontSize: 15,
    fontWeight: '800',
  },
  whyHeaderRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  whyBody: {
    paddingTop: 2,
    paddingBottom: 16,
    rowGap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
  },
  reasonIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  reasonText: {
    flex: 1,
    color: '#2E3A42',
    fontSize: 14,
    lineHeight: 21,
  },
  fallbackText: {
    color: '#5D6871',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
