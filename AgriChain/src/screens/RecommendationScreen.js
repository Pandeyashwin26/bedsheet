import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Appbar, Button, Card, Text } from 'react-native-paper';
import {
  classifyConfidence,
  formatCurrency,
  getExplanation,
  getHarvestRecommendation,
  getMandiRecommendation,
} from '../services/apiService';
import { COLORS } from '../theme/colors';

const defaultFormData = {
  crop: 'Onion',
  cropStage: 'harvest-ready',
  district: 'Nashik',
  soilType: 'Black Soil (Regur)',
  sowingDate: new Date().toISOString(),
  storageType: 'Warehouse',
  transitHours: 12,
};

const formatDateLabel = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Date unavailable';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

const buildWindowText = (harvestWindow) =>
  `${formatDateLabel(harvestWindow?.start)} — ${formatDateLabel(harvestWindow?.end)}`;

function ConfidenceIndicator({ score }) {
  const config = classifyConfidence(score);
  return (
    <View style={styles.confidenceRow}>
      <View style={[styles.confidenceDot, { backgroundColor: config.color }]} />
      <Text style={styles.confidenceText}>{config.label}</Text>
    </View>
  );
}

function SkeletonCard({ title }) {
  return (
    <Card style={styles.card}>
      <View style={styles.skeletonHeader}>
        <Text style={styles.skeletonHeaderText}>{title}</Text>
      </View>
      <Card.Content style={styles.cardBody}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineMid} />
        <View style={styles.skeletonLineShort} />
      </Card.Content>
    </Card>
  );
}

