import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, Card, Menu, Text, ActivityIndicator } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { CROP_OPTIONS, STORAGE_OPTIONS } from '../data/agriOptions';
import { COLORS } from '../theme/colors';
import { formatCurrency, getSpoilageRisk } from '../services/apiService';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const DEFAULT_TEMP_C = 36;
const CIRCLE_SIZE = 224;
const STROKE_WIDTH = 16;
const CIRCLE_RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getRiskConfig = (riskPercent) => {
  if (riskPercent <= 30) {
    return { label: 'LOW RISK', color: '#2E7D32' };
  }
  if (riskPercent <= 60) {
    return { label: 'MEDIUM RISK', color: '#F9A825' };
  }
  if (riskPercent <= 80) {
    return { label: 'HIGH RISK', color: '#EF6C00' };
  }
  return { label: 'CRITICAL', color: '#C62828' };
};

function PickerField({ label, value, options, onSelect }) {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            style={styles.pickerButton}
            labelStyle={styles.pickerLabel}
            contentStyle={styles.pickerContent}
            onPress={() => setMenuVisible(true)}
          >
            {value}
          </Button>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option}
            title={option}
            onPress={() => {
              onSelect(option);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}

const actionBadgeStyle = (rank) => {
  if (rank === 1) {
    return {
      badge: styles.greenBadge,
      label: 'Cheapest',
      button: '#2E7D32',
    };
  }
  if (rank === 2) {
    return {
      badge: styles.yellowBadge,
      label: 'Moderate',
      button: '#E0A800',
    };
  }
  return {
    badge: styles.blueBadge,
    label: 'Best Result',
    button: '#2B6CB0',
  };
};

export default function SpoilageScreen({ navigation, route }) {
  const prefill = route?.params?.prefill || {};
  const source = route?.params?.source;
  const initialCrop = prefill.crop || CROP_OPTIONS[0];
  const initialStorage = prefill.storageType || STORAGE_OPTIONS[0];
  const initialDistrict = prefill.district || 'Nashik';
  const transitSeed = Number(prefill.transitHours);
  const initialTransit = Number.isFinite(transitSeed)
    ? clamp(transitSeed, 1, 48)
    : 12;
  const parsedTemp = Number(route?.params?.currentTempC);
  const initialTempC = Number.isFinite(parsedTemp) ? parsedTemp : DEFAULT_TEMP_C;

  const [crop, setCrop] = useState(initialCrop);
  const [daysSinceHarvest, setDaysSinceHarvest] = useState(0);
  const [storageType, setStorageType] = useState(initialStorage);
  const [transitHours, setTransitHours] = useState(initialTransit);
  const [district] = useState(initialDistrict);
  const [tempC, setTempC] = useState(initialTempC);
  const [riskResponse, setRiskResponse] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [offlineBanner, setOfflineBanner] = useState('');

  const progress = useRef(new Animated.Value(0)).current;
  const [animatedRisk, setAnimatedRisk] = useState(0);

  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setAnimatedRisk(value);
    });
    return () => {
      progress.removeListener(listener);
    };
  }, [progress]);

  const checkedRiskPercent = useMemo(() => {
    const score = Number(riskResponse?.risk_score || 0);
    return Math.round(score * 100);
  }, [riskResponse]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: checkedRiskPercent,
      duration: 850,
      useNativeDriver: false,
    }).start();
  }, [checkedRiskPercent, progress]);

  const riskConfig = useMemo(
    () => getRiskConfig(Math.round(animatedRisk)),
    [animatedRisk]
  );

  const progressOffset =
    CIRCLE_CIRCUMFERENCE - (clamp(animatedRisk, 0, 100) / 100) * CIRCLE_CIRCUMFERENCE;

  const runSpoilageCheck = async () => {
    setLoadingRisk(true);
    const response = await getSpoilageRisk({
      crop,
      storageType,
      transitHours,
      daysSinceHarvest,
      district,
    });

    setRiskResponse(response);
    if (Number.isFinite(Number(response?.avg_temp))) {
      setTempC(Number(response.avg_temp));
    }

    if (response?._meta?.usedCache) {
      setOfflineBanner(
        '\u{1F4F5} No internet \u2014 showing your last saved recommendation'
      );
    } else {
      setOfflineBanner('');
    }
    setLoadingRisk(false);
  };

  const openMapsForColdStorage = async () => {
    const mapsUrl =
      'https://www.google.com/maps/search/?api=1&query=nearest+cold+storage';
    if (await Linking.canOpenURL(mapsUrl)) {
      await Linking.openURL(mapsUrl);
    }
  };

  const openAriaWithPreservationGuide = () => {
    navigation.navigate('MainTabs', {
      screen: 'ARIA',
      params: {
        topic: 'calcium-chloride-storage',
        context: {
          crop,
          district,
          risk_category: riskResponse?.risk_category || 'Medium',
          last_recommendation: 'Apply calcium chloride + warehouse storage',
        },
      },
    });
  };

  const openSellNow = () => {
    navigation.navigate('MainTabs', { screen: 'Market' });
  };

  const openAriaAssistant = () => {
    navigation.navigate('MainTabs', {
      screen: 'ARIA',
      params: {
        context: {
          crop,
          district,
          risk_category: riskResponse?.risk_category || 'Medium',
          last_recommendation:
            actions?.[0]?.action || 'Review spoilage preservation actions',
        },
      },
    });
  };

  const handleAction = (action) => {
    const normalized = String(action || '').toLowerCase();
    if (normalized.includes('cold storage')) {
      openMapsForColdStorage();
      return;
    }
    if (normalized.includes('grade') || normalized.includes('warehouse')) {
      openAriaWithPreservationGuide();
      return;
    }
    openSellNow();
  };

  const actionButtonLabel = (action, rank) => {
    const normalized = String(action || '').toLowerCase();
    if (normalized.includes('cold storage')) {
      return 'Find Cold Storage';
    }
    if (normalized.includes('grade') || normalized.includes('warehouse')) {
      return 'How to do this?';
    }
    return rank === 1 ? 'Sell Now' : 'Apply';
  };

  const actions = riskResponse?.preservation_actions_ranked || [];
  const riskFactors = riskResponse?.risk_factors || [];

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Spoilage Risk Checker" titleStyle={styles.headerTitle} />
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

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.sectionTitle}>Input</Text>
            {source === 'recommendation' ? (
              <Text style={styles.prefillText}>
                Auto-filled from your recommendation details.
              </Text>
            ) : null}

            <PickerField
              label="Crop type"
              value={crop}
              options={CROP_OPTIONS}
              onSelect={setCrop}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Days since harvest</Text>
              <Text style={styles.sliderValue}>{`${daysSinceHarvest} days`}</Text>
              <Slider
                minimumValue={0}
                maximumValue={30}
                step={1}
                value={daysSinceHarvest}
                onValueChange={(value) => setDaysSinceHarvest(value)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#D4DEE5"
                thumbTintColor={COLORS.accent}
              />
            </View>

            <PickerField
              label="Storage type"
              value={storageType}
              options={STORAGE_OPTIONS}
              onSelect={setStorageType}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Transit time to mandi</Text>
              <Text style={styles.sliderValue}>{`${transitHours} hours`}</Text>
              <Slider
                minimumValue={1}
                maximumValue={48}
                step={1}
                value={transitHours}
                onValueChange={(value) => setTransitHours(value)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#D4DEE5"
                thumbTintColor={COLORS.accent}
              />
            </View>

            <Text style={styles.tempText}>
              {`\u{1F4CD} Current temp: ${Math.round(tempC)}\u00B0C (from weather)`}
            </Text>

            <Button
              mode="contained"
              style={styles.checkButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.checkButtonContent}
              onPress={runSpoilageCheck}
              disabled={loadingRisk}
            >
              Check Spoilage Risk
            </Button>
          </Card.Content>
        </Card>

        {loadingRisk ? (
          <Card style={styles.card}>
            <Card.Content style={styles.loaderContent}>
              <ActivityIndicator animating size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Calculating spoilage risk...</Text>
            </Card.Content>
          </Card>
        ) : null}

        {riskResponse ? (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Risk Meter</Text>

              <View style={styles.meterWrap}>
                <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                  <Circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_RADIUS}
                    stroke="#E6ECF1"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={CIRCLE_RADIUS}
                    stroke={riskConfig.color}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${CIRCLE_CIRCUMFERENCE}`}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                    rotation="-90"
                  />
                </Svg>

                <View style={styles.meterCenter}>
                  <Text style={[styles.meterPercent, { color: riskConfig.color }]}>
                    {`${Math.round(animatedRisk)}%`}
                  </Text>
                  <Text style={[styles.riskTag, { color: riskConfig.color }]}>
                    {riskResponse?.risk_category?.toUpperCase() || riskConfig.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.riskSummary}>
                {`${checkedRiskPercent}% spoilage risk in 3 days`}
              </Text>
              <Text style={styles.daysSafeText}>
                {`You have approximately ${riskResponse?.days_safe ?? 0} days before significant spoilage`}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {riskResponse ? (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Preservation Actions</Text>
              {actions.map((item) => {
                const style = actionBadgeStyle(item.rank);
                return (
                  <View key={`${item.rank}-${item.action}`} style={styles.rankCard}>
                    <View style={styles.rankTopRow}>
                      <Text style={styles.rankTitle}>
                        {`Rank ${item.rank} — ${style.label}`}
                      </Text>
                      <View style={[styles.badge, style.badge]}>
                        <Text style={styles.badgeText}>{style.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.actionName}>{item.action}</Text>
                    <Text style={styles.actionMeta}>
                      {`Cost: ${formatCurrency(item.cost_inr_per_quintal)}/quintal | You save: ${item.saves_percent}% of stock`}
                    </Text>
                    <Button
                      mode="contained"
                      buttonColor={style.button}
                      style={styles.actionButton}
                      onPress={() => handleAction(item.action)}
                    >
                      {actionButtonLabel(item.action, item.rank)}
                    </Button>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        ) : null}

        {riskResponse && riskFactors.length > 0 ? (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Risk Factors</Text>
              {riskFactors.map((factor) => (
                <View key={factor} style={styles.factorRow}>
                  <Text style={styles.factorBullet}>{'\u2022'}</Text>
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={styles.ariaFab}
        activeOpacity={0.9}
        onPress={openAriaAssistant}
      >
        <Text style={styles.ariaFabText}>{'\u{1F3A4} ARIA'}</Text>
      </TouchableOpacity>
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
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
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
  cardContent: {
    rowGap: 14,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  prefillText: {
    marginTop: -6,
    color: '#5D6A72',
    fontSize: 13,
  },
  fieldBlock: {
    marginBottom: 2,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    borderColor: '#C7CED4',
    borderRadius: 12,
  },
  pickerLabel: {
    color: COLORS.text,
    fontSize: 15,
  },
  pickerContent: {
    minHeight: 48,
    justifyContent: 'center',
  },
  sliderValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  tempText: {
    color: '#35506A',
    fontSize: 15,
    fontWeight: '600',
  },
  checkButton: {
    borderRadius: 14,
    marginTop: 2,
  },
  checkButtonContent: {
    minHeight: 54,
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
  },
  loaderText: {
    marginTop: 10,
    color: '#58656D',
    fontSize: 14,
  },
  meterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 4,
  },
  meterCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  meterPercent: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  riskTag: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  riskSummary: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  daysSafeText: {
    color: '#30506B',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 22,
  },
  rankCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E8EE',
    backgroundColor: '#FAFBFC',
    padding: 12,
    rowGap: 8,
  },
  rankTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: 8,
  },
  rankTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  greenBadge: {
    backgroundColor: '#D7F4D8',
  },
  yellowBadge: {
    backgroundColor: '#FFF2C6',
  },
  blueBadge: {
    backgroundColor: '#D8E9FF',
  },
  badgeText: {
    color: '#20303C',
    fontSize: 11,
    fontWeight: '700',
  },
  actionName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  actionMeta: {
    color: '#4D5A64',
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 4,
    borderRadius: 10,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
  },
  factorBullet: {
    marginTop: 2,
    color: COLORS.primary,
    fontSize: 18,
  },
  factorText: {
    flex: 1,
    color: '#2A3640',
    fontSize: 14,
    lineHeight: 21,
  },
  ariaFab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
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
