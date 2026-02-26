/**
 * AGRI-मित्र Login Screen
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

// ── Quick login accounts ─────────────────────────────────────────────────────
const QUICK_LOGINS = [
  { name: 'Prem',   phone: '9876543001', password: 'prem123456', icon: 'account', color: '#E67E22' },
  { name: 'Bhumi',  phone: '9876543002', password: 'bhumi123456', icon: 'account-heart', color: '#2ECC71' },
  { name: 'Ashwin', phone: '9876543003', password: 'ashwin123456', icon: 'account-star', color: '#3498DB' },
];

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null); // index of loading quick login
  const [errors, setErrors] = useState({});

  const passwordRef = useRef(null);

  const validate = () => {
    const e = {};
    const cleaned = phone.replace(/\s|-/g, '');
    if (!cleaned || cleaned.length < 10) e.phone = t('auth.phoneRequired');
    if (!password || password.length < 6) e.password = t('auth.passwordMin');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (err) {
      console.log('[LoginScreen] login error:', err.message, err.code);
      let msg = err?.response?.data?.detail || '';
      if (!msg) {
        if (err.code === 'ECONNABORTED') msg = 'Server timeout — is backend running?';
        else if (err.message?.includes('Network Error')) msg = 'Cannot reach server. Check connection.';
        else msg = t('auth.loginFailed');
      }
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (idx) => {
    const account = QUICK_LOGINS[idx];
    setQuickLoading(idx);
    try {
      await login(account.phone, account.password);
    } catch (err) {
      console.log('[LoginScreen] quick login error:', err.message, err.code);
      let msg = err?.response?.data?.detail || '';
      if (!msg) {
        if (err.code === 'ECONNABORTED') msg = 'Server timeout — is backend running?';
        else if (err.message?.includes('Network Error')) msg = 'Cannot reach server. Check connection.';
        else msg = t('auth.loginFailed');
      }
      Alert.alert(t('common.error'), `${account.name}: ${msg}`);
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo Header ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo (2).jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        </View>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.loginTitle')}</Text>

          {/* Phone */}
          <Text style={styles.label}>{t('auth.phone')}</Text>
          <View style={[styles.inputRow, errors.phone && styles.inputError]}>
            <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              maxLength={15}
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors(prev => ({ ...prev, phone: null })); }}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Password */}
          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={[styles.inputRow, errors.password && styles.inputError]}>
            <MaterialCommunityIcons name="lock" size={20} color={COLORS.primary} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors(prev => ({ ...prev, password: null })); }}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t('auth.loginBtn')}</Text>
            )}
          </TouchableOpacity>

          {/* ── Quick Login Section ──────────────────────────────────────── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Login</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.quickLoginRow}>
            {QUICK_LOGINS.map((account, idx) => (
              <TouchableOpacity
                key={account.name}
                style={[styles.quickLoginBtn, { borderColor: account.color }]}
                onPress={() => handleQuickLogin(idx)}
                disabled={quickLoading !== null}
                activeOpacity={0.7}
              >
                {quickLoading === idx ? (
                  <ActivityIndicator size="small" color={account.color} />
                ) : (
                  <>
                    <View style={[styles.quickAvatar, { backgroundColor: account.color }]}>
                      <MaterialCommunityIcons name={account.icon} size={24} color="#fff" />
                    </View>
                    <Text style={[styles.quickLoginName, { color: account.color }]}>
                      {account.name}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryBtnText}>
              {t('auth.noAccount')}{' '}
              <Text style={styles.linkText}>{t('auth.registerNow')}</Text>
            </Text>
          </TouchableOpacity>

          {/* Guest mode */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => navigation.replace('MainTabs')}
          >
            <MaterialCommunityIcons name="account-off" size={18} color="#888" />
            <Text style={styles.guestText}>{t('auth.guestMode')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  scroll: { flexGrow: 1 },

  /* ── Logo Header ────────────────────────────────────────────────────── */
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 10 },
  logo: {
    width: 220, height: 180,
  },
  tagline: { fontSize: 14, color: '#666', marginTop: 4, fontStyle: 'italic' },

  /* ── Card ────────────────────────────────────────────────────────────── */
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20,
    flex: 1, minHeight: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 6,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 16, textAlign: 'center' },

  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12,
    paddingHorizontal: 12, height: 50, backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: COLORS.warning },
  input: { flex: 1, fontSize: 16, color: COLORS.text, marginLeft: 10 },
  errorText: { color: COLORS.warning, fontSize: 12, marginTop: 4 },

  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  /* ── Quick Login ─────────────────────────────────────────────────────── */
  quickLoginRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8, gap: 10,
  },
  quickLoginBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 2, backgroundColor: '#FAFAFA',
  },
  quickAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  quickLoginName: { fontSize: 14, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 12, color: '#999', fontSize: 13 },

  secondaryBtn: { alignItems: 'center', paddingVertical: 10 },
  secondaryBtnText: { fontSize: 14, color: '#666' },
  linkText: { color: COLORS.primary, fontWeight: '700' },

  guestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 10,
  },
  guestText: { color: '#888', fontSize: 13, marginLeft: 6 },
});
