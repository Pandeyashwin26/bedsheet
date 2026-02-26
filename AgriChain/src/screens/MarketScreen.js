import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import {
  BEST_SELLING_PERIOD,
  CROP_EMOJIS,
  CROPS,
  DISTRICTS,
  getAllPricesForDistrict,
  getNeighborIntelligence,
} from '../data/marketData';
import { API_BASE_URL } from '../services/apiService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CACHE_KEY = 'agrimitra_market_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export default function MarketScreen() {
  const { t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [expandedCrop, setExpandedCrop] = useState(null);
  const [prices, setPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('local'); // 'api' | 'cache' | 'local'

  const fetchFromApi = useCallback(async (district) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/market/prices`, {
        params: { district, state: 'Maharashtra' },
        timeout: 10000,
      });

      if (response.data?.prices) {
        return {
          data: response.data.prices,
          neighborInfo: response.data.neighbor_intelligence,
          source: response.data.source || 'api',
        };
      }
      return null;
    } catch (error) {
      if (__DEV__) {
        console.warn('Market API fetch failed:', error.message);
      }
      return null;
    }
  }, []);

  const loadPrices = useCallback(async () => {
    // Check cache first
    const cacheRaw = await AsyncStorage.getItem(CACHE_KEY);
    if (cacheRaw) {
      const cached = JSON.parse(cacheRaw);
      if (
        cached.district === selectedDistrict &&
        Date.now() - cached.timestamp < CACHE_TTL
      ) {
        setPrices(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        setDataSource(cached.source || 'cache');
        return;
      }
    }

    // Try API first
    const apiResult = await fetchFromApi(selectedDistrict);
    if (apiResult) {
      setPrices(apiResult.data);
      setLastUpdated(new Date());
      setDataSource('api');
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          district: selectedDistrict,
          data: apiResult.data,
          timestamp: Date.now(),
          source: 'api',
        })
      );
      return;
    }

    // Fallback to local data
    const data = getAllPricesForDistrict(selectedDistrict);
    setPrices(data);
    setLastUpdated(new Date());
    setDataSource('local');
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        district: selectedDistrict,
        data,
        timestamp: Date.now(),
        source: 'local',
      })
    );
  }, [selectedDistrict, fetchFromApi]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Clear cache to force fresh fetch
    await AsyncStorage.removeItem(CACHE_KEY);
    await loadPrices();
    setIsRefreshing(false);
  }, [loadPrices]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const filteredPrices = useMemo(() => {
    if (!selectedCrop) return prices;
    return prices.filter((p) => p.crop === selectedCrop);
  }, [prices, selectedCrop]);

  const neighborInfo = useMemo(() => {
    const crop = selectedCrop || expandedCrop || 'Onion';
    return getNeighborIntelligence(selectedDistrict, crop);
  }, [selectedDistrict, selectedCrop, expandedCrop]);

  const toggleExpand = (crop) => {
    setExpandedCrop(expandedCrop === crop ? null : crop);
  };

  const renderPriceCard = ({ item }) => {
    const isExpanded = expandedCrop === item.crop;
    const changeColor = item.change >= 0 ? '#2E7D32' : '#C62828';
    const changeArrow = item.change >= 0 ? '▲' : '▼';
    const bestPeriod = BEST_SELLING_PERIOD[item.crop];

    const chartLabels = item.history
      ? item.history
        .filter((_, i) => i % 7 === 0 || i === item.history.length - 1)
        .map((h) => h.dateLabel)
      : [];
    const chartData = item.history ? item.history.map((h) => h.price) : [];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggleExpand(item.crop)}
        style={styles.priceCard}
      >
        <View style={styles.priceCardRow}>
          <View style={styles.cropLabelCol}>
            <Text style={styles.cropEmoji}>{item.emoji}</Text>
            <Text style={styles.cropName}>{item.crop}</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceValue}>₹{item.price}/kg</Text>
            <Text style={[styles.priceChange, { color: changeColor }]}>
              {changeArrow} {item.change >= 0 ? '+' : ''}₹{item.change} {t('common.today')}
            </Text>
          </View>
          <View style={styles.mandiCol}>
            <Text style={styles.mandiName}>{item.mandi}</Text>
            <Text style={styles.mandiUpdate}>{t('market.todayUpdate')}</Text>
          </View>
        </View>

        {isExpanded && chartData.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>{t('market.chart30Day')}</Text>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData, strokeWidth: 2 }],
              }}
              width={SCREEN_WIDTH - 64}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalCount: 1,
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(80, 80, 80, ${opacity})`,
                style: { borderRadius: 12 },
                fillShadowGradientFrom: '#52B788',
                fillShadowGradientTo: '#ffffff',
                fillShadowGradientFromOpacity: 0.3,
                fillShadowGradientToOpacity: 0,
                propsForDots: {
                  r: '3',
                  strokeWidth: '1',
                  stroke: '#2E7D32',
                },
              }}
              bezier
              style={styles.chart}
              withVerticalLines={false}
            />
            {/* Best selling period band caption */}
            <View style={styles.bestPeriodRow}>
              <View style={styles.bestPeriodBand} />
              <Text style={styles.bestPeriodText}>{bestPeriod?.caption}</Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title={t('market.header')}
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {lastUpdated ? (
        <View style={styles.updateRow}>
          <Text style={styles.updateText}>
            {t('common.lastUpdated')}: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            {dataSource === 'api' ? ` • ${t('common.live')}` : dataSource === 'cache' ? ` • ${t('common.cached')}` : ` • ${t('common.offline')}`}
          </Text>
        </View>
      ) : null}

      {/* District filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {DISTRICTS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.filterPill,
              selectedDistrict === d && styles.filterPillActive,
            ]}
            onPress={() => setSelectedDistrict(d)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedDistrict === d && styles.filterPillTextActive,
              ]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Crop filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterPill, !selectedCrop && styles.filterPillActive]}
          onPress={() => setSelectedCrop(null)}
        >
          <Text style={[styles.filterPillText, !selectedCrop && styles.filterPillTextActive]}>
            {t('common.all')}
          </Text>
        </TouchableOpacity>
        {CROPS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.filterPill,
              selectedCrop === c && styles.filterPillActive,
            ]}
            onPress={() => setSelectedCrop(c)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCrop === c && styles.filterPillTextActive,
              ]}
            >
              {CROP_EMOJIS[c]} {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Price cards */}
      <FlatList
        data={filteredPrices}
        keyExtractor={(item) => item.crop}
        renderItem={renderPriceCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={
          <Card style={styles.neighborCard}>
            <Card.Content style={styles.neighborContent}>
              <Text style={styles.neighborTitle}>{t('market.neighborTitle')}</Text>
              <Text style={styles.neighborCount}>
                इस हफ्ते {neighborInfo.district} में{' '}
                <Text style={{ fontWeight: '800', color: neighborInfo.color }}>
                  {neighborInfo.farmerCount} किसान
                </Text>{' '}
                {neighborInfo.crop} बेच रहे हैं
              </Text>
              <View
                style={[
                  styles.neighborAlert,
                  { borderColor: neighborInfo.color, backgroundColor: neighborInfo.color + '12' },
                ]}
              >
                <Text style={[styles.neighborMessage, { color: neighborInfo.color }]}>
                  {neighborInfo.message}
                </Text>
                <Text style={styles.neighborSuggestion}>{neighborInfo.suggestion}</Text>
              </View>
            </Card.Content>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.card,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EC',
  },
  headerTitle: { fontWeight: '700', color: COLORS.text, fontSize: 20 },
  updateRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#F0F4F8',
  },
  updateText: { fontSize: 12, color: '#6B7B8A' },

  filterScroll: { flexGrow: 0 },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    columnGap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDF1F5',
  },
  filterPillActive: { backgroundColor: COLORS.primary },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#4F5B62' },
  filterPillTextActive: { color: '#FFFFFF' },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    rowGap: 10,
  },
  priceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  priceCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    flex: 1,
  },
  cropEmoji: { fontSize: 28 },
  cropName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  priceCol: { alignItems: 'center', flex: 1 },
  priceValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  priceChange: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  mandiCol: { alignItems: 'flex-end', flex: 1 },
  mandiName: { fontSize: 13, fontWeight: '600', color: '#4F5B62' },
  mandiUpdate: { fontSize: 11, color: '#8A9BA8', marginTop: 2 },

  chartSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF1F5',
    paddingTop: 12,
  },
  chartTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  chart: { borderRadius: 12, alignSelf: 'center' },
  bestPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    columnGap: 8,
  },
  bestPeriodBand: {
    width: 20,
    height: 10,
    backgroundColor: '#FFEE5820',
    borderWidth: 1,
    borderColor: '#FFD600',
    borderRadius: 3,
  },
  bestPeriodText: {
    flex: 1,
    fontSize: 12,
    color: '#7A6B00',
    fontWeight: '600',
  },

  neighborCard: {
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  neighborContent: { paddingVertical: 16, rowGap: 10 },
  neighborTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  neighborCount: { fontSize: 15, color: '#3A4A56', lineHeight: 24 },
  neighborAlert: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  neighborMessage: { fontSize: 14, fontWeight: '700', lineHeight: 22 },
  neighborSuggestion: { fontSize: 13, color: '#4F5B62', marginTop: 4 },
});
