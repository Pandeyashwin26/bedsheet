import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, ELEVATION, RADIUS, SPACING, TYPOGRAPHY } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { fetchCurrentWeather } from '../services/apiService';

const WEATHER_ICONS = {
  rain:     { name: 'weather-pouring',  color: '#C62828', bg: '#FFEBEE' },
  heat:     { name: 'thermometer-high', color: '#E65100', bg: '#FFF3E0' },
  allclear: { name: 'weather-sunny',    color: '#2E7D32', bg: '#E8F5E9' },
};

export default function WeatherBanner({ district = 'Nashik', onPress }) {
    const { t } = useLanguage();
    const [weather, setWeather] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await fetchCurrentWeather(district);
                if (cancelled) return;
                const data = {
                    temp: result.temp ?? 0,
                    rain_mm: result.rain_mm ?? 0,
                    humidity: result.humidity ?? 0,
                    windspeed: result.windspeed ?? 0,
                    description: result.description ?? '',
                };
                setWeather(data);

                // Determine alert type
                if (data.rain_mm > 5) {
                    setAlertInfo({ ...WEATHER_ICONS.rain, message: t('weather.rainAlert') });
                } else if (data.temp > 38) {
                    setAlertInfo({ ...WEATHER_ICONS.heat, message: t('weather.heatAlert', { temp: Math.round(data.temp) }) });
                } else {
                    setAlertInfo({ ...WEATHER_ICONS.allclear, message: t('weather.allClear') });
                }
            } catch {
                if (!cancelled) {
                    setAlertInfo({ ...WEATHER_ICONS.allclear, message: t('weather.allClear') });
                }
            }
        })();
        return () => { cancelled = true; };
    }, [district]);

    if (!weather && !alertInfo) return null;

    return (
        <TouchableOpacity style={styles.banner} activeOpacity={0.75} onPress={onPress}>
            {/* Live temperature */}
            {weather && (
                <View style={styles.tempSection}>
                    <Text style={styles.tempValue}>{Math.round(weather.temp)}°</Text>
                    <Text style={styles.tempDesc} numberOfLines={1}>{weather.description || district}</Text>
                </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Alert */}
            {alertInfo && (
                <View style={styles.alertSection}>
                    <View style={[styles.alertIconWrap, { backgroundColor: alertInfo.bg }]}>
                        <MaterialCommunityIcons name={alertInfo.name} size={20} color={alertInfo.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.alertText, { color: alertInfo.color }]} numberOfLines={2}>
                            {alertInfo.message}
                        </Text>
                        <Text style={styles.tapHint}>{t('weather.tapForAlerts')}</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...ELEVATION.level1,
    },
    tempSection: {
        alignItems: 'center',
        paddingRight: SPACING.md,
    },
    tempValue: {
        ...TYPOGRAPHY.headlineMedium,
        color: COLORS.primary,
        fontWeight: '800',
    },
    tempDesc: {
        ...TYPOGRAPHY.labelSmall,
        color: COLORS.onSurfaceVariant,
        marginTop: 2,
        textTransform: 'capitalize',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.outline,
        marginRight: SPACING.md,
        opacity: 0.3,
    },
    alertSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    alertIconWrap: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertText: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '700',
        lineHeight: 18,
    },
    tapHint: {
        ...TYPOGRAPHY.labelSmall,
        color: COLORS.onSurfaceVariant,
        marginTop: 2,
    },
});
