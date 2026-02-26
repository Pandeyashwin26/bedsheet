import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { COLORS } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export default function AlertsScreen({ navigation }) {
    const { t } = useLanguage();
    const [alerts, setAlerts] = useState([]);

    const STATIC_ALERTS = [
        {
            id: 'neighbor', type: 'neighbor', urgency: 4,
            color: '#E65100', bgColor: '#FFF3E0', borderColor: '#FFCC80',
            icon: '👥',
            message: t('alerts.supplyAlert', { crop: 'Onion', district: 'Nashik' }),
            action: t('alerts.checkOther'),
            time: t('alerts.hoursAgo', { n: 2 }),
        },
        {
            id: 'scheme', type: 'scheme', urgency: 5,
            color: '#1565C0', bgColor: '#E3F2FD', borderColor: '#90CAF9',
            icon: '🏛️',
            message: t('alerts.schemeAlert'),
            action: t('alerts.viewSchemes'),
            time: t('alerts.hoursAgo', { n: 5 }),
        },
        {
            id: 'harvest', type: 'harvest', urgency: 6,
            color: '#2E7D32', bgColor: '#E8F5E9', borderColor: '#A5D6A7',
            icon: '⏰',
            message: t('alerts.harvestAlert', { crop: 'Onion' }),
            action: t('alerts.viewPlan'),
            time: t('alerts.hoursAgo', { n: 8 }),
        },
    ];

    const TYPE_LABELS = {
        weather: t('alerts.typeWeather'),
        price: t('alerts.typePrice'),
        neighbor: t('alerts.typeSupply'),
        scheme: t('alerts.typeScheme'),
        harvest: t('alerts.typeCrop'),
        info: t('alerts.typeInfo'),
    };

    useEffect(() => {
        setAlerts([...STATIC_ALERTS].sort((a, b) => a.urgency - b.urgency));
    }, []);

    const renderAlert = ({ item }) => (
        <Card
            style={[
                styles.alertCard,
                { borderLeftColor: item.color, backgroundColor: item.bgColor },
            ]}
        >
            <Card.Content style={styles.alertContent}>
                <View style={styles.alertTopRow}>
                    <Text style={styles.alertIcon}>{item.icon}</Text>
                    <View style={styles.alertBadge}>
                        <Text style={[styles.alertBadgeText, { color: item.color }]}>
                            {TYPE_LABELS[item.type] || item.type}
                        </Text>
                    </View>
                    <Text style={styles.alertTime}>{item.time}</Text>
                </View>
                <Text style={[styles.alertMessage, { color: item.color }]}>
                    {item.message}
                </Text>
                {item.action ? (
                    <TouchableOpacity
                        style={[styles.alertAction, { borderColor: item.color }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            if (item.type === 'scheme') navigation.navigate('Schemes');
                            else if (item.type === 'price') navigation.navigate('MainTabs', { screen: 'Market' });
                            else if (item.type === 'harvest') navigation.navigate('Recommendation');
                        }}
                    >
                        <Text style={[styles.alertActionText, { color: item.color }]}>
                            {item.action}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.screen}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title={t('alerts.header')}
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>

            <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                renderItem={renderAlert}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🔔</Text>
                        <Text style={styles.emptyText}>{t('alerts.noAlerts')}</Text>
                    </View>
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
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 30,
        rowGap: 10,
    },
    alertCard: {
        borderRadius: 14,
        borderLeftWidth: 4,
        overflow: 'hidden',
        elevation: 2,
    },
    alertContent: { paddingVertical: 14, rowGap: 10 },
    alertTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    alertIcon: { fontSize: 22 },
    alertBadge: {
        backgroundColor: '#FFFFFF80',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    alertBadgeText: { fontSize: 11, fontWeight: '700' },
    alertTime: { marginLeft: 'auto', fontSize: 11, color: '#8A9BA8' },
    alertMessage: {
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 23,
    },
    alertAction: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
    },
    alertActionText: { fontSize: 13, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: '#5D6A72' },
});
