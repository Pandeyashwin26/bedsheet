/**
 * AGRI-मित्र Registration Screen
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

const CROPS = ['onion', 'tomato', 'wheat', 'rice', 'potato', 'soybean', 'cotton', 'sugarcane'];
const SOIL_TYPES = ['black', 'red', 'alluvial', 'laterite', 'sandy', 'clay', 'loamy'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    district: '',
    state: 'Maharashtra',
    main_crop: '',
    farm_size_acres: '',
    soil_type: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1 = basic, 2 = farm details

  const refs = {
    phone: useRef(null),
    password: useRef(null),
    confirm: useRef(null),
  };

  const updateField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = t('auth.nameRequired');
    const cleaned = form.phone.replace(/\s|-/g, '');
    if (!cleaned || cleaned.length < 10) e.phone = t('auth.phoneRequired');
    if (!form.password || form.password.length < 6) e.password = t('auth.passwordMin');
    if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.passwordMismatch');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        district: form.district.trim() || undefined,
        state: form.state.trim() || 'Maharashtra',
        main_crop: form.main_crop || undefined,
        farm_size_acres: form.farm_size_acres ? parseFloat(form.farm_size_acres) : undefined,
        soil_type: form.soil_type || undefined,
      };
      await register(payload);
    } catch (err) {
      const msg = err?.response?.data?.detail || t('auth.registerFailed');
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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo (2).jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>{t('auth.createAccount')}</Text>
        </View>

        {/* ── Progress indicator ────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={[styles.progressDot, step >= 1 && styles.progressActive]} />
          <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressActive]} />
        </View>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Text style={styles.cardTitle}>{t('auth.basicInfo')}</Text>

              {/* Full Name */}
              <Text style={styles.label}>{t('auth.fullName')}</Text>
              <View style={[styles.inputRow, errors.full_name && styles.inputError]}>
                <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.fullNamePlaceholder')}
                  placeholderTextColor="#aaa"
                  value={form.full_name}
                  onChangeText={v => updateField('full_name', v)}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.phone.current?.focus()}
                />
              </View>
              {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}

              {/* Phone */}
              <Text style={styles.label}>{t('auth.phone')}</Text>
              <View style={[styles.inputRow, errors.phone && styles.inputError]}>
                <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
                <TextInput
                  ref={refs.phone}
                  style={styles.input}
                  placeholder="9876543210"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  maxLength={15}
                  value={form.phone}
                  onChangeText={v => updateField('phone', v)}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.password.current?.focus()}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              {/* Password */}
              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={[styles.inputRow, errors.password && styles.inputError]}>
                <MaterialCommunityIcons name="lock" size={20} color={COLORS.primary} />
                <TextInput
                  ref={refs.password}
                  style={styles.input}
                  placeholder="••••••"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={v => updateField('password', v)}
                  returnKeyType="next"
                  onSubmitEditing={() => refs.confirm.current?.focus()}
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

              {/* Confirm Password */}
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <View style={[styles.inputRow, errors.confirmPassword && styles.inputError]}>
                <MaterialCommunityIcons name="lock-check" size={20} color={COLORS.primary} />
                <TextInput
                  ref={refs.confirm}
                  style={styles.input}
                  placeholder="••••••"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  value={form.confirmPassword}
                  onChangeText={v => updateField('confirmPassword', v)}
                  returnKeyType="done"
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

              <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.8}>
                <Text style={styles.btnText}>{t('auth.next')}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>{t('auth.farmDetails')}</Text>

              {/* District */}
              <Text style={styles.label}>{t('auth.district')}</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.districtPlaceholder')}
                  placeholderTextColor="#aaa"
                  value={form.district}
                  onChangeText={v => updateField('district', v)}
                />
              </View>

              {/* Main Crop */}
              <Text style={styles.label}>{t('auth.mainCrop')}</Text>
              <View style={styles.chipRow}>
                {CROPS.map(crop => (
                  <TouchableOpacity
                    key={crop}
                    style={[styles.chip, form.main_crop === crop && styles.chipActive]}
                    onPress={() => updateField('main_crop', crop)}
                  >
                    <Text style={[styles.chipText, form.main_crop === crop && styles.chipTextActive]}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Farm Size */}
              <Text style={styles.label}>{t('auth.farmSize')}</Text>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="ruler-square" size={20} color={COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.farmSizePlaceholder')}
                  placeholderTextColor="#aaa"
                  keyboardType="decimal-pad"
                  value={form.farm_size_acres}
                  onChangeText={v => updateField('farm_size_acres', v)}
                />
              </View>

              {/* Soil Type */}
              <Text style={styles.label}>{t('auth.soilType')}</Text>
              <View style={styles.chipRow}>
                {SOIL_TYPES.map(soil => (
                  <TouchableOpacity
                    key={soil}
                    style={[styles.chip, form.soil_type === soil && styles.chipActive]}
                    onPress={() => updateField('soil_type', soil)}
                  >
                    <Text style={[styles.chipText, form.soil_type === soil && styles.chipTextActive]}>
                      {soil.charAt(0).toUpperCase() + soil.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} />
                  <Text style={styles.backBtnText}>{t('auth.back')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.registerBtn, loading && styles.btnDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>{t('auth.registerBtn')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Already have account */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              {t('auth.hasAccount')}{' '}
              <Text style={styles.linkText}>{t('auth.loginNow')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  scroll: { flexGrow: 1 },

  header: { alignItems: 'center', paddingTop: 30, marginBottom: 10 },
  logo: { width: 180, height: 140 },
  tagline: { fontSize: 13, color: '#666', marginTop: 2, fontStyle: 'italic' },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ccc' },
  progressActive: { backgroundColor: COLORS.primary },
  progressBar: { width: 50, height: 3, backgroundColor: '#ccc', marginHorizontal: 4 },
  progressBarActive: { backgroundColor: COLORS.primary },

  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24,
    flex: 1,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 14, textAlign: 'center' },

  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12,
    paddingHorizontal: 12, height: 50, backgroundColor: '#FAFAFA',
  },
  inputError: { borderColor: COLORS.warning },
  input: { flex: 1, fontSize: 16, color: COLORS.text, marginLeft: 10 },
  errorText: { color: COLORS.warning, fontSize: 12, marginTop: 4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
    flexDirection: 'row', elevation: 2, gap: 6,
  },
  registerBtn: { flex: 1 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52,
    borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary, gap: 4,
  },
  backBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },

  loginLink: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  loginLinkText: { fontSize: 14, color: '#666' },
  linkText: { color: COLORS.primary, fontWeight: '700' },
});
