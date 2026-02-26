import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ActivityIndicator, Appbar, Button, Card, Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { COLORS } from '../theme/colors';
import { CROP_OPTIONS } from '../data/agriOptions';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';

const TYPE_COLORS = {
    subsidy: { bg: '#E8F5E9', text: '#2E7D32', label: 'सब्सिडी' },
    insurance: { bg: '#E3F2FD', text: '#1565C0', label: 'बीमा' },
    loan: { bg: '#FFF3E0', text: '#E65100', label: 'लोन' },
    msp: { bg: '#F3E5F5', text: '#7B1FA2', label: 'MSP' },
};

const STATE_FROM_COORDS = (lat, lon) => {
    if (lat >= 15.5 && lat <= 22.0 && lon >= 72.5 && lon <= 80.5) return 'Maharashtra';
    if (lat >= 20.0 && lat <= 24.5 && lon >= 74.0 && lon <= 84.5) return 'Madhya Pradesh';
    if (lat >= 25.0 && lat <= 30.5 && lon >= 77.0 && lon <= 84.5) return 'Uttar Pradesh';
    if (lat >= 28.0 && lat <= 33.0 && lon >= 73.5 && lon <= 77.5) return 'Haryana';
    if (lat >= 29.5 && lat <= 33.5 && lon >= 74.0 && lon <= 80.0) return 'Punjab';
    if (lat >= 11.0 && lat <= 18.0 && lon >= 76.0 && lon <= 80.5) return 'Karnataka';
    return 'Maharashtra';
};

const MOCK_SCHEMES = [
    {
        name: 'PM-KISAN सम्मान निधि',
        benefit_amount: '₹6,000 प्रति वर्ष',
        eligibility: 'सभी छोटे और सीमांत किसान जिनके पास 2 हेक्टेयर तक ज़मीन है',
        how_to_apply: 'pmkisan.gov.in पर आधार से रजिस्टर करें',
        deadline: '2025-03-31',
        scheme_type: 'subsidy',
        url: 'https://pmkisan.gov.in',
    },
    {
        name: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
        benefit_amount: 'फसल नुकसान का 80% तक coverage',
        eligibility: 'सभी किसान — खरीफ और रबी फसलों के लिए',
        how_to_apply: 'नज़दीकी बैंक या CSC सेंटर पर apply करें',
        deadline: '2025-04-15',
        scheme_type: 'insurance',
        url: 'https://pmfby.gov.in',
    },
    {
        name: 'Kisan Credit Card (KCC)',
        benefit_amount: '₹3 लाख तक 4% ब्याज पर लोन',
        eligibility: 'सभी किसान — PM-KISAN लाभार्थी प्राथमिकता पर',
        how_to_apply: 'अपने बैंक ब्रांच में KCC application form भरें',
        deadline: null,
        scheme_type: 'loan',
        url: 'https://www.nabard.org',
    },
    {
        name: 'MSP — न्यूनतम समर्थन मूल्य',
        benefit_amount: '₹2,275/quintal (गेहूं 2024-25)',
        eligibility: 'सभी किसान जो सरकारी मंडी में बेचते हैं',
        how_to_apply: 'नज़दीकी APMC मंडी में MSP पर बिक्री करें',
        deadline: null,
        scheme_type: 'msp',
        url: 'https://farmer.gov.in',
    },
];

