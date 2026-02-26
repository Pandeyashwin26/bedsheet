import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://YOUR_BACKEND_URL:8000';
const CACHE_PREFIX = 'agrichain_api_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 9000,
});

const CROP_MATURITY_DAYS = {
  onion: 125,
  tomato: 95,
  wheat: 120,
  rice: 135,
  potato: 105,
  soybean: 110,
};

const CROP_BASE_PRICE = {
  onion: 2100,
  tomato: 1750,
  wheat: 2650,
  rice: 3100,
  potato: 1550,
  soybean: 5200,
};

const STORAGE_BASE_RISK = {
  'open field': 0.7,
  warehouse: 0.4,
  'cold storage': 0.15,
};

const CROP_DECAY_RATE = {
  onion: 0.008,
  tomato: 0.04,
  wheat: 0.0015,
  rice: 0.0015,
  potato: 0.01,
  soybean: 0.0045,
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const buildComboKey = (crop, district) =>
  `${normalize(crop) || 'unknown-crop'}::${normalize(district) || 'unknown-district'}`;

const buildCacheKey = (endpoint, crop, district) =>
  `${CACHE_PREFIX}:${endpoint}:${buildComboKey(crop, district)}`;

const toIso = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
};

const withMeta = (payload, source) => ({
  ...payload,
  _meta: {
    source,
    usedCache: source === 'cache',
    usedMock: source === 'mock',
    banner:
      source === 'cache'
        ? '\u{1F4F5} Using cached data'
        : source === 'mock'
          ? null
          : null,
  },
});

const readCachedPayload = async (cacheKey) => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.payload) {
      return null;
    }

    if (Date.now() - Number(parsed.timestamp) > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }
    return parsed.payload;
  } catch {
    return null;
  }
};

const writeCachedPayload = async (cacheKey, payload) => {
  try {
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        payload,
      })
    );
  } catch {
    // Ignore cache write failures.
  }
};

const requestWithFallback = async ({
  endpoint,
  payload,
  crop,
  district,
  mockFactory,
}) => {
  const cacheKey = buildCacheKey(endpoint, crop, district);

  try {
    const response = await apiClient.post(endpoint, payload);
    const data = response?.data || {};
    await writeCachedPayload(cacheKey, data);
    return withMeta(data, 'network');
  } catch {
    const cachedPayload = await readCachedPayload(cacheKey);
    if (cachedPayload) {
      return withMeta(cachedPayload, 'cache');
    }
    return withMeta(mockFactory(), 'mock');
  }
};

const buildHarvestMock = (cropData) => {
  const cropKey = normalize(cropData.crop);
  const maturityDays = CROP_MATURITY_DAYS[cropKey] || 110;
  const sowing = new Date(cropData.sowing_date || cropData.sowingDate || new Date());
  if (Number.isNaN(sowing.getTime())) {
    sowing.setTime(Date.now() - 100 * 24 * 60 * 60 * 1000);
  }

  const base = new Date(sowing);
  base.setDate(base.getDate() + maturityDays);

  const start = new Date(base);
  const end = new Date(base);
  start.setDate(start.getDate() - 1);
  end.setDate(end.getDate() + 1);

  const cropStage = normalize(cropData.crop_stage || cropData.cropStage);
  const recommendation =
    cropStage === 'harvest-ready' ? 'harvest_now' : 'wait_2_days';

  return {
    harvest_window: {
      start: toIso(start),
      end: toIso(end),
    },
    recommendation,
    risk_if_delayed:
      'Using local fallback model. Confirm once connectivity resumes.',
    confidence: 0.58,
  };
};

const buildMandiMock = (cropData) => {
  const cropKey = normalize(cropData.crop);
  const basePrice = CROP_BASE_PRICE[cropKey] || 2200;
  const qtyQuintals = Number(cropData.quantity_quintals || cropData.quantityQuintals || 10);

  const rangeMin = Math.round(basePrice * 0.96);
  const rangeMax = Math.round(basePrice * 1.05);
  const transport = 240;
  const netBest = Math.round(rangeMax * qtyQuintals - transport * qtyQuintals);
  const netLocal = Math.round(rangeMin * qtyQuintals);

  return {
    best_mandi: `${cropData.district || 'Local'} Mandi`,
    expected_price_range: [rangeMin, rangeMax],
    transport_cost: transport,
    net_profit_comparison: {
      best_mandi: netBest,
      local_mandi: netLocal,
    },
    price_trend: {
      direction: 'stable',
      confidence: 0.56,
    },
    confidence: 0.56,
  };
};

