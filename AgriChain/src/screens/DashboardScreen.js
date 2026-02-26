/**
 * AGRI-मित्र Dashboard Screen
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Personalized user dashboard with farm overview, quick stats,
 * quick actions, and recent activity.
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
import { COLORS } from '../theme/colors';
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
    { icon: 'chart-line', label: t('dashboard.checkPrices'), screen: 'Market', color: '#2196F3' },
    { icon: 'leaf', label: t('dashboard.scanDisease'), screen: 'Disease', color: '#4CAF50' },
    { icon: 'weather-partly-cloudy', label: t('dashboard.weather'), screen: 'HomeScreen', color: '#FF9800' },
    { icon: 'account-cog', label: t('dashboard.editProfile'), screen: 'Profile', color: '#9C27B0' },
  ];

  const statCards = [
    {
      icon: 'sprout',
      label: t('dashboard.mainCrop'),
      value: user?.main_crop ? user.main_crop.charAt(0).toUpperCase() + user.main_crop.slice(1) : '—',
      color: COLORS.accent,
    },
    {
      icon: 'ruler-square',
      label: t('dashboard.farmSize'),
      value: user?.farm_size_acres ? `${user.farm_size_acres} ${t('dashboard.acres')}` : '—',
      color: '#2196F3',
    },
    {
      icon: 'counter',
      label: t('dashboard.harvests'),
      value: String(user?.total_harvests ?? 0),
      color: '#FF9800',
    },
    {
      icon: 'currency-inr',
      label: t('dashboard.savings'),
      value: user?.savings_estimate ? `₹${Number(user.savings_estimate).toLocaleString('en-IN')}` : '₹0',
      color: '#4CAF50',
    },
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
              <MaterialCommunityIcons name="map-marker" size={14} color="rgba(255,255,255,0.7)" />
              {' '}{user?.district || '—'}, {user?.state || 'Maharashtra'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialCommunityIcons name="account" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* ── Stats Grid ────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('dashboard.farmOverview')}</Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: s.color + '20' }]}>
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
            <TouchableOpacity
              key={i}
              style={styles.actionCard}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, { backgroundColor: a.color + '15' }]}>
                <MaterialCommunityIcons name={a.icon} size={26} color={a.color} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={2}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AI Insights Card ──────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.insightCard}
          onPress={() => navigation.navigate('ARIA')}
          activeOpacity={0.8}
        >
          <View style={styles.insightLeft}>
            <MaterialCommunityIcons name="robot" size={30} color={COLORS.primary} />
          </View>
          <View style={styles.insightRight}>
            <Text style={styles.insightTitle}>{t('dashboard.askAria')}</Text>
            <Text style={styles.insightSub}>{t('dashboard.ariaDescription')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* ── Member Since ──────────────────────────────────────────── */}
        <View style={styles.memberCard}>
          <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.accent} />
          <Text style={styles.memberText}>
            {t('dashboard.memberSince')}{' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
              : '—'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary, paddingTop: 48, paddingBottom: 20,
    paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 12, elevation: 1,
  },
  statIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: '#777', marginTop: 2 },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 12, alignItems: 'center', elevation: 1,
  },
  actionIconBg: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  insightCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 14,
    padding: 16, marginTop: 8, marginBottom: 12,
  },
  insightLeft: { marginRight: 14 },
  insightRight: { flex: 1 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  insightSub: { fontSize: 12, color: '#555', marginTop: 2 },

  memberCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 6,
  },
  memberText: { fontSize: 13, color: '#777' },
});