const fetchSchemesFromAI = async (crop, state) => {
    if (!GOOGLE_API_KEY) return null;

    try {
        const prompt = `List 4 real active Indian government schemes for a ${crop} farmer in ${state} in 2024-25. Return ONLY a JSON array:
[{
  "name": "string",
  "benefit_amount": "string (e.g. '₹6,000 per year')",
  "eligibility": "string (one line, simple Hindi or English)",
  "how_to_apply": "string (one line)",
  "deadline": "string | null",
  "scheme_type": "subsidy | insurance | loan | msp"
}]
Use only real, active schemes. No markdown, just JSON.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
                }),
            }
        );

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch {
        return null;
    }
};

export default function SchemesScreen({ navigation }) {
    const [state, setState] = useState('Maharashtra');
    const [selectedCrop, setSelectedCrop] = useState('Onion');
    const [schemes, setSchemes] = useState(MOCK_SCHEMES);
    const [loading, setLoading] = useState(false);
    const [fromAI, setFromAI] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                    const detectedState = STATE_FROM_COORDS(loc.coords.latitude, loc.coords.longitude);
                    setState(detectedState);
                }
            } catch { /* use default */ }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const aiSchemes = await fetchSchemesFromAI(selectedCrop, state);
            if (aiSchemes && aiSchemes.length > 0) {
                setSchemes(aiSchemes);
                setFromAI(true);
            } else {
                setSchemes(MOCK_SCHEMES);
                setFromAI(false);
            }
            setLoading(false);
        })();
    }, [selectedCrop, state]);

    const getDaysRemaining = (deadline) => {
        if (!deadline) return null;
        const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : null;
    };

    const renderScheme = ({ item, index }) => {
        const typeConfig = TYPE_COLORS[item.scheme_type] || TYPE_COLORS.subsidy;
        const daysLeft = getDaysRemaining(item.deadline);

        return (
            <Card style={styles.schemeCard}>
                <Card.Content style={styles.schemeContent}>
                    <View style={styles.schemeTopRow}>
                        <Text style={styles.schemeName}>{item.name}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
                            <Text style={[styles.typeBadgeText, { color: typeConfig.text }]}>
                                {typeConfig.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.benefitAmount}>{item.benefit_amount}</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>पात्रता:</Text>
                        <Text style={styles.detailValue}>{item.eligibility}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>कैसे apply करें:</Text>
                        <Text style={styles.detailValue}>{item.how_to_apply}</Text>
                    </View>

                    {daysLeft !== null && daysLeft <= 30 ? (
                        <View style={styles.deadlineBox}>
                            <Text style={styles.deadlineText}>
                                🔴 जल्दी करें — {daysLeft} दिन बचे हैं
                            </Text>
                        </View>
                    ) : null}

                    <Button
                        mode="contained"
                        style={styles.applyButton}
                        buttonColor={typeConfig.text}
                        onPress={() => {
                            const url = item.url || `https://www.google.com/search?q=${encodeURIComponent(item.name + ' apply online')}`;
                            Linking.openURL(url);
                        }}
                    >
                        अभी Apply करें →
                    </Button>
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.screen}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="सरकारी योजनाएं 🏛️"
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>

            <View style={styles.stateRow}>
                <Text style={styles.stateLabel}>📍 {state}</Text>
                {fromAI ? (
                    <Text style={styles.aiLabel}>✨ AI-powered</Text>
                ) : null}
            </View>

            {/* Crop selector */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.cropScroll}
                contentContainerStyle={styles.cropScrollContent}
            >
                {CROP_OPTIONS.map((crop) => (
                    <TouchableOpacity
                        key={crop}
                        style={[
                            styles.cropPill,
                            selectedCrop === crop && styles.cropPillActive,
                        ]}
                        onPress={() => setSelectedCrop(crop)}
                    >
                        <Text
                            style={[
                                styles.cropPillText,
                                selectedCrop === crop && styles.cropPillTextActive,
                            ]}
                        >
                            {crop}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loaderText}>योजनाएं खोजी जा रही हैं...</Text>
                </View>
            ) : (
                <FlatList
                    data={schemes}
                    keyExtractor={(item, i) => `${item.name}-${i}`}
                    renderItem={renderScheme}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    stateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F0F4F8',
    },
    stateLabel: { fontSize: 14, fontWeight: '600', color: '#3A4A56' },
    aiLabel: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

    cropScroll: { flexGrow: 0 },
    cropScrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        columnGap: 8,
    },
    cropPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#EDF1F5',
    },
    cropPillActive: { backgroundColor: COLORS.primary },
    cropPillText: { fontSize: 14, fontWeight: '600', color: '#4F5B62' },
    cropPillTextActive: { color: '#FFFFFF' },

    loader: { alignItems: 'center', paddingTop: 60 },
    loaderText: { marginTop: 12, color: '#58656D', fontSize: 14 },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 30,
        rowGap: 12,
    },
    schemeCard: {
        borderRadius: 16,
        backgroundColor: COLORS.card,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
    },
    schemeContent: { paddingVertical: 16, rowGap: 10 },
    schemeTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        columnGap: 8,
    },
    schemeName: {
        flex: 1,
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.text,
        lineHeight: 24,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    typeBadgeText: { fontSize: 12, fontWeight: '700' },
    benefitAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2E7D32',
    },
    detailRow: { flexDirection: 'row', columnGap: 6 },
    detailLabel: { fontSize: 13, fontWeight: '700', color: '#5D6A72' },
    detailValue: { flex: 1, fontSize: 13, color: '#3A4A56', lineHeight: 20 },
    deadlineBox: {
        backgroundColor: '#FFEBEE',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#EF9A9A',
    },
    deadlineText: { fontSize: 14, fontWeight: '700', color: '#C62828' },
    applyButton: { borderRadius: 12, marginTop: 4 },
});