const buildSpoilageMock = (storageData) => {
  const cropKey = normalize(storageData.crop);
  const storageKey = normalize(storageData.storage_type || storageData.storageType);
  const days = Math.max(0, Number(storageData.days_since_harvest || storageData.daysSinceHarvest || 0));
  const transit = Math.max(0, Number(storageData.transit_hours || storageData.transitHours || 0));
  const avgTemp = Number(storageData.avg_temp || 34);

  const base = STORAGE_BASE_RISK[storageKey] ?? 0.4;
  const decay = CROP_DECAY_RATE[cropKey] ?? 0.008;
  const tempPenalty = avgTemp > 30 ? (avgTemp - 30) * 0.02 : 0;
  const risk = Math.min(0.95, base + days * decay + transit * 0.015 + tempPenalty);
  const riskScore = Number(risk.toFixed(3));

  const riskCategory =
    riskScore <= 0.3
      ? 'Low'
      : riskScore <= 0.6
        ? 'Medium'
        : riskScore <= 0.8
          ? 'High'
          : 'Critical';

  const daysSafe = riskScore >= 0.7 ? 0 : Math.max(0, Math.floor((0.7 - riskScore) / (decay + 0.003)));

  return {
    risk_score: riskScore,
    risk_category: riskCategory,
    risk_factors: [
      `${days} days since harvest increased base decay.`,
      `${Math.round(transit)} transit hours increased handling exposure.`,
      avgTemp > 30
        ? 'High temperature accelerated spoilage.'
        : 'Temperature impact was moderate.',
    ],
    days_safe: daysSafe,
    preservation_actions_ranked: [
      {
        rank: 1,
        tag: 'cheapest',
        action: 'Sell immediately at local market',
        cost_inr_per_quintal: 0,
        saves_percent: 24,
      },
      {
        rank: 2,
        tag: 'moderate',
        action: 'Move to cold storage',
        cost_inr_per_quintal: 450,
        saves_percent: 84,
      },
      {
        rank: 3,
        tag: 'best_outcome',
        action: 'Grade + warehouse storage',
        cost_inr_per_quintal: 780,
        saves_percent: 91,
      },
    ],
    avg_temp: avgTemp,
    confidence: 0.57,
  };
};

const buildExplainMock = (decisionData) => ({
  weather_reason:
    'Weather is stable for the next 7 days. Safe window for field operations.',
  market_reason: `Mandi prices for ${decisionData.crop} are stable. Monitor daily before dispatch.`,
  supply_reason: 'Supply levels are normal this week; sudden oversupply pressure is limited.',
  confidence_message: 'Medium confidence. Limited mandi data for your district.',
  confidence: 0.58,
  decision_id: decisionData.decision_id || decisionData.decisionId || 'mock-decision',
});

export const getHarvestRecommendation = async (cropData) =>
  requestWithFallback({
    endpoint: '/predict/harvest',
    payload: {
      crop: cropData.crop,
      district: cropData.district,
      sowing_date: cropData.sowingDate || cropData.sowing_date,
      crop_stage: cropData.cropStage || cropData.crop_stage || 'harvest-ready',
      soil_type: cropData.soilType || cropData.soil_type || 'Loamy',
      state: cropData.state || 'Maharashtra',
    },
    crop: cropData.crop,
    district: cropData.district,
    mockFactory: () => buildHarvestMock(cropData),
  });

export const getMandiRecommendation = async (cropData) =>
  requestWithFallback({
    endpoint: '/predict/mandi',
    payload: {
      crop: cropData.crop,
      district: cropData.district,
      quantity_quintals: Number(cropData.quantityQuintals || cropData.quantity_quintals || 10),
      state: cropData.state || 'Maharashtra',
    },
    crop: cropData.crop,
    district: cropData.district,
    mockFactory: () => buildMandiMock(cropData),
  });

export const getSpoilageRisk = async (storageData) =>
  requestWithFallback({
    endpoint: '/predict/spoilage',
    payload: {
      crop: storageData.crop,
      storage_type: storageData.storageType || storageData.storage_type,
      transit_hours: Number(storageData.transitHours || storageData.transit_hours || 12),
      days_since_harvest: Number(storageData.daysSinceHarvest || storageData.days_since_harvest || 0),
      district: storageData.district || 'Nashik',
      state: storageData.state || 'Maharashtra',
    },
    crop: storageData.crop,
    district: storageData.district || 'Nashik',
    mockFactory: () => buildSpoilageMock(storageData),
  });

export const getExplanation = async (decisionData) =>
  requestWithFallback({
    endpoint: '/explain/recommendation',
    payload: {
      crop: decisionData.crop,
      district: decisionData.district,
      decision_id: decisionData.decisionId || decisionData.decision_id || 'decision-latest',
      state: decisionData.state || 'Maharashtra',
    },
    crop: decisionData.crop,
    district: decisionData.district,
    mockFactory: () => buildExplainMock(decisionData),
  });

export const formatCurrency = (value) =>
  `\u20B9${new Intl.NumberFormat('en-IN').format(Math.round(Number(value) || 0))}`;

export const classifyConfidence = (score) => {
  const value = Number(score || 0);
  if (value > 0.75) {
    return {
      label: 'High confidence',
      color: '#1F9D55',
    };
  }
  if (value > 0.55) {
    return {
      label: 'Medium confidence',
      color: '#D9A400',
    };
  }
  return {
    label: 'Based on regional averages',
    color: '#D9822B',
  };
};

export const API_BASE_URL = BASE_URL;
