import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../theme/colors';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

// Alert templates based on weather + crop context
const generateAlerts = (weatherData, cropContext) => {
    const alerts = [];
    const { temp, rain_mm, humidity } = weatherData;

    if (rain_mm > 5) {
        alerts.push({
            id: 'rain',
            type: 'weather',
            urgency: 1,
            color: '#C62828',
            bgColor: '#FFEBEE',
            borderColor: '#EF9A9A',
            icon: '🌧️',
            message: `कल बारिश आने वाली है! आज ही फसल काटें — खुले में रखी फसल खराब हो सकती है।`,
        });
    }

    if (temp > 38) {
        alerts.push({
            id: 'heat',
            type: 'weather',
            urgency: 2,
            color: '#E65100',
            bgColor: '#FFF3E0',
            borderColor: '#FFCC80',
            icon: '🌡️',
            message: `तेज गर्मी (${Math.round(temp)}°C) — आज stored फसल चेक करें। Spoilage risk बढ़ गया है।`,
        });
    }

    if (cropContext?.priceSpike) {
        alerts.push({
            id: 'price',
            type: 'price',
            urgency: 3,
            color: '#2E7D32',
            bgColor: '#E8F5E9',
            borderColor: '#A5D6A7',
            icon: '📈',
            message: `${cropContext.district || 'Nashik'} मंडी में भाव ${cropContext.spikePercent || 12}% बढ़े — आज बेचने का अच्छा मौका।`,
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            id: 'allclear',
            type: 'info',
            urgency: 10,
            color: '#2E7D32',
            bgColor: '#E8F5E9',
            borderColor: '#A5D6A7',
            icon: '🟢',
            message: 'अगले 5 दिन मौसम ठीक है। फसल के लिए सुरक्षित समय।',
        });
    }

    return alerts.sort((a, b) => a.urgency - b.urgency);
};

// Simulated weather fetch - in production would use Google Weather API
const fetchWeatherData = async (district) => {
    try {
        // Simulate varying weather conditions for demo
        const hour = new Date().getHours();
        const isMonsoon = new Date().getMonth() >= 5 && new Date().getMonth() <= 9;

        return {
            temp: 28 + Math.random() * 15,
            rain_mm: isMonsoon ? Math.random() * 12 : Math.random() * 3,
            humidity: 50 + Math.random() * 40,
            wind_speed: 5 + Math.random() * 15,
            description: isMonsoon ? 'बादल छाए रहेंगे' : 'साफ मौसम',
        };
    } catch {
        return { temp: 32, rain_mm: 0, humidity: 60, wind_speed: 8, description: 'Data unavailable' };
    }
};

export default function WeatherBanner({ district = 'Nashik', cropContext = {}, onPress }) {
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        (async () => {
            const weather = await fetchWeatherData(district);
            const alerts = generateAlerts(weather, cropContext);
            setAlert(alerts[0]); // Show most urgent alert
        })();
    }, [district, cropContext]);

    if (!alert) return null;

    return (
        <TouchableOpacity
            style={[
                styles.banner,
                { backgroundColor: alert.bgColor, borderColor: alert.borderColor },
            ]}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <Text style={styles.bannerIcon}>{alert.icon}</Text>
            <View style={styles.bannerContent}>
                <Text style={[styles.bannerText, { color: alert.color }]} numberOfLines={3}>
                    {alert.message}
                </Text>
                <Text style={styles.tapHint}>Tap for all alerts →</Text>
            </View>
        </TouchableOpacity>
    );
}

export { generateAlerts, fetchWeatherData };

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        columnGap: 10,
    },
    bannerIcon: { fontSize: 24, marginTop: 2 },
    bannerContent: { flex: 1 },
    bannerText: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 22,
    },
    tapHint: {
        fontSize: 12,
        color: '#7A8A96',
        marginTop: 4,
        fontWeight: '600',
    },
});