export default function RecommendationScreen({ navigation, route }) {
  const [expanded, setExpanded] = useState(true);
  const [harvestData, setHarvestData] = useState(null);
  const [mandiData, setMandiData] = useState(null);
  const [explanationData, setExplanationData] = useState(null);
  const [loadingHarvest, setLoadingHarvest] = useState(true);
  const [loadingMandi, setLoadingMandi] = useState(true);
  const [loadingWhy, setLoadingWhy] = useState(true);
  const [offlineBanner, setOfflineBanner] = useState('');

  const formData = useMemo(
    () => route?.params?.formData || defaultFormData,
    [route?.params?.formData]
  );

  useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      setLoadingHarvest(true);
      setLoadingMandi(true);
      setLoadingWhy(true);
      setOfflineBanner('');

      const harvestPromise = getHarvestRecommendation({
        crop: formData.crop,
        district: formData.district,
        sowingDate: formData.sowingDate,
        cropStage: formData.cropStage || 'harvest-ready',
        soilType: formData.soilType,
      });

      const mandiPromise = getMandiRecommendation({
        crop: formData.crop,
        district: formData.district,
        quantityQuintals: 10,
      });

      const [harvestResponse, mandiResponse] = await Promise.all([
        harvestPromise,
        mandiPromise,
      ]);

      if (!mounted) {
        return;
      }

      setHarvestData(harvestResponse);
      setMandiData(mandiResponse);
      setLoadingHarvest(false);
      setLoadingMandi(false);

      if (harvestResponse?._meta?.usedCache || mandiResponse?._meta?.usedCache) {
        setOfflineBanner(
          '\u{1F4F5} No internet \u2014 showing your last saved recommendation'
        );
      }

      const explainResponse = await getExplanation({
        crop: formData.crop,
        district: formData.district,
        decisionId: `${formData.crop}-${formData.district}-${Date.now()}`,
      });

      if (!mounted) {
        return;
      }

      setExplanationData(explainResponse);
      setLoadingWhy(false);

      if (explainResponse?._meta?.usedCache) {
        setOfflineBanner(
          '\u{1F4F5} No internet \u2014 showing your last saved recommendation'
        );
      }
    };

    loadRecommendations();
    return () => {
      mounted = false;
    };
  }, [formData]);

  const openSpoilageRisk = () => {
    navigation.navigate('Spoilage', {
      prefill: {
        crop: formData.crop,
        district: formData.district,
        storageType: formData.storageType,
        transitHours: Number(formData.transitHours || 12),
      },
      source: 'recommendation',
    });
  };

  const renderWhyReasons = () => {
    const reasons = [
      explanationData?.weather_reason,
      explanationData?.market_reason,
      explanationData?.supply_reason,
    ].filter(Boolean);

    return reasons.map((reason) => (
      <View key={reason} style={styles.reasonRow}>
        <Text style={styles.reasonIcon}>{'\u2022'}</Text>
        <Text style={styles.reasonText}>{reason}</Text>
      </View>
    ));
  };

  const isPendingBoth = loadingHarvest && loadingMandi;

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
        {offlineBanner ? (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>{offlineBanner}</Text>
          </View>
        ) : null}

        {isPendingBoth || loadingHarvest ? (
          <SkeletonCard title={'\u{1F5D3}\uFE0F Best Harvest Window'} />
        ) : (
          <Card style={styles.card}>
            <View style={[styles.cardHeader, styles.harvestHeader]}>
              <Text style={styles.cardHeaderText}>
                {'\u{1F5D3}\uFE0F Best Harvest Window'}
              </Text>
            </View>
            <Card.Content style={styles.cardBody}>
              <Text style={styles.windowValue}>
                {buildWindowText(harvestData?.harvest_window)}
              </Text>
              <Text style={styles.windowSubtitle}>
                {harvestData?.risk_if_delayed || 'Window based on crop stage and current forecast.'}
              </Text>
              <ConfidenceIndicator score={harvestData?.confidence} />
            </Card.Content>
          </Card>
        )}

        {isPendingBoth || loadingMandi ? (
          <SkeletonCard title={'\u{1F3EA} Best Mandi'} />
        ) : (
          <Card style={styles.card}>
            <View style={[styles.cardHeader, styles.marketHeader]}>
              <Text style={styles.cardHeaderText}>
                {`\u{1F3EA} Sell at ${mandiData?.best_mandi || 'Best Mandi'}`}
              </Text>
            </View>
            <Card.Content style={styles.cardBody}>
              <Text style={styles.priceRange}>
                {`${formatCurrency(mandiData?.expected_price_range?.[0])} — ${formatCurrency(
                  mandiData?.expected_price_range?.[1]
                )} per quintal`}
              </Text>
              <Text style={styles.marketMeta}>
                {`\u{1F69B} Est. transport: ${formatCurrency(mandiData?.transport_cost)}`}
              </Text>
              <View style={styles.profitBox}>
                <Text style={styles.profitLine}>
                  {`Local sale \u2192 ${formatCurrency(
                    mandiData?.net_profit_comparison?.local_mandi
                  )}`}
                </Text>
                <Text style={styles.profitLine}>
                  {`${mandiData?.best_mandi || 'Best mandi'} \u2192 ${formatCurrency(
                    mandiData?.net_profit_comparison?.best_mandi
                  )}`}
                </Text>
              </View>
              <ConfidenceIndicator score={mandiData?.confidence} />
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setExpanded((prev) => !prev)}
            style={styles.whyHeaderRow}
          >
            <Text style={styles.whyTitle}>{'\u{1F50D} Why we recommend this'}</Text>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          {expanded ? (
            <Card.Content style={styles.whyBody}>
              {loadingWhy ? (
                <View style={styles.whyLoader}>
                  <ActivityIndicator animating color={COLORS.primary} />
                  <Text style={styles.loaderText}>Loading explainability reasons...</Text>
                </View>
              ) : (
                <>
                  {renderWhyReasons()}
                  <Text style={styles.confidenceMessage}>
                    {explanationData?.confidence_message}
                  </Text>
                  <ConfidenceIndicator score={explanationData?.confidence} />
                </>
              )}
            </Card.Content>
          ) : null}
        </Card>

        <Button
          mode="contained"
          style={styles.spoilageButton}
          contentStyle={styles.spoilageButtonContent}
          buttonColor="#8D6E63"
          onPress={openSpoilageRisk}
        >
          {'\u{1F4E6} Check Spoilage Risk'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  offlineBanner: {
    backgroundColor: '#FFF1CC',
    borderColor: '#F0CF72',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  offlineBannerText: {
    color: '#7A5B00',
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
  },
  windowSubtitle: {
    color: '#53606A',
    fontSize: 14,
    lineHeight: 21,
  },
  priceRange: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
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
  whyLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loaderText: {
    marginTop: 10,
    color: '#58656D',
    fontSize: 14,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
  },
  reasonIcon: {
    fontSize: 18,
    marginTop: 1,
    color: COLORS.primary,
  },
  reasonText: {
    flex: 1,
    color: '#2E3A42',
    fontSize: 14,
    lineHeight: 21,
  },
  confidenceMessage: {
    color: '#50616C',
    fontSize: 13,
    lineHeight: 18,
  },
  confidenceRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  confidenceText: {
    color: '#3C4952',
    fontSize: 13,
    fontWeight: '600',
  },
  skeletonHeader: {
    backgroundColor: '#DDE5EC',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  skeletonHeaderText: {
    color: '#637180',
    fontSize: 16,
    fontWeight: '700',
  },
  skeletonLineWide: {
    height: 18,
    borderRadius: 10,
    backgroundColor: '#E8EDF2',
    width: '95%',
  },
  skeletonLineMid: {
    height: 14,
    borderRadius: 10,
    backgroundColor: '#EDF2F6',
    width: '72%',
  },
  skeletonLineShort: {
    height: 14,
    borderRadius: 10,
    backgroundColor: '#EDF2F6',
    width: '56%',
  },
  spoilageButton: {
    borderRadius: 14,
    marginTop: 6,
  },
  spoilageButtonContent: {
    minHeight: 54,
  },
});
