/**
 * AGRI-मित्र Profile Screen
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Full user profile with view/edit, language switcher, and account settings.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });

  // ─── Guest mode ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View style={styles.guestContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <MaterialCommunityIcons name="account-off-outline" size={64} color="#ccc" />
        <Text style={styles.guestTitle}>{t('profile.guestTitle')}</Text>
        <Text style={styles.guestSub}>{t('profile.guestSubtitle')}</Text>

        <Text style={styles.langLabel}>{t('profile.language')}</Text>
        <LanguageSwitcher style={{ marginBottom: 24 }} />

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>{t('auth.loginBtn')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            {t('auth.noAccount')} <Text style={styles.linkText}>{t('auth.registerNow')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Start editing ──────────────────────────────────────────────────────
  const startEdit = () => {
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      district: user.district || '',
      state: user.state || 'Maharashtra',
      main_crop: user.main_crop || '',
      farm_size_acres: user.farm_size_acres ? String(user.farm_size_acres) : '',
      soil_type: user.soil_type || '',
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updates = { ...form };
      if (updates.farm_size_acres) updates.farm_size_acres = parseFloat(updates.farm_size_acres);
      else delete updates.farm_size_acres;
      await updateProfile(updates);
      setEditing(false);
    } catch (err) {
      Alert.alert(t('common.error'), err?.response?.data?.detail || t('profile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPw.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMin'));
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      Alert.alert('✓', t('profile.passwordChanged'));
      setPwModal(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      Alert.alert(t('common.error'), err?.response?.data?.detail || t('profile.passwordFailed'));
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  // ─── Profile field row ─────────────────────────────────────────────────
  const ProfileField = ({ icon, label, value, field }) => (
    <View style={styles.fieldRow}>
      <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} style={styles.fieldIcon} />
      <View style={styles.fieldBody}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editing && field ? (
          <TextInput
            style={styles.fieldInput}
            value={form[field] || ''}
            onChangeText={v => setForm(prev => ({ ...prev, [field]: v }))}
            placeholder="—"
            placeholderTextColor="#ccc"
          />
        ) : (
          <Text style={styles.fieldValue}>{value || '—'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="account" size={40} color="#fff" />
        </View>
        <Text style={styles.headerName}>{user.full_name}</Text>
        <Text style={styles.headerPhone}>{user.phone}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* ── Info Card ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('profile.personalInfo')}</Text>
            {!editing ? (
              <TouchableOpacity onPress={startEdit}>
                <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <MaterialCommunityIcons name="close" size={22} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <MaterialCommunityIcons name="check" size={22} color={COLORS.accent} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ProfileField icon="account" label={t('auth.fullName')} value={user.full_name} field="full_name" />
          <ProfileField icon="email" label={t('profile.email')} value={user.email} field="email" />
          <ProfileField icon="map-marker" label={t('auth.district')} value={user.district} field="district" />
          <ProfileField icon="map" label={t('profile.state')} value={user.state} field="state" />
          <ProfileField icon="sprout" label={t('auth.mainCrop')} value={user.main_crop} field="main_crop" />
          <ProfileField icon="ruler-square" label={t('auth.farmSize')} value={user.farm_size_acres ? `${user.farm_size_acres} acres` : null} field="farm_size_acres" />
          <ProfileField icon="terrain" label={t('auth.soilType')} value={user.soil_type} field="soil_type" />
        </View>

        {/* ── Language ──────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile.language')}</Text>
          <LanguageSwitcher style={{ marginTop: 10 }} />
        </View>

        {/* ── Password change ───────────────────────────────────────── */}
        {!pwModal ? (
          <TouchableOpacity style={styles.menuItem} onPress={() => setPwModal(true)}>
            <MaterialCommunityIcons name="lock-reset" size={22} color={COLORS.primary} />
            <Text style={styles.menuText}>{t('profile.changePassword')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color="#ccc" />
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('profile.changePassword')}</Text>
            <TextInput
              style={styles.pwInput}
              placeholder={t('profile.currentPassword')}
              placeholderTextColor="#aaa"
              secureTextEntry
              value={pwForm.current}
              onChangeText={v => setPwForm(p => ({ ...p, current: v }))}
            />
            <TextInput
              style={styles.pwInput}
              placeholder={t('profile.newPassword')}
              placeholderTextColor="#aaa"
              secureTextEntry
              value={pwForm.newPw}
              onChangeText={v => setPwForm(p => ({ ...p, newPw: v }))}
            />
            <TextInput
              style={styles.pwInput}
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor="#aaa"
              secureTextEntry
              value={pwForm.confirm}
              onChangeText={v => setPwForm(p => ({ ...p, confirm: v }))}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.pwBtn, { backgroundColor: '#eee' }]}
                onPress={() => { setPwModal(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}
              >
                <Text style={{ color: '#666' }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pwBtn} onPress={handlePasswordChange}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Dashboard link ────────────────────────────────────────── */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="view-dashboard" size={22} color={COLORS.primary} />
          <Text style={styles.menuText}>{t('profile.dashboard')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#ccc" />
        </TouchableOpacity>

        {/* ── Logout ────────────────────────────────────────────────── */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={COLORS.warning} />
          <Text style={[styles.menuText, { color: COLORS.warning }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Guest
  guestContainer: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  guestTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 6 },
  guestSub: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 20 },
  langLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, height: 50, width: '80%',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerLink: { paddingVertical: 8 },
  registerLinkText: { fontSize: 14, color: '#666' },
  linkText: { color: COLORS.primary, fontWeight: '700' },

  // Header
  header: {
    backgroundColor: COLORS.primary, paddingTop: 48, paddingBottom: 24,
    alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  headerName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerPhone: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Body
  body: { flex: 1, marginTop: -8 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 16 },

  // Card
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  // Field
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  fieldIcon: { marginRight: 12 },
  fieldBody: { flex: 1 },
  fieldLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  fieldValue: { fontSize: 15, color: COLORS.text },
  fieldInput: {
    fontSize: 15, color: COLORS.text,
    borderBottomWidth: 1.5, borderBottomColor: COLORS.accent,
    paddingVertical: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    elevation: 1,
  },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, marginLeft: 12 },
  logoutItem: { borderWidth: 1, borderColor: COLORS.warning + '30' },

  // Password
  pwInput: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 10,
    height: 46, paddingHorizontal: 14, fontSize: 15, marginTop: 10,
    backgroundColor: '#FAFAFA', color: COLORS.text,
  },
  pwBtn: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
});
