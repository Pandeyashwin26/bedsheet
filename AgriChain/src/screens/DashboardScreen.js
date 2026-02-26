/**
 * AGRI-मित्र Dashboard Screen — Material Design 3
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, ELEVATION, RADIUS, SPACING, TYPOGRAPHY } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshProfile?.().catch(() => {});
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshProfile?.(); } catch {}
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'chart-line', label: t('dashboard.checkPrices'), screen: 'Market', color: '#0277BD', bg: '#E1F5FE' },
    { icon: 'leaf', label: t('dashboard.scanDisease'), screen: 'Disease', color: '#2E7D32', bg: '#E8F5E9' },
    { icon: 'weather-partly-cloudy', label: t('dashboard.weather'), screen: 'HomeScreen', color: '#E65100', bg: '#FFF3E0' },
    { icon: 'account-cog', label: t('dashboard.editProfile'), screen: 'Profile', color: '#6A1B9A', bg: '#F3E5F5' },
  ];

  const statCards = [
    { icon: 'sprout', label: t('dashboard.mainCrop'), value: user?.main_crop ? user.main_crop.charAt(0).toUpperCase() + user.main_crop.slice(1) : '—', color: '#2E7D32', bg: '#E8F5E9' },
    { icon: 'ruler-square', label: t('dashboard.farmSize'), value: user?.farm_size_acres ? `${user.farm_size_acres} ${t('dashboard.acres')}` : '—', color: '#0277BD', bg: '#E1F5FE' },
    { icon: 'counter', label: t('dashboard.harvests'), value: String(user?.total_harvests ?? 0), color: '#E65100', bg: '#FFF3E0' },
    { icon: 'currency-inr', label: t('dashboard.savings'), value: user?.savings_estimate ? `₹${Number(user.savings_estimate).toLocaleString('en-IN')}` : '₹0', color: '#1B5E20', bg: '#E8F5E9' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard.goodMorning');
    if (h < 17) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.full_name || t('dashboard.farmer')}</Text>
            <Text style={styles.location}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color="rgba(255,255,255,0.7)" />
              {' '}{user?.district || '—'}, {user?.state || 'Maharashtra'}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Profile')}>
            <MaterialCommunityIcons name="account" size={28} color={COLORS.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* ── Stats Grid ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('dashboard.farmOverview')}</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: s.bg }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.7}>
              <View style={[styles.actionIconBg, { backgroundColor: a.bg }]}>
                <MaterialCommunityIcons name={a.icon} size={26} color={a.color} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={2}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI Insights Card ──────────────────────────────────────── */}
        <TouchableOpacity style={styles.insightCard} onPress={() => navigation.navigate('ARIA')} activeOpacity={0.8}>
          <View style={styles.insightIconWrap}>
            <MaterialCommunityIcons name="robot-outline" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.insightRight}>
            <Text style={styles.insightTitle}>{t('dashboard.askAria')}</Text>
            <Text style={styles.insightSub}>{t('dashboard.ariaDescription')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.outlineVariant} />
        </TouchableOpacity>

        {/* ── Member Since ──────────────────────────────────────────── */}
        <View style={styles.memberCard}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={COLORS.primary} />
          <Text style={styles.memberText}>
            {t('dashboard.memberSince')}{' '}
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48, paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...TYPOGRAPHY.bodySmall, color: 'rgba(255,255,255,0.75)' },
  userName: { ...TYPOGRAPHY.headlineSmall, color: COLORS.onPrimary, fontWeight: '800', marginTop: 2 },
  location: { ...TYPOGRAPHY.labelSmall, color: 'rgba(255,255,255,0.7)', marginTop: SPACING.xs },
  avatarCircle: {
    width: 48, height: 48, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: 30 },

  sectionTitle: { ...TYPOGRAPHY.titleMedium, color: COLORS.onSurface, fontWeight: '700', marginBottom: SPACING.sm, marginTop: SPACING.sm },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, ...ELEVATION.level1,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  statValue: { ...TYPOGRAPHY.titleLarge, color: COLORS.onSurface, fontWeight: '800' },
  statLabel: { ...TYPOGRAPHY.labelSmall, color: COLORS.onSurfaceVariant, marginTop: 2 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, alignItems: 'center', ...ELEVATION.level1,
  },
  actionIconBg: {
    width: 50, height: 50, borderRadius: RADIUS.lg,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  actionLabel: { ...TYPOGRAPHY.labelMedium, color: COLORS.onSurface, textAlign: 'center', fontWeight: '600' },

  insightCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryContainer, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.sm,
  },
  insightIconWrap: { marginRight: SPACING.md },
  insightRight: { flex: 1 },
  insightTitle: { ...TYPOGRAPHY.titleSmall, color: COLORS.primary, fontWeight: '700' },
  insightSub: { ...TYPOGRAPHY.bodySmall, color: COLORS.onSurfaceVariant, marginTop: 2 },

  memberCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, gap: SPACING.xs,
  },
  memberText: { ...TYPOGRAPHY.labelMedium, color: COLORS.onSurfaceVariant },
});
