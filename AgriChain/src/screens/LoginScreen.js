/**
 * AGRI-मित्र Login Screen
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      const msg =
        err?.response?.data?.detail || t('auth.loginFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="sprout" size={44} color="#fff" />
          </View>
          <Text style={styles.appName}>AGRI-मित्र</Text>
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
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingBottom: 30 },

  header: { alignItems: 'center', paddingTop: 50, marginBottom: 30 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20,
    flex: 1, minHeight: 400,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20, textAlign: 'center' },

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

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
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
